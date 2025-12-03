<conversation_summary>
<decisions>
1. Encja `flashcards` będzie powiązana z użytkownikami poprzez klucz obcy `user_id` do tabeli `auth.users` i zabezpieczona za pomocą polityk RLS.
2. System Leitnera zostanie zaimplementowany przy użyciu kolumn `box_number` (integer) i `next_review_at` (timestamp with time zone).
3. Zawartość awersu i rewersu fiszki będzie przechowywana w kolumnach typu `TEXT`.
4. Zostaną utworzone indeksy na kolumnie `user_id` oraz indeks złożony na `(user_id, next_review_at)` w celu optymalizacji wydajności.
5. Fiszki będą usuwane trwale (hard delete), bez implementacji mechanizmu "soft delete" w wersji MVP.
6. Źródło pochodzenia fiszki będzie śledzone za pomocą typu `ENUM` z wartościami `ai_generated`, `ai_edited` i `manual`.
7. Klucze główne we wszystkich tabelach będą typu `UUID`.
8. Historia sesji nauki nie będzie zapisywana w bazie danych; podsumowania będą generowane dynamicznie po każdej sesji.
9. Zapewniona zostanie integralność danych poprzez ograniczenia `NOT NULL` na kluczowych kolumnach (`user_id`, `front`, `back`) oraz zastosowanie reguły `ON DELETE CASCADE` dla klucza obcego `user_id`.
10. Zostanie utworzona tabela `generations` do śledzenia metryk związanych z generowaniem fiszek przez AI.
11. Zostanie utworzona tabela `generation_error_logs` do logowania błędów występujących podczas procesu generowania.
</decisions>

<matched_recommendations>
1. Należy utworzyć kolumnę `user_id` w tabeli `flashcards` jako klucz obcy do `auth.users` i zaimplementować polityki RLS w celu izolacji danych użytkowników.
2. Do tabeli `flashcards` należy dodać kolumny `box_number` (integer) i `next_review_at` (timestamp) do obsługi algorytmu powtórek.
3. Dla pól `front` i `back` w fiszkach należy użyć typu danych `TEXT`.
4. W celu optymalizacji zapytań należy utworzyć indeks na `user_id` oraz indeks złożony na `(user_id, next_review_at)`.
5. Dla MVP należy zaimplementować trwałe usuwanie fiszek, co jest zgodne z pierwotnymi wymaganiami.
6. Do śledzenia pochodzenia fiszek należy dodać kolumnę `source` z typem wyliczeniowym `ENUM` (`ai_generated`, `ai_edited`, `manual`).
7. Jako kluczy głównych należy używać `UUID`.
8. Należy zrezygnować z przechowywania historii sesji nauki w bazie danych w ramach MVP.
9. Należy zastosować ograniczenia `NOT NULL` oraz klucz obcy z `ON DELETE CASCADE` w celu zapewnienia spójności i integralności danych.
10. Należy utworzyć tabelę `generations` w celu zbierania danych analitycznych dotyczących wykorzystania modeli AI.
11. Należy utworzyć tabelę `generation_error_logs` w celu monitorowania i diagnozowania problemów z generowaniem fiszek.
</matched_recommendations>

<database_planning_summary>
Na podstawie analizy wymagań produktu (PRD) oraz dyskusji, schemat bazy danych dla MVP aplikacji 10x Cards został zaplanowany w następujący sposób:

**Główne wymagania dotyczące schematu:**
Schemat musi obsługiwać uwierzytelnianie użytkowników, pełen cykl życia fiszek (tworzenie, odczyt, aktualizacja, usuwanie), proces generowania fiszek przez AI oraz uproszczony system powtórek interwałowych (spaced repetition). Dodatkowo, schemat musi umożliwiać zbieranie metryk dotyczących generowania fiszek i logowanie błędów.

**Kluczowe encje i ich relacje:**
1.  **`users`**: Encja dostarczana przez Supabase Auth (`auth.users`), przechowująca dane uwierzytelniające użytkowników.
2.  **`flashcards`**: Główna tabela przechowująca zaakceptowane fiszki. Będzie zawierać kolumny: `id` (PK, UUID), `user_id` (FK do `auth.users`), `generation_id` (FK do `generations`, NULLABLE), `front` (TEXT, NOT NULL), `back` (TEXT, NOT NULL), `box_number` (INTEGER, NOT NULL, default 1), `next_review_at` (TIMESTAMPTZ, NOT NULL), `source` (ENUM, NOT NULL) oraz standardowe znaczniki czasu. Relacje: jeden użytkownik może mieć wiele fiszek; jedna fiszka może opcjonalnie należeć do jednej generacji.
3.  **`generations`**: Tabela do logowania zdarzeń generowania fiszek przez AI. Pola: `id` (PK, BIGSERIAL), `user_id` (FK do `auth.users`), `model` (VARCHAR), `generated_count` (INTEGER), `accepted_unedited_count` (INTEGER), `accepted_edited_count` (INTEGER), `source_text_hash` (VARCHAR), `source_text_length` (INTEGER z ograniczeniem CHECK), `generation_duration` (INTEGER), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ). Relacja: jedna generacja może być powiązana z wieloma fiszkami.
4.  **`generation_error_logs`**: Tabela do logowania błędów podczas generowania. Pola: `id` (PK, BIGSERIAL), `user_id` (FK do `auth.users`), `model` (VARCHAR), `source_text_hash` (VARCHAR), `source_text_length` (INTEGER z ograniczeniem CHECK), `error_code` (VARCHAR), `error_message` (TEXT), `created_at` (TIMESTAMPTZ).

**Bezpieczeństwo i Skalowalność:**
-   **Bezpieczeństwo**: Kluczowym elementem jest wdrożenie polityk bezpieczeństwa na poziomie wiersza (RLS) dla wszystkich tabel zawierających dane użytkowników. Polityki te będą oparte na `auth.uid() = user_id`, co zagwarantuje, że użytkownicy mają dostęp wyłącznie do swoich danych. Dodatkowo, zastosowanie reguły `ON DELETE CASCADE` dla relacji z tabelą `users` zapewni realizację prawa do usunięcia danych (RODO).
-   **Wydajność i Skalowalność**: Podstawą wydajności w MVP będą odpowiednio dobrane indeksy. Indeks na `user_id` przyspieszy pobieranie wszystkich fiszek użytkownika, a złożony indeks na `(user_id, next_review_at)` jest krytyczny dla szybkiego działania funkcji rozpoczynania sesji nauki, która jest główną pętlą interakcji z aplikacją. Użycie typu `UUID` dla kluczy głównych jest dobrą praktyką wspierającą przyszłą skalowalność.

</database_planning_summary>

<unresolved_issues>
W ramach planowania bazy danych dla wersji MVP wszystkie kluczowe kwestie zostały omówione i rozwiązane. Nie zidentyfikowano żadnych nierozwiązanych problemów, które wymagałyby dalszych wyjaśnień na tym etapie.
</unresolved_issues>
</conversation_summary>
