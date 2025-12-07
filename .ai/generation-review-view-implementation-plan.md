# Plan implementacji widoku Generowania i Recenzji Fiszek

## 1. Przegląd

Ten dokument opisuje plan implementacji dwuetapowego procesu tworzenia fiszek przez AI. Proces składa się z dwóch oddzielnych widoków:
1.  **Widok Generowania (`/generuj`)**: Użytkownik wprowadza tekst źródłowy, na podstawie którego AI wygeneruje propozycje fiszek.
2.  **Widok Recenzji (`/przeglad/[generationId]`)**: Użytkownik przegląda, edytuje i usuwa wygenerowane propozycje, a następnie zapisuje finalną wersję w swojej kolekcji.

Celem jest stworzenie płynnego i intuicyjnego przepływu, który minimalizuje wysiłek użytkownika i zapewnia wysoką jakość tworzonych materiałów do nauki.

## 2. Routing widoku

- **Widok Generowania**: Dostępny pod ścieżką `/generuj`.
- **Widok Recenzji**: Dostępny pod dynamiczną ścieżką `/przeglad/[generationId]`, gdzie `[generationId]` to identyfikator zwrócony przez API po procesie generowania.

## 3. Struktura komponentów

Komponenty zostaną zaimplementowane jako interaktywne wyspy React (`.tsx`) w ramach stron Astro (`.astro`).

### Strona: `/pages/generuj.astro`
```
- Layout.astro
  - GenerationForm.tsx (client:load)
    - form
      - Textarea (z biblioteki Shadcn/ui)
      - p (licznik znaków)
      - Button (Shadcn/ui, typ="submit")
    - LoadingSpinner.tsx (wyświetlany warunkowo)
```

### Strona: `/pages/przeglad/[generationId].astro`
```
- Layout.astro
  - ReviewForm.tsx (client:load)
    - h2 (Tytuł, np. "Propozycje fiszek")
    - FlashcardProposalItem.tsx[] (mapowanie po liście propozycji)
      - Card (Shadcn/ui)
        - Tryb wyświetlania:
          - p (tekst przodu)
          - p (tekst tyłu)
          - Button ("Edytuj")
          - Button ("Usuń")
        - Tryb edycji:
          - Input (dla przodu)
          - Textarea (dla tyłu)
          - Button ("Zapisz")
          - Button ("Anuluj")
    - Button ("Zapisz fiszki", na dole formularza)
```

## 4. Szczegóły komponentów

### `GenerationForm.tsx`
- **Opis komponentu**: Formularz odpowiedzialny za przyjmowanie tekstu od użytkownika, walidację i wysyłanie go do API w celu wygenerowania fiszek. Zarządza stanem ładowania i nawigacją po udanym generowaniu.
- **Główne elementy**: `<form>`, `<Textarea>`, `<Button>`, komponent wskaźnika ładowania.
- **Obsługiwane zdarzenia**: `onSubmit` na formularzu.
- **Warunki walidacji**: Długość wprowadzonego tekstu musi mieścić się w przedziale 1000-10000 znaków. Przycisk "Generuj" jest nieaktywny, jeśli warunek nie jest spełniony.
- **Typy**: `GenerateFlashcardsCommand`, `GenerateFlashcardsResponseDto`.
- **Propsy**: Brak.

### `ReviewForm.tsx`
- **Opis komponentu**: Główny komponent widoku recenzji. Odpowiada za pobranie propozycji fiszek (z `sessionStorage`), wyświetlenie ich listy, zarządzanie stanem całej kolekcji i wysłanie finalnej wersji do zapisu.
- **Główne elementy**: `<form>`, lista komponentów `FlashcardProposalItem`, przycisk `<Button>` do zapisu.
- **Obsługiwane zdarzenia**: `onSubmit` na formularzu (zapis wszystkich fiszek).
- **Warunki walidacji**: Przycisk "Zapisz fiszki" jest nieaktywny, jeśli lista propozycji jest pusta.
- **Typy**: `FlashcardProposalViewModel`, `CreateFlashcardsCommand`.
- **Propsy**: `generationId: number` (przekazany z dynamicznego parametru URL strony Astro).

