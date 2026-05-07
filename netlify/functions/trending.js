import { getUserFromRequest } from "./_shared/auth.js";
import { json, methodNotAllowed, serverError } from "./_shared/http.js";
import { hydratePosts } from "./_shared/posts.js";
import { supabaseAdmin } from "./_shared/supabase.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    const url = new URL(request.url);
    const window = url.searchParams.get("window") ?? "daily";
    const mood = url.searchParams.get("mood");
    const cursor = Number(url.searchParams.get("cursor") ?? 0);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 10), 20);
    const user = await getUserFromRequest(request);

    let query = supabaseAdmin
      .from("posts")
      .select("*, author:users!posts_author_id_fkey(*)")
      .order("trending_score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(cursor, cursor + limit);

    if (mood) {
      query = query.eq("mood_tag", mood);
    }

    if (window === "daily") {
      query = query.gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    } else if (window === "weekly") {
      query = query.gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      );
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const posts = await hydratePosts(data ?? [], user?.id);
    const nextCursor = (data ?? []).length > limit ? cursor + limit : cursor + (data ?? []).length;

    return json({
      posts: posts.slice(0, limit),
      nextCursor: (data ?? []).length > limit ? `${nextCursor}` : null,
    });
  } catch (error) {
    return serverError(error);
  }
}
