export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store",
      "Vary": "Authorization",
    },
  });
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed." }, 405);
}

export function badRequest(message) {
  return json({ error: message }, 400);
}

export function unauthorized(message = "Authentication required.") {
  return json({ error: message }, 401);
}

export function serverError(error) {
  const status = Number(error?.status ?? error?.statusCode ?? 500);

  if (status >= 500) {
    console.error(error);
  }

  return json({ error: error.message ?? "Unexpected server error." }, status);
}
