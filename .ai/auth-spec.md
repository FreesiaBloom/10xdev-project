# Specyfikacja Techniczna - Moduł Autentykacji

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji użytkowników w aplikacji 10x Cards, zgodnie z wymaganiami US-001, US-002, US-003 z dokumentu PRD oraz zdefiniowanym stosem technologicznym.

## 1. Architektura Interfejsu Użytkownika (Frontend)

Warstwa frontendowa zostanie rozbudowana o nowe strony, komponenty i logikę do obsługi procesów autentykacji, z jasnym podziałem odpowiedzialności między statyczne strony Astro i dynamiczne komponenty React.

### 1.1. Nowe Strony (Astro)

Zostaną utworzone następujące strony w katalogu `src/pages/`:

-   `auth/login.astro`: Publiczna strona logowania. Będzie renderować komponent `LoginForm.tsx`.
-   `auth/register.astro`: Publiczna strona rejestracji. Będzie renderować komponent `RegisterForm.tsx`.
-   `auth/forgot-password.astro`: Publiczna strona do inicjowania procesu odzyskiwania hasła. Będzie renderować `ForgotPasswordForm.tsx`.
-   `auth/reset-password.astro`: Strona, na którą użytkownik jest przekierowywany z linku w e-mailu w celu ustawienia nowego hasła. Będzie renderować `ResetPasswordForm.tsx`.

Strony `generate.astro`, `my-flashcards.astro` oraz `review/[generationId].astro` zostaną objęte ochroną i będą dostępne wyłącznie dla zalogowanych użytkowników.

### 1.2. Modyfikacje Layoutów (Astro)

Główny layout aplikacji, `src/layouts/Layout.astro`, zostanie zmodyfikowany, aby dynamicznie dostosowywać interfejs w zależności od statusu zalogowania użytkownika:

-   **Kontekst Sesji**: Layout będzie odczytywał informacje o sesji użytkownika z `Astro.locals`, które zostaną wstrzyknięte przez middleware.
-   **Nawigacja Warunkowa**: W nagłówku strony (header) będą renderowane różne zestawy linków:
    -   **Dla gości**: "Zaloguj się", "Zarejestruj się".
    -   **Dla zalogowanych**: "Generuj", "Moje Fiszki" oraz przycisk "Wyloguj".
-   **Przekazywanie Danych**: Informacja o sesji (`session`) zostanie przekazana jako `prop` do komponentów nawigacyjnych (np. `Navbar.tsx`), aby mogły one odpowiednio zarządzać swoim stanem.

### 1.3. Nowe Komponenty (React)

W katalogu `src/components/auth/` zostaną utworzone nowe, interaktywne komponenty React do obsługi formularzy:

-   **`RegisterForm.tsx`**:
    -   **Pola**: `email`, `password`, `confirmPassword`.
    -   **Logika**: Walidacja po stronie klienta (format e-mail, minimalna długość hasła, zgodność haseł). Po przesłaniu formularza, komponent wyśle żądanie `POST` do endpointu `/api/auth/register`.
    -   **Stan**: Będzie zarządzał stanami ładowania (`isLoading`) i błędów (`error`), wyświetlając odpowiednie komunikaty użytkownikowi (np. "Ten e-mail jest już zajęty").
    -   **Nawigacja**: Po pomyślnej rejestracji przekieruje użytkownika na stronę `/generate`.

-   **`LoginForm.tsx`**:
    -   **Pola**: `email`, `password`.
    -   **Logika**: Walidacja po stronie klienta. Wyśle żądanie `POST` do `/api/auth/login`.
    -   **Stan**: Obsługa stanu ładowania i błędów (np. "Nieprawidłowy e-mail lub hasło").
    -   **Nawigacja**: Po pomyślnym logowaniu przekieruje użytkownika na stronę `/generate`.

