import type { CreateFlashcardsCommand, GeneratedFlashcardProposalDto } from "@/types";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { useFlashcardProposals } from "./hooks/useFlashcardProposals";
import FlashcardProposalItem from "./FlashcardProposalItem";
import type { FlashcardProposalViewModel } from "./hooks/useFlashcardProposals";

interface ReviewFormProps {
  generationId: number;
}

export default function ReviewForm({ generationId }: ReviewFormProps) {
  const { proposals, updateProposal, deleteProposal, setProposals, isLoading, setIsLoading } = useFlashcardProposals();

  useEffect(() => {
    const item = sessionStorage.getItem(`generation-${generationId}`);
    if (item) {
      const parsedProposals: GeneratedFlashcardProposalDto[] = JSON.parse(item);
      setProposals(parsedProposals);
    }
  }, [generationId, setProposals]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (proposals.length === 0) return;

    setIsLoading(true);
    console.log(event);
    try {
      const command: CreateFlashcardsCommand = {
        flashcards: proposals.map((p) => ({
          front: p.front,
          back: p.back,
          source: p.source,
          generation_id: generationId,
        })),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać fiszek.");
      }

      toast.success("Fiszki zostały pomyślnie zapisane!");
      sessionStorage.removeItem(`generation-${generationId}`);

      // Redirect after a short delay to allow the user to see the toast
      setTimeout(() => {
        window.location.href = "/my-flashcards";
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Wystąpił nieznany błąd.");
      setIsLoading(false);
    }
  };

  if (proposals.length === 0 && !isLoading) {
    return (
      <div className="text-center">
        <p>Nie znaleziono propozycji do recenzji.</p>
        <a href="/generate" className="text-blue-500 hover:underline">
          Wróć do generowania
        </a>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors />
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        {proposals.map((proposal: FlashcardProposalViewModel) => (
          <FlashcardProposalItem
            key={proposal.id}
            proposal={proposal}
            onUpdate={updateProposal}
            onDelete={deleteProposal}
          />
        ))}

        <Button type="submit" disabled={proposals.length === 0 || isLoading} className="w-full max-w-xs self-center">
          {isLoading ? <span>Loading...</span> : `Zapisz ${proposals.length} fiszek`}
        </Button>
      </form>
    </>
  );
}
