import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { FlashcardProposalViewModel } from "./hooks/useFlashcardProposals";

interface FlashcardProposalItemProps {
  proposal: FlashcardProposalViewModel;
  onUpdate: (proposal: FlashcardProposalViewModel) => void;
  onDelete: (id: string) => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

export default function FlashcardProposalItem({ proposal, onUpdate, onDelete }: FlashcardProposalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(proposal.front);
  const [editedBack, setEditedBack] = useState(proposal.back);

  const isFormValid =
    editedFront.trim().length > 0 &&
    editedFront.length <= MAX_FRONT_LENGTH &&
    editedBack.trim().length > 0 &&
    editedBack.length <= MAX_BACK_LENGTH;

  const handleSave = () => {
    onUpdate({
      ...proposal,
      front: editedFront,
      back: editedBack,
      source: "ai_edited",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFront(proposal.front);
    setEditedBack(proposal.back);
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
          <p>{proposal.front}</p>
          <hr />
          <p className="text-muted-foreground">{proposal.back}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edytuj
            </Button>
            <Button variant="destructive" onClick={() => onDelete(proposal.id)}>
              Usuń
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
