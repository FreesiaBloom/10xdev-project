import { z } from "zod";
import { GenerationService } from "@/lib/services/generations-service";
import type { APIRoute } from "astro";

export const prerender = false;

const GenerateFlashcardsCommandSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long.")
    .max(10000, "Source text must be at most 10000 characters long."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const command = GenerateFlashcardsCommandSchema.parse(body);

    const generationService = new GenerationService(locals.supabase);
    const result = await generationService.generateFlashcards(command);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error("Error processing generation request:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
