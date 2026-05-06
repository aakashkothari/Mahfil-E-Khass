import { supabase } from "./supabase";
import { noStoreFetch } from "./noStoreFetch";

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export async function api(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...(options.headers ?? {}),
  };

  const response = await noStoreFetch(`/api/${path}`, {
    ...options,
    credentials: options.credentials ?? "same-origin",
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Something went wrong.");
  }

  return payload;
}
