import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcards-service";
import { DatabaseError, RecordNotFoundError } from "@/lib/errors";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

const UpdateFlashcardCommandSchema = z.object({
  front: z.string().min(1).max(200).optional(),
  back: z.string().min(1).max(500).optional(),
});

export const PUT: APIRoute = async ({ params, request, locals, cookies }) => {
  const session = locals.session;
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const userId = session.user.id;
  const flashcardId = params.id;

  if (!flashcardId) {
    return new Response(JSON.stringify({ error: "Flashcard ID is required" }), { status: 400 });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const flashcardService = new FlashcardService(supabase);

  try {
    const body = await request.json();
    const validationResult = UpdateFlashcardCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
    }

    const updatedFlashcard = await flashcardService.updateFlashcard(userId, flashcardId, validationResult.data);

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof RecordNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    }
    if (error instanceof DatabaseError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    console.error(`Error in PUT /api/flashcards/${flashcardId}:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals, cookies, request }) => {
  const session = locals.session;
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const userId = session.user.id;
  const flashcardId = params.id;

  if (!flashcardId) {
    return new Response(JSON.stringify({ error: "Flashcard ID is required" }), { status: 400 });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const flashcardService = new FlashcardService(supabase);

  try {
    await flashcardService.deleteFlashcard(userId, flashcardId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof RecordNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    }
    if (error instanceof DatabaseError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    console.error(`Error in DELETE /api/flashcards/${flashcardId}:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
