import type { SupabaseClient } from "@/db/supabase.client";
import type { CreateFlashcardDto, FlashcardEntity, ListFlashcardsResponseDto } from "@/types";

interface ListFlashcardsOptions {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  source?: "manual" | "ai_generated" | "ai_edited";
  generation_id?: number;
}

/**
 * Retrieves a paginated list of flashcards for a specific user.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose flashcards are to be retrieved.
 * @param options - Filtering and pagination options.
 * @returns A promise that resolves to the paginated list of flashcards.
 */
export async function listFlashcards(
  supabase: SupabaseClient,
  userId: string,
  options: ListFlashcardsOptions
): Promise<ListFlashcardsResponseDto> {
  const { page, limit, sort, order, source, generation_id } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("flashcards")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .range(from, to)
    .order(sort, { ascending: order === "asc" });

  if (source) {
    query = query.eq("source", source);
  }

  if (generation_id) {
    query = query.eq("generation_id", generation_id);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data as FlashcardEntity[],
    pagination: {
      page,
      limit,
      total: count ?? 0,
    },
  };
}

/**
 * Creates new flashcards for a specific user.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user for whom the flashcards are being created.
 * @param flashcards - An array of flashcard data to be inserted.
 * @returns A promise that resolves to the newly created flashcards.
 */
export async function createFlashcards(
  supabase: SupabaseClient,
  userId: string,
  flashcards: CreateFlashcardDto[]
): Promise<FlashcardEntity[]> {
  const flashcardsToInsert = flashcards.map((flashcard) => ({
    ...flashcard,
    user_id: userId,
  }));

  const { data, error } = await supabase.from("flashcards").insert(flashcardsToInsert).select();

  if (error) {
    throw new Error(error.message);
  }

  return data as FlashcardEntity[];
}
