import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardProposals, type FlashcardProposalViewModel } from "@/components/hooks/useFlashcardProposals";
import type { GeneratedFlashcardProposalDto } from "@/types";

// Mock UUID v4 to return predictable values
vi.mock("uuid", () => ({
  v4: vi.fn(),
}));

import { v4 as uuidv4 } from "uuid";
const mockUuid = vi.mocked(uuidv4);

describe("useFlashcardProposals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset UUID mock to return sequential values for easier testing
    let counter = 0;
    mockUuid.mockImplementation(() => `mock-uuid-${++counter}`);
    vi.doMock("uuid", () => ({ v4: mockUuid }));
  });

  describe("Initial state", () => {
    it("should initialize with empty proposals array", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      expect(result.current.proposals).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("should provide all expected functions", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      expect(typeof result.current.setProposals).toBe("function");
      expect(typeof result.current.updateProposal).toBe("function");
      expect(typeof result.current.deleteProposal).toBe("function");
      expect(typeof result.current.setIsLoading).toBe("function");
    });
  });

  describe("setProposals", () => {
    it("should transform GeneratedFlashcardProposalDto to FlashcardProposalViewModel", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const initialProposals: GeneratedFlashcardProposalDto[] = [
        {
          front: "What is React?",
          back: "A JavaScript library for building user interfaces",
          source: "ai_generated",
        },
        {
          front: "What is TypeScript?",
          back: "A typed superset of JavaScript",
          source: "ai_generated",
        },
      ];

      act(() => {
        result.current.setProposals(initialProposals);
      });

      expect(result.current.proposals).toHaveLength(2);
      expect(result.current.proposals[0]).toEqual({
        id: "mock-uuid-1",
        front: "What is React?",
        back: "A JavaScript library for building user interfaces",
        source: "ai_generated",
        isEditing: false,
      });
      expect(result.current.proposals[1]).toEqual({
        id: "mock-uuid-2",
        front: "What is TypeScript?",
        back: "A typed superset of JavaScript",
        source: "ai_generated",
        isEditing: false,
      });
    });

    it("should handle empty array", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([]);
      });

      expect(result.current.proposals).toEqual([]);
    });

    it("should assign unique UUIDs to each proposal", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const initialProposals: GeneratedFlashcardProposalDto[] = [
        { front: "Q1", back: "A1", source: "ai_generated" },
        { front: "Q2", back: "A2", source: "ai_generated" },
        { front: "Q3", back: "A3", source: "ai_generated" },
      ];

      act(() => {
        result.current.setProposals(initialProposals);
      });

      const ids = result.current.proposals.map((p) => p.id);
      expect(ids).toEqual(["mock-uuid-1", "mock-uuid-2", "mock-uuid-3"]);
      expect(new Set(ids)).toHaveLength(3); // All IDs should be unique
    });

    it("should set isEditing to false for all proposals", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const initialProposals: GeneratedFlashcardProposalDto[] = [
        { front: "Q1", back: "A1", source: "ai_generated" },
        { front: "Q2", back: "A2", source: "ai_edited" },
      ];

      act(() => {
        result.current.setProposals(initialProposals);
      });

      result.current.proposals.forEach((proposal) => {
        expect(proposal.isEditing).toBe(false);
      });
    });
  });

  describe("updateProposal", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let mockProposals: FlashcardProposalViewModel[];

    beforeEach(() => {
      mockProposals = [
        {
          id: "proposal-1",
          front: "Original front",
          back: "Original back",
          source: "ai_generated",
          isEditing: false,
        },
        {
          id: "proposal-2",
          front: "Second front",
          back: "Second back",
          source: "ai_generated",
          isEditing: false,
        },
      ];
    });

    it("should update the correct proposal by ID", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      // Set initial proposals
      act(() => {
        result.current.setProposals([
          { front: "Original front", back: "Original back", source: "ai_generated" },
          { front: "Second front", back: "Second back", source: "ai_generated" },
        ]);
      });

      const updatedProposal: FlashcardProposalViewModel = {
        id: "mock-uuid-1", // First proposal's ID
        front: "Updated front",
        back: "Updated back",
        source: "ai_edited",
        isEditing: true,
      };

      act(() => {
        result.current.updateProposal(updatedProposal);
      });

      expect(result.current.proposals[0]).toEqual(updatedProposal);
      expect(result.current.proposals[1]).toEqual({
        id: "mock-uuid-2",
        front: "Second front",
        back: "Second back",
        source: "ai_generated",
        isEditing: false,
      });
    });

    it("should not modify other proposals when updating one", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([
          { front: "Q1", back: "A1", source: "ai_generated" },
          { front: "Q2", back: "A2", source: "ai_generated" },
          { front: "Q3", back: "A3", source: "ai_generated" },
        ]);
      });

      const originalLength = result.current.proposals.length;
      const secondProposal = { ...result.current.proposals[1] };
      const thirdProposal = { ...result.current.proposals[2] };

      act(() => {
        result.current.updateProposal({
          ...result.current.proposals[0],
          front: "Updated Q1",
        });
      });

      expect(result.current.proposals).toHaveLength(originalLength);
      expect(result.current.proposals[1]).toEqual(secondProposal);
      expect(result.current.proposals[2]).toEqual(thirdProposal);
    });

    it("should handle updating non-existent proposal gracefully", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([{ front: "Q1", back: "A1", source: "ai_generated" }]);
      });

      const originalProposals = [...result.current.proposals];

      act(() => {
        result.current.updateProposal({
          id: "non-existent-id",
          front: "Non-existent",
          back: "Non-existent",
          source: "ai_edited",
          isEditing: false,
        });
      });

      // Should remain unchanged
      expect(result.current.proposals).toEqual(originalProposals);
    });

    it("should allow changing source from ai_generated to ai_edited", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([{ front: "Q1", back: "A1", source: "ai_generated" }]);
      });

      act(() => {
        result.current.updateProposal({
          ...result.current.proposals[0],
          source: "ai_edited",
        });
      });

      expect(result.current.proposals[0].source).toBe("ai_edited");
    });
  });

  describe("deleteProposal", () => {
    it("should remove proposal by ID", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([
          { front: "Q1", back: "A1", source: "ai_generated" },
          { front: "Q2", back: "A2", source: "ai_generated" },
          { front: "Q3", back: "A3", source: "ai_generated" },
        ]);
      });

      const initialLength = result.current.proposals.length;
      const idToDelete = result.current.proposals[1].id; // Delete middle proposal

      act(() => {
        result.current.deleteProposal(idToDelete);
      });

      expect(result.current.proposals).toHaveLength(initialLength - 1);
      expect(result.current.proposals.find((p) => p.id === idToDelete)).toBeUndefined();
      expect(result.current.proposals[0].front).toBe("Q1");
      expect(result.current.proposals[1].front).toBe("Q3");
    });

    it("should handle deleting non-existent proposal gracefully", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([{ front: "Q1", back: "A1", source: "ai_generated" }]);
      });

      const originalProposals = [...result.current.proposals];

      act(() => {
        result.current.deleteProposal("non-existent-id");
      });

      expect(result.current.proposals).toEqual(originalProposals);
    });

    it("should handle deleting from empty array", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.deleteProposal("any-id");
      });

      expect(result.current.proposals).toEqual([]);
    });

    it("should delete all proposals one by one", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([
          { front: "Q1", back: "A1", source: "ai_generated" },
          { front: "Q2", back: "A2", source: "ai_generated" },
        ]);
      });

      const firstId = result.current.proposals[0].id;
      const secondId = result.current.proposals[1].id;

      act(() => {
        result.current.deleteProposal(firstId);
      });

      expect(result.current.proposals).toHaveLength(1);
      expect(result.current.proposals[0].id).toBe(secondId);

      act(() => {
        result.current.deleteProposal(secondId);
      });

      expect(result.current.proposals).toHaveLength(0);
    });
  });

  describe("isLoading state", () => {
    it("should manage isLoading state correctly", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setIsLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should not affect proposals when changing loading state", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([{ front: "Q1", back: "A1", source: "ai_generated" }]);
      });

      const originalProposals = [...result.current.proposals];

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.proposals).toEqual(originalProposals);
    });
  });

  describe("Edge cases and business rules", () => {
    it("should handle proposals with special characters", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const specialProposals: GeneratedFlashcardProposalDto[] = [
        {
          front: "What's the difference between <div> & <span>?",
          back: "<div> is block-level, <span> is inline",
          source: "ai_generated",
        },
        {
          front: "Jakie są różnice między 'let' a 'const'?",
          back: "'const' nie może być ponownie przypisane",
          source: "ai_generated",
        },
      ];

      act(() => {
        result.current.setProposals(specialProposals);
      });

      expect(result.current.proposals[0].front).toBe("What's the difference between <div> & <span>?");
      expect(result.current.proposals[1].front).toBe("Jakie są różnice między 'let' a 'const'?");
    });

    it("should handle very long content", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const longContent = "A".repeat(1000);
      const longProposals: GeneratedFlashcardProposalDto[] = [
        {
          front: longContent,
          back: longContent,
          source: "ai_generated",
        },
      ];

      act(() => {
        result.current.setProposals(longProposals);
      });

      expect(result.current.proposals[0].front).toHaveLength(1000);
      expect(result.current.proposals[0].back).toHaveLength(1000);
    });

    it("should handle empty strings in content", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const emptyProposals: GeneratedFlashcardProposalDto[] = [
        {
          front: "",
          back: "",
          source: "ai_generated",
        },
      ];

      act(() => {
        result.current.setProposals(emptyProposals);
      });

      expect(result.current.proposals[0].front).toBe("");
      expect(result.current.proposals[0].back).toBe("");
    });

    it("should maintain proposal order during operations", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([
          { front: "First", back: "1", source: "ai_generated" },
          { front: "Second", back: "2", source: "ai_generated" },
          { front: "Third", back: "3", source: "ai_generated" },
        ]);
      });

      // Update middle proposal
      act(() => {
        result.current.updateProposal({
          ...result.current.proposals[1],
          front: "Updated Second",
        });
      });

      expect(result.current.proposals.map((p) => p.front)).toEqual(["First", "Updated Second", "Third"]);

      // Delete first proposal
      act(() => {
        result.current.deleteProposal(result.current.proposals[0].id);
      });

      expect(result.current.proposals.map((p) => p.front)).toEqual(["Updated Second", "Third"]);
    });
  });

  describe("Type safety", () => {
    it("should enforce correct source enum values", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      const proposalsWithValidSources: GeneratedFlashcardProposalDto[] = [
        { front: "Q1", back: "A1", source: "ai_generated" },
        { front: "Q2", back: "A2", source: "ai_edited" },
      ];

      act(() => {
        result.current.setProposals(proposalsWithValidSources);
      });

      expect(result.current.proposals[0].source).toBe("ai_generated");
      expect(result.current.proposals[1].source).toBe("ai_edited");
    });

    it("should preserve all required FlashcardProposalViewModel properties", () => {
      const { result } = renderHook(() => useFlashcardProposals());

      act(() => {
        result.current.setProposals([{ front: "Test", back: "Answer", source: "ai_generated" }]);
      });

      const proposal = result.current.proposals[0];

      // Test that all required properties are present
      expect(proposal).toHaveProperty("id");
      expect(proposal).toHaveProperty("front");
      expect(proposal).toHaveProperty("back");
      expect(proposal).toHaveProperty("source");
      expect(proposal).toHaveProperty("isEditing");

      // Test property types
      expect(typeof proposal.id).toBe("string");
      expect(typeof proposal.front).toBe("string");
      expect(typeof proposal.back).toBe("string");
      expect(typeof proposal.isEditing).toBe("boolean");
      expect(["ai_generated", "ai_edited"]).toContain(proposal.source);
    });
  });
});
