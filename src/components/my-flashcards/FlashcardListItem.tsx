import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardDto, UpdateFlashcardCommand } from "@/types";
import { useState } from "react";

interface FlashcardListItemProps {
  flashcard: FlashcardDto;
  onUpdate: (id: number, data: UpdateFlashcardCommand) => void;
  onDelete: () => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

const FlashcardListItem = ({ flashcard, onUpdate, onDelete }: FlashcardListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  const isFormValid =
    editedFront.trim().length > 0 &&
    editedFront.length <= MAX_FRONT_LENGTH &&
    editedBack.trim().length > 0 &&
    editedBack.length <= MAX_BACK_LENGTH;

  const handleSave = () => {
    onUpdate(flashcard.id, { front: editedFront, back: editedBack });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Input value={editedFront} onChange={(e) => setEditedFront(e.target.value)} maxLength={MAX_FRONT_LENGTH} />
            <Textarea
              value={editedBack}
              onChange={(e) => setEditedBack(e.target.value)}
              maxLength={MAX_BACK_LENGTH}
              className="h-32"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancel}>
                Anuluj
              </Button>
              <Button onClick={handleSave} disabled={!isFormValid}>
                Zapisz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{flashcard.front}</p>
          <hr />
          <p className="text-muted-foreground">{flashcard.back}</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edytuj
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Usuń
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardListItem;
