# Plan implementacji widoku Moje Fiszki

## 1. Przegląd

Widok "Moje Fiszki" jest centralnym miejscem do zarządzania wszystkimi zaakceptowanymi fiszkami użytkownika. Jego głównym celem jest wyświetlenie paginowanej listy fiszek, umożliwienie ich edycji i usuwania, a także zapewnienie punktu wyjścia do rozpoczęcia sesji nauki. Widok ten musi być intuicyjny i responsywny, zapewniając płynne zarządzanie bazą wiedzy użytkownika.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka**: `/moje-fiszki`

Implementacja będzie polegała na utworzeniu pliku `src/pages/moje-fiszki.astro`, który zaimportuje i wyrenderuje główny komponent React `MyFlashcardsView` z dyrektywą `client:load`.

## 3. Struktura komponentów

Hierarchia komponentów React, które zbudują ten widok, jest następująca:

```
MyFlashcardsView.tsx (Komponent główny, zarządzający stanem)
├── FlashcardList.tsx (Renderuje listę fiszek lub stan pusty/ładowania)
│   └── FlashcardListItem.tsx (Wyświetla pojedynczą fiszkę z akcjami)
├── EditFlashcardDialog.tsx (Modal z formularzem do edycji fiszki)
└── DeleteFlashcardDialog.tsx (Modal do potwierdzenia usunięcia fiszki)
```

## 4. Szczegóły komponentów

### MyFlashcardsView
- **Opis komponentu**: Główny komponent widoku, orkiestrujący pobieranie danych, paginację oraz interakcje z modalami. Będzie odpowiedzialny za całą logikę biznesową i zarządzanie stanem.
- **Główne elementy**: Komponenty `FlashcardList`, `Pagination` (z Shadcn/ui), `EditFlashcardDialog`, `DeleteFlashcardDialog`, `Button` do rozpoczęcia nauki.
- **Obsługiwane interakcje**: Zmiana strony w paginacji, otwieranie modali edycji i usuwania.
- **Obsługiwana walidacja**: Brak; walidacja delegowana jest do komponentu formularza.
- **Typy**: `ListFlashcardsResponseDto`, `FlashcardDto`, `FlashcardViewModel`.
- **Propsy**: Brak.

### FlashcardList
- **Opis komponentu**: Prezentuje listę fiszek. W przypadku braku danych wyświetla stan pusty z wezwaniem do akcji. Podczas ładowania danych pokazuje szkielety (skeletons).
- **Główne elementy**: Kontener listy (`<ul>` lub `<div>`), iteracja po `FlashcardListItem`, komponenty szkieletów (z Shadcn/ui), komunikat o stanie pustym.
- **Obsługiwane interakcje**: Przekazywanie zdarzeń `onEdit` i `onDelete` od `FlashcardListItem` do `MyFlashcardsView`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardViewModel[]`.
- **Propsy**:
  - `flashcards: FlashcardViewModel[]`
  - `isLoading: boolean`
  - `onEdit: (id: number) => void`
  - `onDelete: (id: number) => void`

### FlashcardListItem
- **Opis komponentu**: Reprezentuje pojedynczy wiersz na liście, wyświetlając treść przodu i tyłu fiszki oraz przyciski akcji.
- **Główne elementy**: Elementy tekstowe dla `front` i `back`, `Button` "Edytuj", `Button` "Usuń".
- **Obsługiwane interakcje**: Kliknięcie przycisków "Edytuj" i "Usuń".
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardViewModel`.
- **Propsy**:
  - `flashcard: FlashcardViewModel`
  - `onEdit: (id: number) => void`
  - `onDelete: (id: number) => void`

### EditFlashcardDialog
- **Opis komponentu**: Modal zawierający formularz do edycji treści fiszki, zintegrowany z `react-hook-form` i `zod` do walidacji.
- **Główne elementy**: Komponent `Dialog` (z Shadcn/ui), `Form` z polami `Input` dla `front` i `back`, przyciski "Zapisz" i "Anuluj".
- **Obsługiwane interakcje**: Wprowadzanie tekstu, submisja formularza, zamknięcie modala.
- **Obsługiwana walidacja**:
  - `front`: pole wymagane, minimum 1 znak, maksimum 200 znaków.
  - `back`: pole wymagane, minimum 1 znak, maksimum 500 znaków.
