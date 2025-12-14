import { z } from "zod";
import type { SupabaseClient } from "../../db/supabase.client";
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponseDto,
  GeneratedFlashcardProposalDto,
} from "../../types";
import { OpenRouterService } from "./openrouter.service";

const FlashcardProposalSchema = z.object({
  front: z.string().describe("The question or term on the front of the flashcard."),
  back: z.string().describe("The answer or definition on the back of the flashcard."),
});

const AiFlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardProposalSchema).min(1).describe("An array of generated flashcards."),
});

export class GenerationService {
  private supabase: SupabaseClient;
  private openRouterService: OpenRouterService;
  private readonly model = "openai/gpt-4o-mini";

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.openRouterService = new OpenRouterService();
  }

  private async generateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  public async generateFlashcards(
    command: GenerateFlashcardsCommand,
    userId: string
  ): Promise<GenerateFlashcardsResponseDto> {
    const sourceTextHash = await this.generateHash(command.source_text);

    // TODO: Check if a generation with the same hash already exists to avoid duplicates.
    try {
      const startTime = Date.now();
      const systemPrompt =
        "You are a helpful assistant that generates flashcards from a given text. Each flashcard should have a 'front' (question) and a 'back' (answer). Provide the output in JSON format, following the requested schema precisely.";

      const aiResponse = await this.openRouterService.generateStructuredResponse({
        systemPrompt,
        userPrompt: command.source_text,
        responseSchema: AiFlashcardsResponseSchema,
        model: this.model,
      });

      const flashcardsProposals = aiResponse.flashcards;

      const generationId = await this.saveGenerationMetadata(
        {
          sourceText: command.source_text,
          sourceTextHash,
          generatedCount: flashcardsProposals.length,
          durationMs: Date.now() - startTime,
        },
        userId
      );

      const persistedProposals: GeneratedFlashcardProposalDto[] = flashcardsProposals.map((p) => ({
        ...p,
        source: "ai_generated",
      }));

      return {
        generation_id: generationId,
        flashcards_proposals: persistedProposals,
        generated_count: flashcardsProposals.length,
      };
    } catch (error) {
      console.error("Error generating flashcards from AI:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const { error: logError } = await this.supabase.from("generation_error_logs").insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        error_message: errorMessage,
        model: this.model,
      });

      if (logError) {
        console.error("Failed to log generation error:", logError);
      }

      throw new Error("Failed to generate flashcards due to an AI service error.");
    }
  }

  private async saveGenerationMetadata(
    data: {
      sourceText: string;
      sourceTextHash: string;
      generatedCount: number;
      durationMs: number;
    },
    userId: string
  ): Promise<number> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: userId,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceText.length,
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
        model: this.model,
      })
      .select("id")
      .single();

    if (error) throw error;
    return generation.id;
  }
}
