# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom generowanie propozycji fiszek na podstawie dostarczonego przez nich tekstu. Proces wykorzystuje zewnętrzną usługę AI do analizy tekstu i tworzenia par pytanie-odpowiedź. Punkt końcowy rejestruje metadane dotyczące procesu generowania i zwraca propozycje fiszek do użytkownika w celu ich dalszej weryfikacji i zapisu.

## 2. Szczegóły żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/generations`
- **Request Body**:
  ```json
  {
    "source_text": "Tekst dostarczony przez użytkownika (string, 1000-10000 znaków)"
  }
  ```
- **Nagłówki**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <SUPABASE_JWT>` (obsługiwane przez Supabase SDK)

## 3. Wykorzystywane typy

- **Command Model (Żądanie)**: `GenerateFlashcardsCommand`
- **DTO (Odpowiedź)**: `GenerateFlashcardsResponseDto`, `GeneratedFlashcardProposalDto`

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (201 Created)**:
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      { 
        "front": "Wygenerowane Pytanie 1", 
        "back": "Wygenerowana Odpowiedź 1",
        "source": "ai_generated"
      },
      { 
        "front": "Wygenerowane Pytanie 2", 
        "back": "Wygenerowana Odpowiedź 2",
        "source": "ai_generated"
      }
    ],
    "generated_count": 2
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowe dane wejściowe.
  - `401 Unauthorized`: Brak uwierzytelnienia.
  - `500 Internal Server Error`: Błąd serwera lub usługi AI.

## 5. Przepływ danych

1.  Użytkownik wysyła żądanie `POST` z `source_text` do `/api/generations`.
2.  Middleware Astro weryfikuje token JWT i pobiera sesję użytkownika z `context.locals`. Jeśli użytkownik nie jest uwierzytelniony, zwraca błąd 401.
3.  Handler endpointu (`src/pages/api/generations.ts`) parsuje i waliduje ciało żądania przy użyciu schemy Zod. W przypadku błędu walidacji zwraca 400.
4.  Handler wywołuje metodę w `GenerationService`, przekazując `source_text` i `user_id`.
5.  `GenerationService` oblicza hash SHA-256 z `source_text` w celu identyfikacji i unikania duplikatów.
6.  `GenerationService` komunikuje się z usługą AI (OpenRouter.ai) w celu wygenerowania fiszek.
7.  Po otrzymaniu odpowiedzi od AI, `GenerationService` tworzy nowy wpis w tabeli `generations` z metadanymi (np. `user_id`, `model`, `generated_count`, `source_text_hash`).
8.  `GenerationService` zwraca `generation_id` i listę propozycji fiszek do handlera.
9.  Handler formatuje odpowiedź jako `GenerateFlashcardsResponseDto` i wysyła ją do klienta z kodem statusu 201.
10. W przypadku błędu komunikacji z AI, `GenerationService` zapisuje szczegóły błędu w tabeli `generation_error_logs` i rzuca wyjątek.
11. Globalny error handler (lub handler w endpoincie) przechwytuje wyjątek i zwraca odpowiedź z kodem 500.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Dostęp do endpointu jest ograniczony do uwierzytelnionych użytkowników. Middleware Astro będzie weryfikować token Supabase JWT przy każdym żądaniu.
- **Autoryzacja**: Każdy uwierzytelniony użytkownik może korzystać z tej funkcji. Nie ma dodatkowych ról ani uprawnień.
- **Walidacja danych**: Ciało żądania jest ściśle walidowane za pomocą Zod, aby zapewnić, że `source_text` jest stringiem o określonej długości. Zapobiega to przetwarzaniu nieprawidłowych danych i potencjalnym atakom.
- **Ochrona przed nadużyciami**: Walidacja długości `source_text` stanowi podstawową ochronę przed generowaniem nadmiernych kosztów. W przyszłości należy rozważyć implementację mechanizmu rate limiting (np. na podstawie adresu IP lub ID użytkownika).

## 7. Obsługa błędów

- **400 Bad Request**:
  - **Scenariusz**: `source_text` brakuje, nie jest stringiem lub jego długość jest poza zakresem 1000-10000 znaków.
  - **Obsługa**: Zod schema zwróci szczegółowy błąd walidacji, który zostanie odesłany w ciele odpowiedzi.
- **401 Unauthorized**:
  - **Scenariusz**: Użytkownik próbuje uzyskać dostęp do endpointu bez ważnego tokenu JWT.
  - **Obsługa**: Middleware Astro zwróci standardową odpowiedź błędu 401.
- **500 Internal Server Error**:
  - **Scenariusz**: Wystąpił błąd podczas komunikacji z usługą AI, błąd zapisu do bazy danych lub inny nieoczekiwany błąd serwera.
  - **Obsługa**: Błąd zostanie zarejestrowany w tabeli `generation_error_logs`. Do klienta zostanie wysłana generyczna wiadomość o błędzie serwera.

## 8. Rozważania dotyczące wydajności

- **Czas odpowiedzi**: Głównym czynnikiem wpływającym na czas odpowiedzi będzie usługa AI. Czas generowania fiszek może być znaczący (kilka sekund). Operacja powinna być asynchroniczna, a frontend powinien informować użytkownika o trwającym procesie.
- **Operacje na bazie danych**: Operacje zapisu do tabel `generations` i `generation_error_logs` są proste i nie powinny stanowić wąskiego gardła. Indeksowanie kolumn `user_id` i `source_text_hash` może poprawić wydajność zapytań w przyszłości.
- **Obciążenie serwera**: Obliczanie hasha `source_text` jest operacją szybką. Główne obciążenie jest przeniesione na zewnętrzną usługę AI.

## 9. Etapy wdrożenia

1.  **Stworzenie schemy Zod**: Zdefiniować schemę walidacji dla `GenerateFlashcardsCommand` w nowym pliku `src/lib/validation/generationSchemas.ts`.
2.  **Implementacja `GenerationService`**:
    - Stworzyć plik `src/lib/services/GenerationService.ts`.
    - Zaimplementować metodę do komunikacji z API OpenRouter.ai.
    - Zaimplementować logikę obliczania hasha SHA-256 dla `source_text`.
    - Zaimplementować metody do zapisu danych w tabelach `generations` i `generation_error_logs` przy użyciu klienta Supabase.
    - Stworzyć główną metodę serwisu, która będzie orkiestrować cały proces.
3.  **Implementacja endpointu API**:
    - Stworzyć plik `src/pages/api/generations.ts`.
    - Dodać `export const prerender = false;`.
    - Zaimplementować handler `POST`, który będzie korzystał z `Astro.locals` do pobrania klienta Supabase i sesji użytkownika.
    - Zintegrować walidację Zod na początku handlera.
    - Wywołać `GenerationService` i obsłużyć odpowiedź sukcesu oraz potencjalne błędy.
    - Zwrócić odpowiednio sformatowane odpowiedzi HTTP (201, 400, 500).
4.  **Konfiguracja zmiennych środowiskowych**: Dodać klucz API dla OpenRouter.ai do zmiennych środowiskowych (`.env`).
5.  **Testowanie**:
    - Napisać testy jednostkowe dla `GenerationService` (mockując usługę AI i bazę danych).
    - Przeprowadzić testy integracyjne endpointu przy użyciu narzędzi takich jak Postman lub cURL, sprawdzając wszystkie scenariusze (sukces, błędy walidacji, błędy serwera).