- **Typy**: `FlashcardDto`, `UpdateFlashcardCommand`.
- **Propsy**:
  - `isOpen: boolean`
  - `flashcard: FlashcardDto | null`
  - `onSave: (id: number, data: UpdateFlashcardCommand) => void`
  - `onClose: () => void`

### DeleteFlashcardDialog
- **Opis komponentu**: Prosty modal z prośbą o potwierdzenie operacji usunięcia fiszki.
- **Główne elementy**: Komponent `AlertDialog` (z Shadcn/ui), tekst ostrzegawczy, przyciski "Usuń" (akcja destruktywna) i "Anuluj".
- **Obsługiwane interakcje**: Potwierdzenie lub anulowanie usunięcia.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardDto`.
- **Propsy**:
  - `isOpen: boolean`
  - `flashcard: FlashcardDto | null`
  - `onConfirm: (id: number) => void`
  - `onClose: () => void`

## 5. Typy

Do implementacji widoku, oprócz istniejących typów DTO, wymagany będzie nowy typ `ViewModel`.

```typescript
// Istniejące DTO (src/types.ts)
import type { FlashcardDto, ListFlashcardsResponseDto, UpdateFlashcardCommand } from "@/types";

// Nowy ViewModel (zdefiniowany w MyFlashcardsView.tsx)
export interface FlashcardViewModel extends FlashcardDto {
  isEditing?: boolean;  // Flaga do zarządzania stanem edycji w UI
  isDeleting?: boolean; // Flaga do zarządzania stanem usuwania w UI
}
```

- **FlashcardViewModel**: Rozszerza `FlashcardDto` o opcjonalne flagi specyficzne dla UI, takie jak `isEditing` czy `isDeleting`. Pozwoli to na łatwe zarządzanie stanem poszczególnych elementów na liście (np. wyświetlanie spinnera podczas operacji) bez modyfikowania oryginalnego obiektu danych.

## 6. Zarządzanie stanem

Zarządzanie stanem zostanie scentralizowane w komponencie `MyFlashcardsView` przy użyciu hooka `useState` do przechowywania danych o fiszkach, paginacji, stanie ładowania, błędach oraz stanie modali.

**Zmienne stanu w `MyFlashcardsView`**:
- `flashcardsData: ListFlashcardsResponseDto | null` - Przechowuje pełną odpowiedź z API.
- `isLoading: boolean` - Wskazuje, czy trwa pobieranie danych.
- `error: string | null` - Przechowuje komunikaty o błędach.
- `currentPage: number` - Aktualnie wybrana strona paginacji.
- `editingFlashcard: FlashcardDto | null` - Fiszka aktualnie edytowana w modalu.
- `deletingFlashcard: FlashcardDto | null` - Fiszka przeznaczona do usunięcia.

Ze względu na złożoność logiki (pobieranie danych, paginacja, obsługa edycji/usuwania, zarządzanie stanami ładowania/błędów), rekomendowane jest stworzenie **customowego hooka `useFlashcards`**, który enkapsuluje całą tę logikę, zwracając stan oraz funkcje do interakcji.

## 7. Integracja API

Komponent `MyFlashcardsView` będzie komunikował się z trzema endpointami API:

1.  **Pobieranie listy fiszek**:
    - **Endpoint**: `GET /api/flashcards`
    - **Parametry zapytania**: `page: number`, `limit: number`
    - **Typ odpowiedzi**: `ListFlashcardsResponseDto`

2.  **Aktualizacja fiszki**:
    - **Endpoint**: `PUT /api/flashcards/{id}`
    - **Typ żądania (body)**: `UpdateFlashcardCommand` (`{ front?: string; back?: string; }`)
    - **Typ odpowiedzi**: `FlashcardDto` (zaktualizowana fiszka)

3.  **Usunięcie fiszki**:
    - **Endpoint**: `DELETE /api/flashcards/{id}`
    - **Typ odpowiedzi**: `204 No Content` lub `{ success: true }`

Do realizacji zapytań zostanie wykorzystana standardowa funkcja `fetch` lub biblioteka taka jak `axios`.

## 8. Interakcje użytkownika

- **Przeglądanie stron**: Użytkownik klika na numer strony w komponencie `Pagination`, co powoduje ponowne pobranie danych dla wybranej strony.
- **Edycja fiszki**: Użytkownik klika przycisk "Edytuj". Otwiera się modal `EditFlashcardDialog` z załadowanymi danymi fiszki. Po edycji i kliknięciu "Zapisz", wysyłane jest żądanie `PUT`, a po sukcesie lista jest aktualizowana.
- **Usuwanie fiszki**: Użytkownik klika "Usuń". Otwiera się modal `DeleteFlashcardDialog`. Po kliknięciu "Potwierdź", wysyłane jest żądanie `DELETE`, a fiszka znika z listy.
- **Stan pusty**: Jeśli użytkownik nie ma fiszek, widzi komunikat i przycisk kierujący do strony generowania fiszek.

## 9. Warunki i walidacja

Walidacja danych wejściowych będzie realizowana po stronie klienta w komponencie `EditFlashcardDialog` przed wysłaniem żądania do API.
- **Komponent**: `EditFlashcardDialog`
- **Warunki**:
  - Pole `front` nie może być puste i nie może przekraczać 200 znaków.
  - Pole `back` nie może być puste i nie może przekraczać 500 znaków.
- **Implementacja**: Użycie `zod` do zdefiniowania schematu walidacji i `react-hook-form` do integracji z formularzem. Przycisk "Zapisz" będzie nieaktywny, dopóki formularz nie będzie poprawny.

## 10. Obsługa błędów

- **Błędy sieciowe/API**: W przypadku nieudanego zapytania do API (np. błąd serwera 500), użytkownikowi zostanie wyświetlony globalny komunikat o błędzie (np. za pomocą komponentu `Toast` z Shadcn/ui).
- **Błędy walidacji (400)**: Komunikaty o błędach walidacji z API zostaną wyświetlone pod odpowiednimi polami formularza edycji.
- **Brak zasobu (404)**: Jeśli użytkownik spróbuje edytować/usunąć fiszkę, która już nie istnieje, zostanie wyświetlony `Toast` z informacją, a lista zostanie odświeżona.
- **Brak autoryzacji (401)**: Aplikacja powinna przekierować użytkownika na stronę logowania.
- **Stan ładowania**: Podczas operacji asynchronicznych (pobieranie, zapis, usuwanie) przyciski akcji będą zablokowane, a w ich miejsce może pojawić się ikona ładowania, aby zapobiec wielokrotnym kliknięciom.

## 11. Kroki implementacji

1.  **Utworzenie pliku strony**: Stworzenie pliku `src/pages/moje-fiszki.astro` i osadzenie w nim miejsca na komponent React.
2.  **Struktura komponentów**: Utworzenie pustych plików komponentów React (`.tsx`) zgodnie z zaproponowaną hierarchią w folderze `src/components/`.
3.  **Zarządzanie stanem (`useFlashcards`)**: Implementacja customowego hooka do pobierania danych z `GET /api/flashcards` i zarządzania stanem ładowania oraz błędów.
4.  **Komponent główny (`MyFlashcardsView`)**: Zintegrowanie hooka `useFlashcards`, dodanie logiki do obsługi paginacji i przekazywania danych do komponentu listy.
5.  **Komponenty listy (`FlashcardList`, `FlashcardListItem`)**: Implementacja wyświetlania listy fiszek, stanu pustego oraz szkieletów ładowania. Dodanie przycisków akcji.
6.  **Modal usuwania (`DeleteFlashcardDialog`)**: Implementacja modala, logiki potwierdzania i integracja z `useFlashcards` w celu wywołania akcji usuwania.
7.  **Modal edycji (`EditFlashcardDialog`)**: Implementacja modala z formularzem, dodanie walidacji (`zod` + `react-hook-form`) i integracja z `useFlashcards` w celu wywołania akcji aktualizacji.
8.  **Optymistyczne aktualizacje**: Zaimplementowanie optymistycznego UI dla operacji edycji i usuwania, aby interfejs reagował natychmiast, a następnie synchronizował się ze stanem serwera.
9.  **Stylowanie i UX**: Dopracowanie wyglądu za pomocą Tailwind CSS, dodanie `Toastów` do informowania o wynikach operacji oraz dopracowanie animacji przejść.
10. **Testowanie**: Ręczne przetestowanie wszystkich interakcji użytkownika, obsługi błędów i przypadków brzegowych.
