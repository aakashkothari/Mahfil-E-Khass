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

export function serverError(error) {
  console.error(error);
  return json({ error: error.message ?? "Unexpected server error." }, 500);
}