### `FlashcardProposalItem.tsx`
- **Opis komponentu**: Reprezentuje pojedynczą propozycję fiszki na liście. Zarządza własnym stanem (tryb wyświetlania/edycji) oraz pozwala na edycję i usuwanie.
- **Główne elementy**: `<Card>`, `<p>`, `<Input>`, `<Textarea>`, `<Button>`.
- **Obsługiwane zdarzenia**: `onClick` dla przycisków "Edytuj", "Zapisz", "Anuluj", "Usuń".
- **Warunki walidacji**: W trybie edycji, pola `front` i `back` nie mogą być puste. `front` nie może przekraczać 200 znaków, a `back` 500 znaków. Przycisk "Zapisz" (wewnątrz komponentu) jest nieaktywny, jeśli walidacja nie przechodzi.
- **Typy**: `FlashcardProposalViewModel`.
- **Propsy**:
    - `proposal: FlashcardProposalViewModel`
    - `onUpdate: (updatedProposal: FlashcardProposalViewModel) => void`
    - `onDelete: (proposalId: string) => void`

## 5. Typy

### `GeneratedFlashcardProposalDto` (z `src/types.ts`)
Typ danych propozycji otrzymywanych z API po generacji.
```typescript
export interface GeneratedFlashcardProposalDto {
  front: string;
  back: string;
  source: Source; // 'ai_generated'
}
```

### `FlashcardProposalViewModel` (nowy typ po stronie klienta)
Typ używany do zarządzania stanem każdej propozycji w komponencie `ReviewForm`.
```typescript
interface FlashcardProposalViewModel {
  id: string; // Unikalne ID po stronie klienta (np. uuid) dla kluczy listy React
  front: string;
  back: string;
  source: 'ai_generated' | 'ai_edited'; // Śledzi, czy fiszka została zmodyfikowana
  isEditing: boolean; // Kontroluje tryb wyświetlania/edycji
}
```

## 6. Zarządzanie stanem

### `GenerationForm.tsx`
Stan będzie zarządzany lokalnie za pomocą haków `useState`:
- `sourceText: useState<string>`: Przechowuje treść wprowadzaną przez użytkownika.
- `isLoading: useState<boolean>`: Kontroluje widoczność wskaźnika ładowania.

### `ReviewForm.tsx`
Zalecane jest stworzenie customowego hooka `useFlashcardProposals` w celu enkapsulacji logiki zarządzania listą propozycji.
- **`useFlashcardProposals(initialProposals: GeneratedFlashcardProposalDto[])`**:
  - Inicjalizuje stan `proposals: useState<FlashcardProposalViewModel[]>`, mapując `initialProposals` i dodając `id`, `isEditing: false` i `source: 'ai_generated'`.
  - Zwraca obiekt z:
    - `proposals`: Aktualna lista fiszek.
    - `updateProposal`: Funkcja do aktualizacji danych pojedynczej fiszki (po edycji).
    - `deleteProposal`: Funkcja do usuwania fiszki z listy.
    - `setProposals`: Funkcja do ustawiania całej listy.

Główny komponent `ReviewForm` będzie używał tego hooka do zarządzania swoją listą.

## 7. Integracja API

### Krok 1: Generowanie fiszek
- **Komponent**: `GenerationForm.tsx`
- **Endpoint**: `POST /api/generations`
- **Typ żądania**: `GenerateFlashcardsCommand`
  ```json
  { "source_text": "..." }
  ```
