import { json, serverError } from "./_shared/http.js";
import { calculateTrendingScore } from "./_shared/scoring.js";
import { supabaseAdmin } from "./_shared/supabase.js";

export const config = {
  schedule: "*/15 * * * *",
};

export default async function handler() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select("id, created_at");

    if (error) {
      throw error;
    }

    const [likesResult, commentsResult] = await Promise.all([
      supabaseAdmin.from("likes").select("post_id"),
      supabaseAdmin.from("comments").select("post_id"),
    ]);

    const likesByPost = new Map();
    for (const like of likesResult.data ?? []) {
      likesByPost.set(like.post_id, (likesByPost.get(like.post_id) ?? 0) + 1);
    }

    const commentsByPost = new Map();
    for (const comment of commentsResult.data ?? []) {
      commentsByPost.set(comment.post_id, (commentsByPost.get(comment.post_id) ?? 0) + 1);
    }

    await Promise.all(
      (posts ?? []).map((post) =>
        supabaseAdmin
          .from("posts")
          .update({
            likes_count: likesByPost.get(post.id) ?? 0,
            comments_count: commentsByPost.get(post.id) ?? 0,
            trending_score: calculateTrendingScore({
              likesCount: likesByPost.get(post.id) ?? 0,
              commentsCount: commentsByPost.get(post.id) ?? 0,
              createdAt: post.created_at,
            }),
          })
          .eq("id", post.id),
      ),
    );

    return json({ ok: true, updated: posts?.length ?? 0 });
  } catch (error) {
    return serverError(error);
  }
}
