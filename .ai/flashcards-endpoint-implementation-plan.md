# API Endpoint Implementation Plan: /flashcards

## 1. Przegląd punktu końcowego

Ten dokument opisuje plan wdrożenia zasobu `/flashcards` w ramach REST API, który obejmuje wszystkie operacje CRUD (Create, Read, Update, Delete). Punkt końcowy umożliwi użytkownikom zarządzanie ich kolekcją fiszek, w tym pobieranie listy, tworzenie nowych (ręcznie lub z generatora AI), aktualizowanie i usuwanie.

## 2. Szczegóły żądania

### GET /flashcards
- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/flashcards`
- **Parametry:**
    - **Wymagane:** Brak
    - **Opcjonalne (Query Params):**
        - `page` (number, default: 1): Numer strony do pobrania.
        - `limit` (number, default: 10): Liczba wyników na stronie.
        - `sort` (string, e.g., 'created_at'): Pole do sortowania.
        - `order` (string, 'asc' | 'desc'): Kierunek sortowania.
        - `source` (string): Filtr po źródle fiszki.
        - `generation_id` (number): Filtr po ID generacji.
- **Request Body:** Brak

### GET /flashcards/{id}
- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/flashcards/{id}`
- **Parametry:**
    - **Wymagane (Path Param):** `id` (number) - ID fiszki.
- **Request Body:** Brak

### POST /flashcards
- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/flashcards`
- **Request Body:** `CreateFlashcardsCommand`
  ```json
  {
    "flashcards": [
      {
        "front": "string (max 200)",
        "back": "string (max 500)",
        "source": "'manual' | 'ai_generated' | 'ai_edited'",
        "generation_id": "number | null"
      }
    ]
  }
  ```

### PUT /flashcards/{id}
- **Metoda HTTP:** `PUT`
- **Struktura URL:** `/api/flashcards/{id}`
- **Parametry:**
    - **Wymagane (Path Param):** `id` (number) - ID fiszki.
- **Request Body:** `UpdateFlashcardCommand`
  ```json
  {
    "front": "string (max 200)",
    "back": "string (max 500)"
  }
  ```
  *Uwaga: Przynajmniej jedno pole jest wymagane.*

### DELETE /flashcards/{id}
- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/flashcards/{id}`
- **Parametry:**
    - **Wymagane (Path Param):** `id` (number) - ID fiszki.
- **Request Body:** Brak

## 3. Wykorzystywane typy
- `FlashcardDto`
- `ListFlashcardsResponseDto`
- `CreateFlashcardsCommand`
- `CreateFlashcardDto`
- `CreateFlashcardsResponseDto`
- `UpdateFlashcardCommand`

## 4. Szczegóły odpowiedzi
- **`200 OK`**: Pomyślne wykonanie operacji `GET`, `PUT`, `DELETE`.
    - `GET /flashcards`: Zwraca `ListFlashcardsResponseDto`.
    - `GET /flashcards/{id}`: Zwraca `FlashcardDto`.
    - `PUT /flashcards/{id}`: Zwraca zaktualizowany `FlashcardDto`.
    - `DELETE /flashcards/{id}`: Zwraca pustą odpowiedź z kodem 204 No Content.
- **`201 Created`**: Pomyślne utworzenie zasobów po `POST /flashcards`. Zwraca `CreateFlashcardsResponseDto`.
- Kody błędów: `400`, `401`, `404`, `500`.

