# Architektura UI dla 10x Cards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji 10x Cards została zaprojektowana w celu zapewnienia prostego, intuicyjnego i skoncentrowanego na zadaniach doświadczenia dla użytkownika. Opiera się na jasnym podziale na strefę publiczną (dostępną dla niezalogowanych użytkowników) i prywatną (dostępną po uwierzytelnieniu).

Główny przepływ użytkownika w wersji MVP koncentruje się na generowaniu fiszek przez AI, ich przeglądzie i edycji, a następnie dodaniu do osobistej kolekcji, z której można inicjować sesje nauki. Struktura jest oparta na komponentach, co ułatwi jej rozbudowę w przyszłości. Nawigacja w strefie prywatnej jest scentralizowana w górnym pasku, zapewniając stały dostęp do kluczowych funkcji aplikacji. Projekt uwzględnia responsywność (mobile-first) i dostępność, aby zapewnić spójne doświadczenie na różnych urządzeniach.

## 2. Lista widoków

### Widok: Logowanie
- **Nazwa widoku**: Logowanie
- **Ścieżka widoku**: `/logowanie`
- **Główny cel**: Uwierzytelnienie istniejącego użytkownika i uzyskanie dostępu do jego konta.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami na adres e-mail i hasło. Link do strony rejestracji.
- **Kluczowe komponenty widoku**: `LoginForm`, `TextInput`, `Button`, `Toast` (do wyświetlania błędów).
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Jasne komunikaty o błędach (np. "Nieprawidłowy e-mail lub hasło"). Wskaźnik ładowania podczas próby logowania.
    - **Dostępność**: Poprawne etykiety dla pól formularza, walidacja po stronie klienta i serwera, obsługa nawigacji klawiaturą.
    - **Bezpieczeństwo**: Komunikacja z API przez HTTPS. Brak przechowywania hasła w stanie aplikacji.

### Widok: Rejestracja
- **Nazwa widoku**: Rejestracja
- **Ścieżka widoku**: `/rejestracja`
- **Główny cel**: Umożliwienie nowym użytkownikom założenia konta w aplikacji.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami na adres e-mail i hasło. Link do strony logowania.
- **Kluczowe komponenty widoku**: `RegistrationForm`, `TextInput`, `Button`, `Toast`.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Wymagania dotyczące hasła (np. minimalna długość) powinny być jasno komunikowane. Informacja zwrotna o pomyślnej rejestracji.
    - **Dostępność**: Podobne jak w widoku logowania.
    - **Bezpieczeństwo**: Walidacja formatu adresu e-mail.

### Widok: Generowanie Fiszek
- **Nazwa widoku**: Generuj Fiszki
- **Ścieżka widoku**: `/generuj`
- **Główny cel**: Umożliwienie użytkownikowi wklejenia tekstu i zainicjowania procesu generowania fiszek przez AI.
- **Kluczowe informacje do wyświetlenia**: Duże pole tekstowe na tekst źródłowy, informacja o limitach znaków (1000-10000), przycisk do generowania.
- **Kluczowe komponenty widoku**: `GenerationForm`, `Textarea`, `Button`, `LoadingIndicator`.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Wyraźny wskaźnik postępu (np. animacja ładowania) po kliknięciu "Generuj", aby poinformować użytkownika, że proces jest w toku. Przycisk powinien być nieaktywny, jeśli tekst nie spełnia limitów długości.
    - **Dostępność**: Etykieta dla pola tekstowego, dostępność przycisku kontrolowana przez stan formularza.
    - **Bezpieczeństwo**: Walidacja długości tekstu po stronie klienta i serwera.

