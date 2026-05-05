import { supabaseAdmin } from "./supabase.js";

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    throw error;
  }

  return data.user ?? null;
}

export async function requireUser(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}
