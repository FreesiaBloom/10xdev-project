import type { FlashcardDto, UpdateFlashcardCommand } from "@/types";
import FlashcardListItem from "./FlashcardListItem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FlashcardListProps {
  flashcards: FlashcardDto[];
  isLoading: boolean;
  onEdit: (id: string, data: UpdateFlashcardCommand) => void;
  onDeleteRequest: (flashcard: FlashcardDto) => void;
}

const FlashcardList = ({ flashcards, isLoading, onEdit, onDeleteRequest }: FlashcardListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-24 w-full animate-pulse rounded-md bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <h3 className="text-xl font-medium">Nie masz jeszcze żadnych fiszek</h3>
        <p className="mt-2 text-sm text-gray-500">Wygeneruj nowe fiszki, aby rozpocząć naukę.</p>
        <a href="/generate">
          <Button className="mt-4">Stwórz nowe fiszki</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          onUpdate={onEdit}
          onDelete={() => onDeleteRequest(flashcard)}
        />
      ))}
    </div>
  );
};

export default FlashcardList;
