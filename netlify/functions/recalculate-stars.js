import { json, serverError } from "./_shared/http.js";
import { calculateStars, tierFromStars } from "./_shared/scoring.js";
import { supabaseAdmin } from "./_shared/supabase.js";

export const config = {
  schedule: "0 * * * *",
};

export default async function handler() {
  try {
    const [{ data: users }, { data: posts }, { data: likes }, { data: comments }] =
      await Promise.all([
        supabaseAdmin.from("users").select("id"),
        supabaseAdmin
          .from("posts")
          .select("id, author_id, is_spotlight, trending_score, created_at")
          .order("trending_score", { ascending: false }),
        supabaseAdmin.from("likes").select("post_id"),
        supabaseAdmin.from("comments").select("post_id"),
      ]);

    const weeklySpotlightIds = (posts ?? [])
      .filter(
        (post) => new Date(post.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000,
      )
      .slice(0, 3)
      .map((post) => post.id);

    await supabaseAdmin.from("posts").update({ is_spotlight: false }).neq("id", "");
    if (weeklySpotlightIds.length) {
      await supabaseAdmin.from("posts").update({ is_spotlight: true }).in("id", weeklySpotlightIds);
    }

    const postMap = new Map((posts ?? []).map((post) => [post.id, post]));
    const stats = new Map((users ?? []).map((entry) => [entry.id, { likes: 0, comments: 0, spotlight: 0 }]));

    for (const like of likes ?? []) {
      const post = postMap.get(like.post_id);
      if (!post) continue;
      const bucket = stats.get(post.author_id);
      if (bucket) bucket.likes += 1;
    }

    for (const comment of comments ?? []) {
      const post = postMap.get(comment.post_id);
      if (!post) continue;
      const bucket = stats.get(post.author_id);
      if (bucket) bucket.comments += 1;
    }

    for (const postId of weeklySpotlightIds) {
      const post = postMap.get(postId);
      if (!post) continue;
      const bucket = stats.get(post.author_id);
      if (bucket) bucket.spotlight += 1;
    }

    await Promise.all(
      [...stats.entries()].map(([userId, bucket]) => {
        const stars = calculateStars({
          likesCount: bucket.likes,
          commentsCount: bucket.comments,
          spotlightCount: bucket.spotlight,
        });

        return supabaseAdmin
          .from("users")
          .update({
            stars_total: stars,
            tier: tierFromStars(stars),
          })
          .eq("id", userId);
      }),
    );

    return json({ ok: true, updatedUsers: users?.length ?? 0, spotlightPosts: weeklySpotlightIds });
  } catch (error) {
    return serverError(error);
  }
}
