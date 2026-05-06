const CACHE_BUSTER_PARAM = "_ts";

function withCacheBuster(urlLike) {
  const url = new URL(urlLike, window.location.origin);
  url.searchParams.set(CACHE_BUSTER_PARAM, `${Date.now()}`);
  return url.toString();
}

export async function noStoreFetch(input, init = {}) {
  const method = (init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init.headers ?? {}).forEach((value, key) => headers.set(key, value));

  headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  headers.set("Pragma", "no-cache");

  let nextInput = input;
  if (method === "GET" || method === "HEAD") {
    if (typeof input === "string") {
      nextInput = withCacheBuster(input);
    } else if (input instanceof URL) {
      nextInput = withCacheBuster(input.toString());
    } else if (input instanceof Request) {
      nextInput = new Request(withCacheBuster(input.url), input);
    }
  }

  return fetch(nextInput, {
    ...init,
    headers,
    cache: "no-store",
  });
}
