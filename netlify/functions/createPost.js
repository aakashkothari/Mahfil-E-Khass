import { requireUser } from "./_shared/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "./_shared/http.js";
import { calculateTrendingScore } from "./_shared/scoring.js";
import { supabaseAdmin } from "./_shared/supabase.js";
import {
  detectMood,
  refineTransliteration,
  translateRomanToHindi,
} from "./_shared/ai.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  try {
    const user = await requireUser(request);
    const body = await request.json();

    if (!body.contentRoman?.trim()) {
      return badRequest("Roman shayari is required.");
    }

    const contentRoman = body.contentRoman.trim();
    const contentHindi =
      body.contentHindi?.trim() || (await translateRomanToHindi(contentRoman).catch(() => ""));
    const contentTransliterated =
      body.contentTransliterated?.trim() ||
      (await refineTransliteration(contentRoman).catch(() => contentRoman));
    const moodTag = body.moodTag?.trim() || (await detectMood(contentRoman));
    const createdAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("posts")
      .insert({
        author_id: user.id,
        content_roman: contentRoman,
        content_hindi: contentHindi,
        content_transliterated: contentTransliterated,
        mood_tag: moodTag,
        language: "hinglish",
        likes_count: 0,
        comments_count: 0,
        trending_score: calculateTrendingScore({
          likesCount: 0,
          commentsCount: 0,
          createdAt,
        }),
      })
      .select("*, author:users!posts_author_id_fkey(*)")
      .single();

    if (error) {
      throw error;
    }

    return json({ post: data }, 201);
  } catch (error) {
    return serverError(error);
  }
}
