import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { GenerateFlashcardsCommandSchema } from "../../../lib/validation/generation-schemas";
import { GenerationService } from "../../../lib/services/generations-service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const command = GenerateFlashcardsCommandSchema.parse(body);

    const generationService = new GenerationService(locals.supabase);
    const result = await generationService.generateFlashcards(command);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Validation failed", details: error.errors }), {
        status: 400,
      });
    }

    console.error("Error generating flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