### Widok: Przegląd i Akceptacja Wygenerowanych Fiszek
- **Nazwa widoku**: Przegląd Fiszek
- **Ścieżka widoku**: `/przeglad/{generationId}` (dynamiczna ścieżka)
- **Główny cel**: Przedstawienie użytkownikowi propozycji fiszek wygenerowanych przez AI, umożliwienie ich edycji i ostatecznej akceptacji.
- **Kluczowe informacje do wyświetlenia**: Lista wygenerowanych par przód-tył, nagłówek informujący o liczbie propozycji.
- **Kluczowe komponenty widoku**: `FlashcardProposalList`, `FlashcardProposalItem` (z trybem edycji), `Button` ("Edytuj", "Zapisz"), `Button` ("Zapisz wszystko").
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Edycja "inline" (w miejscu) powinna być intuicyjna. Wyraźne rozróżnienie między zapisaniem pojedynczej fiszki a zapisaniem całego zestawu. Po kliknięciu "Zapisz wszystko" użytkownik powinien otrzymać komunikat o sukcesie i zostać przekierowany.
    - **Dostępność**: Możliwość nawigacji po liście i edycji za pomocą klawiatury.
    - **Bezpieczeństwo**: Dane przesyłane do edycji muszą być walidowane. Użytkownik powinien mieć dostęp tylko do swoich generacji.

### Widok: Moje Fiszki
- **Nazwa widoku**: Moje Fiszki
- **Ścieżka widoku**: `/moje-fiszki`
- **Główny cel**: Wyświetlenie wszystkich zaakceptowanych fiszek użytkownika, umożliwienie zarządzania nimi i inicjowanie sesji nauki.
- **Kluczowe informacje do wyświetlenia**: Paginowana lista fiszek, przycisk "Rozpocznij naukę".
- **Kluczowe komponenty widoku**: `FlashcardList`, `FlashcardListItem`, `Pagination`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Czytelne przedstawienie treści fiszek. Prosta i zrozumiała paginacja. Stan pusty (brak fiszek) powinien zawierać zachętę do wygenerowania pierwszych kart.
    - **Dostępność**: Poprawna struktura listy dla czytników ekranu.
    - **Bezpieczeństwo**: Użytkownik widzi wyłącznie własne fiszki (RLS w Supabase).

### Widok: Sesja Nauki
- **Nazwa widoku**: Sesja Nauki
- **Ścieżka widoku**: `/nauka`
- **Główny cel**: Przeprowadzenie użytkownika przez sesję nauki opartą na algorytmie powtórek.
- **Kluczowe informacje do wyświetlenia**: Przód fiszki, licznik postępu (np. "3/10"), przycisk do odkrycia odpowiedzi, a następnie przyciski oceny ("Zapamiętane", "Do powtórki").
- **Kluczowe komponenty widoku**: `FlashcardPlayer`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Płynne animacje przejścia między przodem a tyłem fiszki oraz między kolejnymi fiszkami. Minimalistyczny interfejs, aby skupić uwagę na nauce.
    - **Dostępność**: Obsługa za pomocą klawiatury (np. spacja do odkrycia odpowiedzi, klawisze numeryczne do oceny).
    - **Bezpieczeństwo**: Operacje oceny powinny być autoryzowane.

### Widok: Podsumowanie Sesji Nauki
- **Nazwa widoku**: Podsumowanie Nauki
- **Ścieżka widoku**: `/nauka/podsumowanie`
- **Główny cel**: Wyświetlenie wyników zakończonej sesji nauki.
- **Kluczowe informacje do wyświetlenia**: Liczba fiszek ocenionych jako "Zapamiętane" i "Do powtórki", przycisk powrotu do panelu głównego.
- **Kluczowe komponenty widoku**: `SummaryDisplay`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Prosty, motywujący komunikat podsumowujący.
    - **Dostępność**: Czytelne przedstawienie statystyk.

## 3. Mapa podróży użytkownika

