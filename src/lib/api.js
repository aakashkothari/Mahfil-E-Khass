import { getAccessToken } from "./authSession";
import { noStoreFetch } from "./noStoreFetch";

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function api(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...authHeaders(),
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
