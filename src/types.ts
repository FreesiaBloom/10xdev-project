/**
 * This file contains shared types for the application, including Data Transfer Objects (DTOs)
 * and Command Models used in the API. These types are derived from the database
 * entities to ensure consistency between the API and the database schema.
 */
import type { Database, Source } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// Aliases for base database types extracted from the Database model definitions
// ------------------------------------------------------------------------------------------------
export type FlashcardEntity = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsertEntity = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardUpdateEntity = Database["public"]["Tables"]["flashcards"]["Update"];
export type GenerationEntity = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLogEntity = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// ------------------------------------------------------------------------------------------------
// 1. Common DTOs for Pagination
// ------------------------------------------------------------------------------------------------
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationDto;
}

// ------------------------------------------------------------------------------------------------
// 2. Flashcard DTOs and Commands
// ------------------------------------------------------------------------------------------------

/**
 * Data Transfer Object for a flashcard.
 * @see GET /api/flashcards, GET /api/flashcards/{id}
 */
export type FlashcardDto = Pick<
  FlashcardEntity,
  "id" | "front" | "back" | "source" | "created_at" | "updated_at" | "generation_id"
>;

/**
 * Response DTO for the list flashcards endpoint.
 * @see GET /api/flashcards
 */
export type ListFlashcardsResponseDto = PaginatedResponseDto<FlashcardDto>;

/**
 * Data Transfer Object for creating a single flashcard.
 */
export interface CreateFlashcardDto {
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}

/**
 * Command Model for creating multiple flashcards.
 * @see POST /api/flashcards
 */
export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardDto[];
}

/**
 * Response DTO for the create flashcards endpoint.
 * @see POST /api/flashcards
 */
export interface CreateFlashcardsResponseDto {
  flashcards: FlashcardDto[];
}

/**
 * Command Model for updating an existing flashcard.
 * @see PUT /api/flashcards/{id}
 */
export type UpdateFlashcardCommand = Partial<Pick<FlashcardUpdateEntity, "front" | "back">>;

/**
 * Command Model for grading a flashcard during a study session.
 * @see POST /api/flashcards/{id}/grade
 */
export interface GradeFlashcardCommand {
  status: "remembered" | "forgotten";
}

// ------------------------------------------------------------------------------------------------
// 3. Generation DTOs and Commands
// ------------------------------------------------------------------------------------------------

/**
 * Command Model for generating flashcards from text.
 * @see POST /api/generations
 */
export interface GenerateFlashcardsCommand {
  source_text: string;
}

/**
 * Data Transfer Object for a single AI-generated flashcard proposal.
 */
export interface GeneratedFlashcardProposalDto {
  front: string;
  back: string;
  source: Source;
}

/**
 * Response DTO for the generate flashcards endpoint.
 * @see POST /api/generations
 */
export interface GenerateFlashcardsResponseDto {
  generation_id: GenerationEntity["id"];
  flashcards_proposals: GeneratedFlashcardProposalDto[];
  generated_count: GenerationEntity["generated_count"];
}

/**
 * Data Transfer Object for a generation event.
 * @see GET /api/generations
 */
export type GenerationDto = GenerationEntity;

/**
 * Response DTO for the list generations endpoint.
 * @see GET /api/generations
 */
export type ListGenerationsResponseDto = PaginatedResponseDto<GenerationDto>;

/**
 * Data Transfer Object for the detailed view of a generation event.
 * @see GET /api/generations/{id}
 */
export type GenerationDetailsDto = GenerationDto & {
  flashcards: FlashcardDto[];
};

// ------------------------------------------------------------------------------------------------
// 4. Generation Error Log DTOs
// ------------------------------------------------------------------------------------------------
/**
 * Data Transfer Object for a generation error log.
 */
export type GenerationErrorLogDto = GenerationErrorLogEntity;
