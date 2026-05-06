import { requireUser } from "./_shared/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "./_shared/http.js";
import { supabaseAdmin } from "./_shared/supabase.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  try {
    const user = await requireUser(request);
    const { postId } = await request.json();

    if (!postId) {
      return badRequest("postId is required.");
    }

    const { data: existing } = await supabaseAdmin
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    let liked = false;
    if (existing?.id) {
      const { error } = await supabaseAdmin.from("likes").delete().eq("id", existing.id);
      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabaseAdmin.from("likes").insert({
        post_id: postId,
        user_id: user.id,
      });
      if (error?.code === "23505") {
        liked = true;
      } else if (error) {
        throw error;
      }
      if (!error) {
        liked = true;
      }
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("likes_count")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      throw postError;
    }

    return json({ liked, likesCount: post?.likes_count ?? 0 });
  } catch (error) {
    return serverError(error);
  }
}
