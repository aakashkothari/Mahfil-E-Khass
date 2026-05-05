import { translateRomanToHindi } from "./_shared/ai.js";
import { badRequest, json, methodNotAllowed, serverError } from "./_shared/http.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  try {
    const { text } = await request.json();
    if (!text?.trim()) {
      return badRequest("text is required.");
    }

    const translation = await translateRomanToHindi(text.trim());
    return json({ translation });
  } catch (error) {
    return serverError(error);
  }
}