### Główny przepływ: Generowanie i zapisywanie fiszek
1.  **Rejestracja/Logowanie**: Nowy użytkownik trafia na `/rejestracja`, zakłada konto i jest automatycznie logowany. Istniejący użytkownik loguje się na `/logowanie`.
2.  **Przekierowanie**: Po zalogowaniu użytkownik jest przekierowywany do widoku `/moje-fiszki` (panel główny).
3.  **Inicjowanie generowania**: Użytkownik klika "Generuj" w nawigacji i przechodzi do widoku `/generuj`.
4.  **Wprowadzenie tekstu**: Użytkownik wkleja tekst i klika przycisk "Generuj". Wyświetlany jest stan ładowania.
5.  **Przegląd i edycja**: Po pomyślnym przetworzeniu przez API, użytkownik jest przekierowywany do `/przeglad/{id}`, gdzie widzi listę propozycji. Edytuje treść fiszek według potrzeb, używając przycisków "Edytuj" i "Zapisz" przy każdej pozycji.
6.  **Zapisanie kolekcji**: Gdy fiszki są gotowe, użytkownik klika "Zapisz wszystko". Aplikacja wysyła zaakceptowane fiszki do API.
7.  **Potwierdzenie i powrót**: Po pomyślnym zapisaniu wyświetlany jest komunikat "Toast", a użytkownik jest przekierowywany do `/moje-fiszki`, gdzie widzi zaktualizowaną listę swoich kart.

### Przepływ dodatkowy: Sesja nauki
1.  **Inicjowanie nauki**: W widoku `/moje-fiszki`, użytkownik klika "Rozpocznij naukę".
2.  **Przebieg sesji**: Użytkownik jest przenoszony do widoku `/nauka`, gdzie jedna po drugiej prezentowane są fiszki. Odkrywa odpowiedzi i ocenia swoją wiedzę.
3.  **Zakończenie**: Po przejściu przez wszystkie fiszki w sesji, użytkownik trafia do widoku `/nauka/podsumowanie`.
4.  **Powrót**: Z podsumowania użytkownik wraca do widoku `/moje-fiszki`.

## 4. Układ i struktura nawigacji

Aplikacja będzie posiadać dwa główne układy (layouts):
1.  **`PublicLayout`**: Prosty layout dla stron `/logowanie` i `/rejestracja`, bez nawigacji.
2.  **`ProtectedLayout`**: Główny layout aplikacji, który obejmuje wszystkie strony prywatne. Sprawdza status uwierzytelnienia użytkownika i w przypadku jego braku, przekierowuje na stronę logowania.

Kluczowym elementem `ProtectedLayout` jest **górny pasek nawigacyjny**, który zawiera:
- Logo aplikacji (link do `/moje-fiszki`).
- Linki do głównych sekcji:
    - **Generuj** (`/generuj`)
    - **Moje Fiszki** (`/moje-fiszki`)
    - **Nauka** (`/nauka`)
- Przycisk/menu użytkownika z opcją **Wyloguj**.

## 5. Kluczowe komponenty

- **`Button`**: Generyczny komponent przycisku z różnymi wariantami (główny, drugorzędny, etc.), zgodny z Shadcn/ui.
- **`TextInput` / `Textarea`**: Komponenty formularzy do wprowadzania danych.
- **`Toast`**: Komponent do wyświetlania globalnych, tymczasowych powiadomień (np. o sukcesie zapisu, o błędach API).
- **`LoadingIndicator`**: Animowany wskaźnik używany podczas operacji asynchronicznych (np. generowanie fiszek, logowanie).
- **`Pagination`**: Komponent do nawigacji po stronach listy fiszek.
- **`FlashcardListItem`**: Komponent wyświetlający pojedynczą fiszkę na liście w widoku `/moje-fiszki`.
- **`FlashcardProposalItem`**: Komponent dla pojedynczej propozycji fiszki na ekranie przeglądu, zawierający logikę przełączania między trybem wyświetlania a edycji.
- **`FlashcardPlayer`**: Interaktywny komponent obsługujący logikę sesji nauki (pokazywanie przodu, odkrywanie tyłu, obsługa oceny).
