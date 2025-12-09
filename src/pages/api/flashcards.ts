import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardService, DatabaseError } from "@/lib/services/flashcards-service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

export const ListFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  sort: z.string().optional().default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  source: z.enum(["manual", "ai_generated", "ai_edited"]).optional(),
  generation_id: z.coerce.number().int().positive().optional(),
});

const CreateFlashcardSchema = z
  .object({
    front: z.string().min(1, "Front cannot be empty.").max(200, "Front cannot exceed 200 characters."),
    back: z.string().min(1, "Back cannot be empty.").max(500, "Back cannot exceed 500 characters."),
    source: z.enum(["manual", "ai_generated", "ai_edited"]),
    generation_id: z.number().int().positive().nullable(),
  })
  .refine(
    (data) => {
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }
      if ((data.source === "ai_generated" || data.source === "ai_edited") && data.generation_id === null) {
        return false;
      }
      return true;
    },
    {
      message: "generation_id must be null for 'manual' source, and a number for AI-related sources.",
      path: ["generation_id"],
    }
  );

export const CreateFlashcardsCommandSchema = z.object({
  flashcards: z.array(CreateFlashcardSchema).min(1, "At least one flashcard must be provided."),
});

export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase } = locals;
  const flashcardService = new FlashcardService(supabase);

  const queryParams = Object.fromEntries(url.searchParams.entries());
  const validationResult = ListFlashcardsQuerySchema.safeParse(queryParams);

  if (!validationResult.success) {
    return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
  }

  try {
    const response = await flashcardService.listFlashcards(DEFAULT_USER_ID, validationResult.data);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          code: error.code,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    throw error;
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;
  const flashcardService = new FlashcardService(supabase);

  try {
    const body = await request.json();
    const validationResult = CreateFlashcardsCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
    }

    console.log(DEFAULT_USER_ID, validationResult.data.flashcards);
    const createdFlashcards = await flashcardService.createFlashcards(
      DEFAULT_USER_ID,
      validationResult.data.flashcards
    );

    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          code: error.code,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    throw error;
  }
};
