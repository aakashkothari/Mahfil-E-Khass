import { supabaseAdmin } from "./supabase.js";

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    return null;
  }

  return data.user ?? null;
}

export async function requireUser(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }
  return user;
}
