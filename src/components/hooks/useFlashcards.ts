import { useState, useEffect, useCallback } from "react";
import type { ListFlashcardsResponseDto, FlashcardDto, UpdateFlashcardCommand } from "@/types";
import { toast } from "sonner";

const FLASHCARDS_PER_PAGE = 10;

export const useFlashcards = () => {
  const [flashcardsData, setFlashcardsData] = useState<ListFlashcardsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchFlashcards = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/flashcards?page=${page}&limit=${FLASHCARDS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek.");
      }
      const data: ListFlashcardsResponseDto = await response.json();
      setFlashcardsData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashcards(currentPage);
  }, [currentPage, fetchFlashcards]);

  const updateFlashcard = async (id: string, data: UpdateFlashcardCommand) => {
    const previousData = flashcardsData;
    setError(null); // Clear previous errors

    // Optimistic update
    setFlashcardsData((prevData) => {
      if (!prevData) return null;
      const updatedFlashcards = prevData.data.map((f) => (f.id === id ? { ...f, ...data } : f));
      return { ...prevData, data: updatedFlashcards };
    });

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować fiszki.");
      }

      const updatedFlashcard: FlashcardDto = await response.json();

      // Final update with server data
      setFlashcardsData((prevData) => {
        if (!prevData) return null;
        const updatedFlashcards = prevData.data.map((f) => (f.id === id ? updatedFlashcard : f));
        return { ...prevData, data: updatedFlashcards };
      });
      toast.success("Fiszka została zaktualizowana.");
    } catch (err) {
      // Rollback on error
      if (previousData) {
        setFlashcardsData(previousData);
      }
      const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const deleteFlashcard = async (id: string) => {
    const previousData = flashcardsData;
    setError(null); // Clear previous errors

    // Optimistic update
    setFlashcardsData((prevData) => {
      if (!prevData) return null;
      const filteredFlashcards = prevData.data.filter((f) => f.id !== id);
      return {
        ...prevData,
        data: filteredFlashcards,
        pagination: { ...prevData.pagination, total: prevData.pagination.total - 1 },
      };
    });

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć fiszki.");
      }
      toast.success("Fiszka została usunięta.");
      // TODO: Consider refetching if the page becomes empty
    } catch (err) {
      // Rollback on error
      if (previousData) {
        setFlashcardsData(previousData);
      }
      const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return {
    flashcardsData,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    updateFlashcard,
    deleteFlashcard,
  };
};