## 5. Przepływ danych
1.  Żądanie przychodzące jest przechwytywane przez odpowiedni plik trasy Astro w `src/pages/api/flashcards/`.
2.  Middleware Astro weryfikuje token JWT i dołącza do `context.locals` klienta Supabase oraz sesję użytkownika.
3.  Handler endpointu (np. `POST`) pobiera klienta Supabase i dane użytkownika z `context.locals`.
4.  Dane wejściowe (ciało żądania, parametry zapytania) są walidowane za pomocą schematów Zod zdefiniowanych w `src/lib/validation/flashcard-schemas.ts`.
5.  Handler wywołuje odpowiednią funkcję z serwisu `src/lib/services/flashcards-service.ts`, przekazując klienta Supabase, ID użytkownika i zwalidowane dane.
6.  Funkcja serwisowa wykonuje operacje na bazie danych PostgreSQL poprzez Supabase, polegając na politykach RLS do autoryzacji.
7.  Serwis zwraca dane lub błąd do handlera.
8.  Handler formatuje odpowiedź HTTP z odpowiednim kodem statusu i ciałem, a następnie wysyła ją do klienta.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Wszystkie punkty końcowe będą chronione i będą wymagały ważnego tokenu JWT (Bearer Token) w nagłówku `Authorization`.
- **Autoryzacja:** Dostęp do danych jest kontrolowany przez polityki Row-Level Security (RLS) w bazie danych Supabase. Każde zapytanie do bazy danych będzie wykonywane przy użyciu klienta Supabase specyficznego dla użytkownika (z `context.locals`), co gwarantuje, że użytkownicy mogą operować wyłącznie na własnych fiszkach.
- **Walidacja danych:** Wszystkie dane wejściowe od klienta będą rygorystycznie walidowane za pomocą Zod, aby zapobiec atakom (np. SQL Injection, Mass Assignment) i zapewnić spójność danych.

## 7. Obsługa błędów
- **`400 Bad Request`**: Zwracany, gdy walidacja danych wejściowych (ciała żądania lub parametrów query) nie powiodła się. Odpowiedź będzie zawierać szczegóły błędu walidacji.
- **`401 Unauthorized`**: Zwracany przez middleware, jeśli brakuje tokenu JWT, jest on nieważny lub wygasł.
- **`404 Not Found`**: Zwracany, gdy zasób (fiszka o podanym ID) nie istnieje lub nie należy do danego użytkownika.
- **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów po stronie serwera, np. problemów z połączeniem z bazą danych. Błąd zostanie zalogowany po stronie serwera.

## 8. Rozważania dotyczące wydajności
- **Paginacja:** `GET /flashcards` domyślnie zwraca tylko 10 wyników, co zapobiega przesyłaniu dużych ilości danych i przeciążaniu klienta oraz serwera.
- **Indeksy bazy danych:** Należy upewnić się, że kolumny `user_id` i `generation_id` w tabeli `flashcards` są zindeksowane, aby przyspieszyć operacje filtrowania i wyszukiwania.
- **Zapytania w paczkach (Batching):** Endpoint `POST /flashcards` jest zaprojektowany do przyjmowania tablicy fiszek, co pozwala na ich wstawienie do bazy danych w ramach jednej transakcji (`.insert([...])`), co jest znacznie wydajniejsze niż wielokrotne pojedyncze żądania.

## 9. Etapy wdrożenia
1.  **Utworzenie schematów walidacji:** Stworzyć plik `src/lib/validation/flashcard-schemas.ts` i zdefiniować w nim schematy Zod dla `ListFlashcardsQuerySchema`, `CreateFlashcardsCommandSchema` i `UpdateFlashcardCommandSchema`.
2.  **Implementacja serwisu:** Stworzyć plik `src/lib/services/flashcards-service.ts` i zaimplementować w nim funkcje do obsługi logiki biznesowej (listowanie, tworzenie, aktualizacja, usuwanie fiszek), które przyjmują klienta Supabase i ID użytkownika jako argumenty.
3.  **Implementacja punktu końcowego `index`:** Stworzyć plik `src/pages/api/flashcards/index.ts`. Zaimplementować handlery `GET` i `POST`, które będą wykorzystywać walidację i serwis stworzone w poprzednich krokach.
4.  **Implementacja punktu końcowego `[id]`:** Stworzyć plik `src/pages/api/flashcards/[id].ts`. Zaimplementować handlery `GET`, `PUT` i `DELETE`, które będą analogicznie korzystać z walidacji i serwisu.
5.  **Testowanie:** Przygotować testy (manualne lub automatyczne) dla każdego endpointu, uwzględniając ścieżki pomyślne oraz scenariusze błędów (np. błędne dane, brak autoryzacji, próba dostępu do cudzych danych).
