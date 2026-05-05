import { requireUser } from "./_shared/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "./_shared/http.js";
import { supabaseAdmin } from "./_shared/supabase.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  try {
    const user = await requireUser(request);
    const { postId, body } = await request.json();

    if (!postId || !body?.trim()) {
      return badRequest("postId and comment body are required.");
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        body: body.trim(),
      })
      .select("id, post_id, body, created_at, author:users!comments_author_id_fkey(id, pen_name)")
      .single();

    if (error) {
      throw error;
    }

    const { count, error: countError } = await supabaseAdmin
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) {
      throw countError;
    }

    const commentsCount = count ?? 0;

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({ comments_count: commentsCount })
      .eq("id", postId);

    if (updateError) {
      throw updateError;
    }

    return json({
      comment: inserted,
      commentsCount,
    });
  } catch (error) {
    return serverError(error);
  }
}
