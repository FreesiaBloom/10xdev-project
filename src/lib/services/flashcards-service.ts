import { type SupabaseClient } from "@/db/supabase.client";
import type { CreateFlashcardDto, FlashcardEntity, ListFlashcardsResponseDto } from "@/types";

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

interface ListFlashcardsOptions {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  source?: "manual" | "ai_generated" | "ai_edited";
  generation_id?: number;
}

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves a paginated list of flashcards for a specific user.
   * @param userId - The ID of the user whose flashcards are to be retrieved.
   * @param options - Filtering and pagination options.
   * @returns A promise that resolves to the paginated list of flashcards.
   */
  async listFlashcards(userId: string, options: ListFlashcardsOptions): Promise<ListFlashcardsResponseDto> {
    const { page, limit, sort, order, source, generation_id } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
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
      throw new DatabaseError(error.message, error.code, error.details);
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
   * @param userId - The ID of the user for whom the flashcards are being created.
   * @param flashcards - An array of flashcard data to be inserted.
   * @returns A promise that resolves to the newly created flashcards.
   */
  async createFlashcards(userId: string, flashcards: CreateFlashcardDto[]): Promise<FlashcardEntity[]> {
    const flashcardsToInsert = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: userId,
      next_review_at: new Date().toISOString(),
    }));

    console.log(userId, flashcards, flashcardsToInsert);
    const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

    if (error) {
      throw new DatabaseError(error.message, error.code, error.details);
    }

    return data as FlashcardEntity[];
  }
}
