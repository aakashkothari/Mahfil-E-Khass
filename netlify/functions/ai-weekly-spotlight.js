import { generateSpotlightNote } from "./_shared/ai.js";
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

    const note = await generateSpotlightNote(text.trim());
    return json({ note });
  } catch (error) {
    return serverError(error);
  }
}
