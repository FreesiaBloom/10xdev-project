import type { APIRoute } from "astro";
import {
  CreateFlashcardsCommandSchema,
  ListFlashcardsQuerySchema,
} from "@/lib/validation/flashcard-schemas";
import * as flashcardsService from "@/lib/services/flashcards-service";
import { handleApiError } from "@/lib/errors";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase, user } = locals;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const queryParams = Object.fromEntries(url.searchParams.entries());
  const validationResult = ListFlashcardsQuerySchema.safeParse(queryParams);

  if (!validationResult.success) {
    return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
  }

  try {
    const response = await flashcardsService.listFlashcards(supabase, user.id, validationResult.data);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = CreateFlashcardsCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
    }

    const createdFlashcards = await flashcardsService.createFlashcards(
      supabase,
      user.id,
      validationResult.data.flashcards
    );

    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
