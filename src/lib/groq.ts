import OpenAI from "openai";

/**
 * Groq exposes an OpenAI-compatible API, so we reuse the `openai` SDK
 * and just point it at Groq's base URL. This also makes it trivial to
 * swap to OpenAI / OpenRouter / Together later without touching callers.
 */
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
