import { supabaseAdmin } from "./supabase.js";

export async function hydratePosts(posts, currentUserId) {
  if (!posts.length) {
    return [];
  }

  const ids = posts.map((post) => post.id);

  const likePromise = currentUserId
    ? supabaseAdmin
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUserId)
        .in("post_id", ids)
    : Promise.resolve({ data: [] });

  const commentPromise = supabaseAdmin
    .from("comments")
    .select("id, post_id, body, created_at, author:users!comments_author_id_fkey(id, pen_name)")
    .in("post_id", ids)
    .order("created_at", { ascending: false });

  const [{ data: likedRows }, { data: commentRows }] = await Promise.all([
    likePromise,
    commentPromise,
  ]);

  const likedIds = new Set((likedRows ?? []).map((row) => row.post_id));
  const commentsMap = new Map();

  for (const comment of commentRows ?? []) {
    const bucket = commentsMap.get(comment.post_id) ?? [];
    if (bucket.length < 3) {
      bucket.push(comment);
      commentsMap.set(comment.post_id, bucket);
    }
  }

  return posts.map((post) => ({
    ...post,
    liked_by_me: likedIds.has(post.id),
    comments_preview: commentsMap.get(post.id) ?? [],
  }));
}
