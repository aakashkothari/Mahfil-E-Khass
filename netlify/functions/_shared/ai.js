const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const TRANSLATION_PROMPT =
  "You are an expert Urdu/Hindi translator. The user will provide text written in Roman script (Hinglish/Roman Urdu). Return ONLY the Devanagari Hindi translation. No explanation. Preserve poetic tone.";
const MOOD_PROMPT =
  "Classify this shayari into exactly one word from: ishq, dard, tanhai, khushi, gussa, umeed, yaadein. Return only the word.";
const SPOTLIGHT_PROMPT =
  "You are a poetry critic. Write 2 short sentences appreciating this shayari. Be poetic and warm. Max 40 words.";
const TRANSLITERATION_PROMPT =
  "You are a literary editor. The user will provide Roman Urdu or Hinglish shayari. Return ONLY a polished, readable Roman-script transliteration, preserving tone and cadence.";

async function groqCompletion(systemPrompt, text) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq failed with ${response.status}.`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim();
}

async function geminiCompletion(systemPrompt, text) {
  const response = await fetch(
    `${GEMINI_URL}?key=${encodeURIComponent(process.env.GEMINI_API_KEY ?? "")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${text}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini failed with ${response.status}.`);
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

async function generateWithFallback(systemPrompt, text) {
  if (process.env.GROQ_API_KEY) {
    try {
      const groqResult = await groqCompletion(systemPrompt, text);
      if (groqResult) {
        return groqResult;
      }
    } catch (error) {
      console.warn("Groq fallback triggered:", error.message);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    const geminiResult = await geminiCompletion(systemPrompt, text);
    if (geminiResult) {
      return geminiResult;
    }
  }

  throw new Error("Both AI providers failed.");
}

function normalizeMood(value) {
  const mood = value?.toLowerCase().trim();
  return ["ishq", "dard", "tanhai", "khushi", "gussa", "umeed", "yaadein"].includes(mood)
    ? mood
    : "umeed";
}

export async function translateRomanToHindi(text) {
  return generateWithFallback(TRANSLATION_PROMPT, text);
}

export async function detectMood(text) {
  try {
    const result = await generateWithFallback(MOOD_PROMPT, text);
    return normalizeMood(result);
  } catch {
    const lowered = text.toLowerCase();
    if (/(ishq|mohabbat|dil|jaan)/.test(lowered)) return "ishq";
    if (/(dard|gham|zakhm|rona)/.test(lowered)) return "dard";
    if (/(tanha|tanhai|akel)/.test(lowered)) return "tanhai";
    if (/(khushi|hansi|muskaan)/.test(lowered)) return "khushi";
    if (/(gussa|ghussa|nafrat)/.test(lowered)) return "gussa";
    if (/(umeed|subah|roshni)/.test(lowered)) return "umeed";
    if (/(yaad|yaadein|purani)/.test(lowered)) return "yaadein";
    return "umeed";
  }
}

export async function generateSpotlightNote(text) {
  try {
    return await generateWithFallback(SPOTLIGHT_PROMPT, text);
  } catch {
    return "In alfaaz mein ek narm si aag hai. Yeh sher der tak saath chalta rehta hai.";
  }
}

export async function refineTransliteration(text) {
  return generateWithFallback(TRANSLITERATION_PROMPT, text);
}
