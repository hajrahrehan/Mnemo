import { z } from "zod";
import { GROQ_MODEL, groq } from "./groq";

export const CardType = z.enum(["definition", "concept", "comparison", "cloze"]);
export type CardType = z.infer<typeof CardType>;

export const FlashcardSchema = z.object({
  type: CardType,
  question: z.string().min(4),
  answer: z.string().min(1),
  source_page: z.number().int().nonnegative().optional(),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

const FlashcardsResponse = z.object({
  cards: z.array(FlashcardSchema).min(1),
});

const SYSTEM_PROMPT = `You are an expert study-tool author. Given a passage from
a textbook, you produce high-quality flashcards that help a student
remember the material long-term.

Rules:
- Mix card types: "definition" (term → meaning), "concept" (question →
  explanation), "comparison" (contrast two ideas), "cloze" (fill-in-blank
  using {{c1::hidden text}}).
- Prefer 5–12 cards per passage. Never duplicate.
- Questions must be answerable from the passage alone.
- Answers: concise (one sentence or a short list). No filler.
- Never invent facts not in the passage.
- Output structured JSON via the provided tool.`;

export async function generateFlashcards(params: {
  passage: string;
  sourcePage?: number;
}): Promise<Flashcard[]> {
  const { passage, sourcePage } = params;

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          sourcePage !== undefined
            ? `Passage (from page ${sourcePage}):\n\n${passage}`
            : `Passage:\n\n${passage}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "create_flashcards",
          description: "Emit a batch of flashcards for the passage.",
          parameters: {
            type: "object",
            properties: {
              cards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["definition", "concept", "comparison", "cloze"],
                    },
                    question: { type: "string" },
                    answer: { type: "string" },
                    source_page: { type: "integer" },
                  },
                  required: ["type", "question", "answer"],
                },
              },
            },
            required: ["cards"],
          },
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "create_flashcards" },
    },
  });

  const call = response.choices[0]?.message.tool_calls?.[0];
  if (!call || call.type !== "function") {
    throw new Error("Model did not return a tool call");
  }

  const args: unknown = JSON.parse(call.function.arguments);
  const parsed = FlashcardsResponse.parse(args);
  return parsed.cards;
}
