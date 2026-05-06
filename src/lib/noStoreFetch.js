const CACHE_BUSTER_PARAM = "_ts";

function toUrl(urlLike) {
  return new URL(urlLike, window.location.origin);
}

function shouldAppendCacheBuster(url) {
  return url.origin === window.location.origin && url.pathname.startsWith("/api/");
}

function withCacheBuster(urlLike) {
  const url = toUrl(urlLike);
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
      const url = toUrl(input);
      nextInput = shouldAppendCacheBuster(url) ? withCacheBuster(url.toString()) : input;
    } else if (input instanceof URL) {
      nextInput = shouldAppendCacheBuster(input) ? withCacheBuster(input.toString()) : input;
    } else if (input instanceof Request) {
      const url = toUrl(input.url);
      nextInput = shouldAppendCacheBuster(url) ? new Request(withCacheBuster(url.toString()), input) : input;
    }
  }

  return fetch(nextInput, {
    ...init,
    headers,
    cache: "no-store",
  });
}
