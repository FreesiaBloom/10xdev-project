import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDto } from "@/types";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import React from "react";

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

export default function GenerationForm() {
  const [sourceText, setSourceText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isValid = sourceText.length >= MIN_LENGTH && sourceText.length <= MAX_LENGTH;

  // Mark component as ready after mount (for E2E tests)
  React.useEffect(() => {
    setIsReady(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    setIsLoading(true);

    try {
      const command: GenerateFlashcardsCommand = { source_text: sourceText };
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas generowania fiszek.");
      }

      const result: GenerateFlashcardsResponseDto = await response.json();

      sessionStorage.setItem(`generation-${result.generation_id}`, JSON.stringify(result.flashcards_proposals));

      window.location.href = `/review/${result.generation_id}`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił nieznany błąd. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors />
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-4"
        data-testid={isReady ? "form-ready" : "form-loading"}
      >
        <div className="relative w-full">
          <Textarea
            data-testid="source-text-area"
            value={sourceText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSourceText(e.target.value)}
            placeholder="Wklej tutaj swój tekst..."
            className="h-64 resize-none"
            maxLength={MAX_LENGTH}
            disabled={isLoading}
          />
          <p data-testid="character-counter" className="absolute bottom-2 right-2 text-sm text-muted-foreground">
            {sourceText.length} / {MAX_LENGTH}
          </p>
        </div>
        <Button
          data-testid="generate-button"
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full max-w-xs"
        >
          {isLoading && <span data-testid="loading-spinner">Loading...</span>}
          {!isLoading && "Generuj fiszki"}
        </Button>
      </form>
    </>
  );
}
