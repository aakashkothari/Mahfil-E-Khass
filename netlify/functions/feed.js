import { getUserFromRequest } from "./_shared/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "./_shared/http.js";
import { hydratePosts } from "./_shared/posts.js";
import { supabaseAdmin } from "./_shared/supabase.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope") ?? "latest";
    const mood = url.searchParams.get("mood");
    const cursor = Number(url.searchParams.get("cursor") ?? 0);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 10), 20);
    const user = await getUserFromRequest(request);

    let query = supabaseAdmin
      .from("posts")
      .select("*, author:users!posts_author_id_fkey(*)")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(cursor, cursor + limit);

    if (mood) {
      query = query.eq("mood_tag", mood);
    }

    if (scope === "following") {
      if (!user) {
        return json({ posts: [], nextCursor: null });
      }

      const { data: follows, error: followsError } = await supabaseAdmin
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followsError) {
        throw followsError;
      }

      const followingIds = follows.map((entry) => entry.following_id);
      if (!followingIds.length) {
        return json({ posts: [], nextCursor: null });
      }

      query = query.in("author_id", followingIds);
    } else if (scope !== "latest") {
      return badRequest("Unsupported feed scope.");
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const page = (data ?? []).slice(0, limit);
    const posts = await hydratePosts(page, user?.id);
    const nextCursor = (data ?? []).length > limit ? `${cursor + limit}` : null;

    return json({ posts, nextCursor });
  } catch (error) {
    return serverError(error);
  }
}