-   **`ForgotPasswordForm.tsx`**:
    -   **Pola**: `email`.
    -   **Logika**: Wyśle żądanie `POST` do `/api/auth/forgot-password`.
    -   **Stan**: Po wysłaniu formularza, niezależnie od wyniku, wyświetli komunikat: "Jeśli konto o podanym adresie e-mail istnieje, wysłaliśmy na nie link do resetowania hasła."

-   **`ResetPasswordForm.tsx`**:
    -   **Pola**: `password`, `confirmPassword`.
    -   **Logika**: Komponent będzie nasłuchiwał na zdarzenie `PASSWORD_RECOVERY` od Supabase po załadowaniu strony. Po otrzymaniu sesji, umożliwi użytkownikowi wprowadzenie nowego hasła i wyśle żądanie `POST` do `/api/auth/update-password`.
    -   **Nawigacja**: Po pomyślnej zmianie hasła przekieruje użytkownika na stronę `/auth/login` z komunikatem o sukcesie.

### 1.4. Scenariusze Użytkownika i Walidacja

-   **Walidacja Formularzy**: Wszystkie formularze będą wykorzystywać walidację po stronie klienta do natychmiastowego feedbacku oraz walidację po stronie serwera jako ostateczne zabezpieczenie.
-   **Komunikaty o Błędach**: Błędy będą wyświetlane w kontekście formularza, jasno wskazując, które pole jest nieprawidłowe lub jaki jest ogólny problem (np. błąd serwera).
-   **Dostępność**: Formularze będą niedostępne (`disabled`) podczas przetwarzania żądania, a przyciski będą pokazywać wskaźnik ładowania, aby zapobiec wielokrotnemu przesyłaniu danych.

## 2. Logika Backendowa

Logika backendowa zostanie zrealizowana przy użyciu Astro API Routes, które będą pośredniczyć w komunikacji między frontendem a Supabase Auth.

### 2.1. Architektura API (Astro API Routes)

W katalogu `src/pages/api/auth/` zostaną utworzone następujące endpointy:

-   `register.ts` (`POST`): Przyjmuje `email` i `password`, tworzy nowego użytkownika za pomocą `supabase.auth.signUp()`.
-   `login.ts` (`POST`): Przyjmuje `email` i `password`, loguje użytkownika za pomocą `supabase.auth.signInWithPassword()`.
-   `logout.ts` (`POST`): Wylogowuje użytkownika, wywołując `supabase.auth.signOut()`.
-   `forgot-password.ts` (`POST`): Przyjmuje `email` i inicjuje proces odzyskiwania hasła przez `supabase.auth.resetPasswordForEmail()`.
-   `update-password.ts` (`POST`): Przyjmuje nowe hasło (`password`) i aktualizuje je dla aktualnie zalogowanego (w ramach sesji odzyskiwania hasła) użytkownika za pomocą `supabase.auth.updateUser()`.

### 2.2. Kontrakty Danych (DTO)

Do walidacji danych przychodzących do API zostanie wykorzystana biblioteka Zod. Przykładowe schematy:

-   **RegisterSchema**: `email` (string, email format), `password` (string, min 8 znaków).
-   **LoginSchema**: `email` (string, email format), `password` (string, niepusty).

### 2.3. Middleware i Ochrona Ścieżek

W pliku `src/middleware/index.ts` zostanie zaimplementowana logika:

1.  Na każde żądanie, middleware będzie próbował odczytać sesję użytkownika z ciasteczek.
2.  Informacje o sesji i użytkowniku (`session`, `user`) zostaną umieszczone w `Astro.locals`, dzięki czemu będą dostępne w każdej stronie i layoucie po stronie serwera.
3.  **Ochrona Ścieżek**:
    -   Dla chronionych URL-i (np. `/generate`, `/my-flashcards`), jeśli `Astro.locals.user` nie istnieje, nastąpi przekierowanie na `/auth/login`.
    -   Dla publicznych stron autentykacji (np. `/auth/login`, `/auth/register`), jeśli `Astro.locals.user` istnieje, nastąpi przekierowanie na `/generate`.