- **Typ odpowiedzi (sukces)**: `GenerateFlashcardsResponseDto`
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [{ "front": "...", "back": "...", "source": "..." }],
    "generated_count": 5
  }
  ```
- **Akcja frontendu**: Po otrzymaniu odpowiedzi, zapisać `flashcards_proposals` w `sessionStorage` i nawigować do `/przeglad/${generation_id}`.

### Krok 2: Zapisywanie fiszek
- **Komponent**: `ReviewForm.tsx`
- **Endpoint**: `POST /api/flashcards`
- **Typ żądania**: `CreateFlashcardsCommand`
  ```json
  {
    "flashcards": [
      { "front": "...", "back": "...", "source": "ai_edited", "generation_id": 123 }
    ]
  }
  ```
- **Typ odpowiedzi (sukces)**: `CreateFlashcardsResponseDto`
- **Akcja frontendu**: Po pomyślnym zapisie, wyczyścić `sessionStorage` i nawigować do `/moje-fiszki`.

## 8. Interakcje użytkownika

- **Na `/generuj`**: Użytkownik wpisuje tekst, licznik znaków się aktualizuje. Przycisk "Generuj" aktywuje się po spełnieniu walidacji. Po kliknięciu, przycisk jest blokowany, a wskaźnik ładowania się pojawia.
- **Na `/przeglad/[id]`**:
  - Użytkownik klika "Usuń" -> fiszka znika z listy.
  - Użytkownik klika "Edytuj" -> element przełącza się w tryb edycji z polami `input`/`textarea`.
  - Użytkownik zmienia tekst i klika "Zapisz" (wewnątrz fiszki) -> zmiany są zapisywane w stanie, a element wraca do trybu wyświetlania.
  - Użytkownik klika "Zapisz fiszki" (na dole) -> wszystkie fiszki z listy są wysyłane do API.

## 9. Warunki i walidacja

- **`GenerationForm`**:
  - `source_text.length >= 1000 && source_text.length <= 10000`: Warunek odblokowujący przycisk "Generuj". Komunikat o walidacji wyświetlany jest pod polem `textarea`.
- **`FlashcardProposalItem` (tryb edycji)**:
  - `front.length > 0 && front.length <= 200`: Warunek dla pola `front`.
  - `back.length > 0 && back.length <= 500`: Warunek dla pola `back`.
  - Przycisk "Zapisz" (wewnątrz fiszki) jest aktywny tylko, gdy oba warunki są spełnione.

## 10. Obsługa błędów

- **Błąd API przy generowaniu**: Wyświetlić powiadomienie "Toast" z komunikatem "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie." Stan ładowania jest resetowany.
- **Błąd API przy zapisywaniu**: Wyświetlić "Toast" z komunikatem "Nie udało się zapisać fiszek. Spróbuj ponownie." Stan ładowania jest resetowany.
- **Brak danych w `sessionStorage`**: Jeśli użytkownik wejdzie bezpośrednio na `/przeglad/[id]`, komponent `ReviewForm` powinien wyświetlić komunikat "Brak propozycji do recenzji." z linkiem powrotnym do `/generuj`.

## 11. Kroki implementacji

1.  **Stworzenie struktury plików**: Utworzyć pliki `/pages/generuj.astro`, `/pages/przeglad/[generationId].astro` oraz pliki komponentów React w `src/components/`.
2.  **Implementacja `GenerationForm.tsx`**: Zbudować formularz z `Textarea` i `Button` z Shadcn/ui. Zaimplementować logikę stanu, walidacji i komunikacji z `POST /api/generations`.
3.  **Implementacja logiki nawigacji**: Dodać przekierowanie do widoku recenzji po udanym generowaniu, przekazując propozycje przez `sessionStorage`.
4.  **Implementacja `ReviewForm.tsx`**: Zbudować główny komponent widoku recenzji. Dodać logikę odczytu danych z `sessionStorage` przy montowaniu komponentu.
5.  **Stworzenie `useFlashcardProposals`**: Zaimplementować customowy hook do zarządzania listą propozycji fiszek.
6.  **Implementacja `FlashcardProposalItem.tsx`**: Zbudować komponent dla pojedynczej fiszki, implementując przełączanie między trybem wyświetlania i edycji, walidację pól oraz propagowanie zmian do komponentu nadrzędnego.
7.  **Integracja zapisu fiszek**: Dodać obsługę `onSubmit` do `ReviewForm.tsx` w celu wysłania danych do `POST /api/flashcards`.
8.  **Obsługa błędów i stanów krańcowych**: Dodać wskaźniki ładowania oraz obsługę błędów za pomocą powiadomień "Toast" dla obu wywołań API. Zabezpieczyć widok recenzji przed brakiem danych.
9.  **Stylowanie i testowanie**: Dopracować wygląd za pomocą Tailwind CSS i przetestować cały przepływ pod kątem zgodności z wymaganiami.
