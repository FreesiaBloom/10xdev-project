import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { FlashcardDto } from "@/types";

interface DeleteFlashcardDialogProps {
  isOpen: boolean;
  flashcard: FlashcardDto | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

const DeleteFlashcardDialog = ({ isOpen, flashcard, onConfirm, onClose }: DeleteFlashcardDialogProps) => {
  if (!isOpen || !flashcard) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(flashcard.id);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej operacji nie można cofnąć. Fiszka zostanie trwale usunięta.
            <br />
            <br />
            <strong>Przód:</strong> {flashcard.front}
            <br />
            <strong>Tył:</strong> {flashcard.back}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFlashcardDialog;
