import { z } from "zod";

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
