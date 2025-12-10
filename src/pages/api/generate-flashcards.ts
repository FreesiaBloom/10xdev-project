import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "../../lib/services/openrouter.service";

// 1. Zdefiniuj schemat oczekiwanej odpowiedzi
const FlashcardSchema = z.object({
  front: z.string().describe("The question or term on the front of the flashcard."),
  back: z.string().describe("The answer or definition on the back of the flashcard."),
});

const FlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(1).describe("An array of generated flashcards."),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const topic = body.topic;

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "Topic is required." }), { status: 400 });
    }

    // 2. Utwórz instancję usługi
    const openRouterService = new OpenRouterService();

    // 3. Wywołaj metodę, przekazując prompty i schemat
    const result = await openRouterService.generateStructuredResponse({
      systemPrompt:
        "You are a helpful assistant that creates flashcards. You always respond in the exact JSON format requested.",
      userPrompt: `Create 3 flashcards about ${topic}.`,
      responseSchema: FlashcardsResponseSchema,
    });

    // 4. Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 5. Obsłuż potencjalne błędy z usługi
    console.error(`[API Error] /generate-flashcards:`, error);
    const status = error.status || 500;
    const message = error.message || "An internal server error occurred.";
    return new Response(JSON.stringify({ error: message }), { status });
  }
};