### 2.4. Walidacja i Obsługa Błędów

-   Każdy endpoint API będzie walidował dane wejściowe przy użyciu schematów Zod. W przypadku niepowodzenia walidacji, zwrócony zostanie błąd `400 Bad Request` z listą problemów.
-   Błędy zwracane przez Supabase Auth (np. `AuthApiError`) będą przechwytywane i mapowane na odpowiednie kody statusu HTTP (np. 401, 409) oraz zrozumiałe dla użytkownika komunikaty błędów.

## 3. System Autentykacji (Supabase Auth)

### 3.1. Konfiguracja i Integracja z Astro

-   **Klient Supabase**: Globalna, współdzielona instancja klienta Supabase zostanie skonfigurowana do używania `cookies` jako mechanizmu przechowywania sesji. Jest to kluczowe dla poprawnego działania autentykacji w architekturze SSR z Astro.
-   **Zmienne Środowiskowe**: Klucze `SUPABASE_URL` i `SUPABASE_ANON_KEY` będą przechowywane w zmiennych środowiskowych i używane do inicjalizacji klienta.
-   **Ustawienia Supabase**: W panelu Supabase należy wyłączyć opcję "Enable email confirmation", aby spełnić wymaganie US-001 dotyczące automatycznego logowania po rejestracji.

### 3.2. Przepływ Danych (Flows)

#### 3.2.1. Rejestracja

1.  Użytkownik wypełnia formularz w `RegisterForm.tsx`.
2.  Formularz wysyła żądanie `POST` do `/api/auth/register` z `email` i `password`.
3.  Endpoint API wywołuje `supabase.auth.signUp()`.
4.  Supabase tworzy użytkownika i zwraca sesję. SDK Supabase automatycznie ustawia ciasteczka sesji w odpowiedzi.
5.  Frontend otrzymuje odpowiedź 200 OK i przekierowuje użytkownika na `/generate`.

#### 3.2.2. Logowanie

1.  Użytkownik wypełnia formularz w `LoginForm.tsx`.
2.  Formularz wysyła żądanie `POST` do `/api/auth/login`.
3.  Endpoint API wywołuje `supabase.auth.signInWithPassword()`.
4.  Supabase weryfikuje dane, zwraca sesję i ustawia ciasteczka.
5.  Frontend otrzymuje 200 OK i przekierowuje na `/generate`.

#### 3.2.3. Wylogowanie

1.  Użytkownik klika przycisk "Wyloguj".
2.  Frontend wysyła żądanie `POST` do `/api/auth/logout`.
3.  Endpoint API wywołuje `supabase.auth.signOut()`.
4.  Supabase unieważnia sesję i usuwa ciasteczka.
5.  Frontend przekierowuje użytkownika na stronę logowania (`/auth/login`).

#### 3.2.4. Odzyskiwanie Hasła

1.  Użytkownik podaje e-mail w `ForgotPasswordForm.tsx` i wysyła formularz.
2.  Żądanie trafia do `/api/auth/forgot-password`, które wywołuje `supabase.auth.resetPasswordForEmail()`, podając URL do strony resetowania (`/auth/reset-password`).
3.  Użytkownik otrzymuje e-mail i klika w link, co przenosi go na `/auth/reset-password`. URL zawiera tokeny w fragmencie (`#`).
4.  Komponent `ResetPasswordForm.tsx` nasłuchuje na zdarzenie `PASSWORD_RECOVERY` od Supabase. Po jego otrzymaniu, sesja jest tymczasowo aktywna.
5.  Użytkownik wprowadza nowe hasło i wysyła formularz.
6.  Żądanie `POST` trafia do `/api/auth/update-password`.
7.  Endpoint, działając w kontekście aktywnej sesji odzyskiwania, wywołuje `supabase.auth.updateUser()` z nowym hasłem.
8.  Po sukcesie, użytkownik jest przekierowywany na `/auth/login`.
