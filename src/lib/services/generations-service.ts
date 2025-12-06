import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponseDto,
  GeneratedFlashcardProposalDto,
} from "../../types";

export class GenerationService {
  private supabase: SupabaseClient;
  private readonly openRouterApiKey: string = import.meta.env.OPENROUTER_API_KEY;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  private async generateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  public async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GenerateFlashcardsResponseDto> {
    const sourceTextHash = await this.generateHash(command.source_text);

    // TODO: Check if a generation with the same hash already exists to avoid duplicates.

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.openRouterApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that generates flashcards from a given text. Each flashcard should have a 'front' (question) and a 'back' (answer). Provide the output in JSON format as an array of objects, where each object has 'front' and 'back' keys. Example: [{\"front\": \"What is the capital of Poland?\", \"back\": \"Warsaw\"}]",
            },
            { role: "user", content: command.source_text },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        // TODO: Log this error to the database in 'generation_error_logs'
        throw new Error(`AI service request failed with status ${response.status}: ${errorBody}`);
      }

      const aiResponse = await response.json();

      // The AI is expected to return a JSON object with a "flashcards" key, which is an array.
      const flashcardsProposals: GeneratedFlashcardProposalDto[] = JSON.parse(
        aiResponse.choices[0].message.content
      ).flashcards;

      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: DEFAULT_USER_ID,
          model: "google/gemma-2-9b-it",
          source_text_hash: sourceTextHash,
          generated_count: flashcardsProposals.length,
        })
        .select()
        .single();

      if (insertError) {
        // Even if DB insert fails, we don't want the user to lose the generated cards.
        // We will log the DB error but still return the proposals.
        // A more robust solution might involve a retry mechanism or a background job.
        console.error("Failed to save generation record:", insertError);
        // We can proceed without a generation_id, but for consistency let's use a placeholder.
        return {
          generation_id: -1, // Indicates a non-persisted generation
          flashcards_proposals: flashcardsProposals.map((p) => ({ ...p, source: "ai_generated" })),
          generated_count: flashcardsProposals.length,
        };
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: flashcardsProposals.map((p) => ({ ...p, source: "ai_generated" })),
        generated_count: flashcardsProposals.length,
      };
    } catch (error) {
      console.error("Error generating flashcards from AI:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const { error: logError } = await this.supabase.from("generation_error_logs").insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: sourceTextHash,
        error_message: errorMessage,
        model: "google/gemma-2-9b-it",
      });

      if (logError) {
        console.error("Failed to log generation error:", logError);
      }

      throw new Error("Failed to generate flashcards due to an AI service error.");
    }
  }
}
