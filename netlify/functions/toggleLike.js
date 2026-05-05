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
      if (error) {
        throw error;
      }
      liked = true;
    }

    const { count, error: countError } = await supabaseAdmin
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) {
      throw countError;
    }

    const likesCount = count ?? 0;

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({ likes_count: likesCount })
      .eq("id", postId);

    if (updateError) {
      throw updateError;
    }

    return json({ liked, likesCount });
  } catch (error) {
    return serverError(error);
  }
}
