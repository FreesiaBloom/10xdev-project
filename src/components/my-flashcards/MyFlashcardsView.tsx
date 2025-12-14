import React, { useState } from "react";
import type { FlashcardDto } from "@/types";
import { useFlashcards } from "../hooks/useFlashcards";
import FlashcardList from "./FlashcardList";
import DeleteFlashcardDialog from "./DeleteFlashcardDialog";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Toaster } from "@/components/ui/sonner";

const MyFlashcardsView = () => {
  const { flashcardsData, isLoading, currentPage, setCurrentPage, updateFlashcard, deleteFlashcard } = useFlashcards();

  const [deletingFlashcard, setDeletingFlashcard] = useState<FlashcardDto | null>(null);

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil((flashcardsData?.pagination.total ?? 0) / (flashcardsData?.pagination.limit ?? 10));
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil((flashcardsData?.pagination.total ?? 0) / (flashcardsData?.pagination.limit ?? 10));

  const renderPaginationItems = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages).keys()].map((page) => (
        <PaginationItem key={page + 1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(page + 1);
            }}
            isActive={currentPage === page + 1}
          >
            {page + 1}
          </PaginationLink>
        </PaginationItem>
      ));
    }

    const pages = [];
    // Show first page
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis after first page if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show last page
    pages.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(totalPages);
          }}
          isActive={currentPage === totalPages}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );

    return pages;
  };

  return (
    <>
      <Toaster richColors />
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Moje Fiszki</h1>
          <Button>Rozpocznij naukę</Button>
        </div>

        <FlashcardList
          flashcards={flashcardsData?.data ?? []}
          isLoading={isLoading}
          onEdit={updateFlashcard}
          onDeleteRequest={setDeletingFlashcard}
        />

        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      <DeleteFlashcardDialog
        isOpen={!!deletingFlashcard}
        flashcard={deletingFlashcard}
        onConfirm={deleteFlashcard}
        onClose={() => setDeletingFlashcard(null)}
      />
    </>
  );
};

export default MyFlashcardsView;
