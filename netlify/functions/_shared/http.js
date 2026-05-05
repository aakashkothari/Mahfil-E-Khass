export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
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
