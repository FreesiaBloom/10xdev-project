import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { GeneratedFlashcardProposalDto } from "@/types";

export interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  source: "ai_generated" | "ai_edited";
  isEditing: boolean;
}

export function useFlashcardProposals() {
  const [proposals, setProposalsState] = useState<FlashcardProposalViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const setProposals = useCallback((initialProposals: GeneratedFlashcardProposalDto[]) => {
    setProposalsState(
      initialProposals.map((p) => ({
        ...p,
        id: uuidv4(),
        isEditing: false,
      }))
    );
  }, []);

  const updateProposal = (updatedProposal: FlashcardProposalViewModel) => {
    setProposalsState((currentProposals) =>
      currentProposals.map((p) => (p.id === updatedProposal.id ? updatedProposal : p))
    );
  };

  const deleteProposal = (proposalId: string) => {
    setProposalsState((currentProposals) => currentProposals.filter((p) => p.id !== proposalId));
  };

  return {
    proposals,
    updateProposal,
    deleteProposal,
    setProposals,
    isLoading,
    setIsLoading,
  };
}
