<conversation_summary>
<decisions>
1. Zdecydowano o zastosowaniu górnego paska nawigacyjnego w aplikacji.
2. Po zakończeniu recenzji fiszek wygenerowanych przez AI, użytkownik zostanie przekierowany na listę "Moje Fiszki".
3. Implementacja manualnego tworzenia fiszek zostaje odłożona na późniejszy etap. MVP skupi się na generowaniu przez AI.
4. Zaawansowane zarządzanie stanem po stronie klienta (np. z użyciem React Query) zostanie zaimplementowane w późniejszym etapie.
5. Do obsługi błędów i komunikatów o sukcesie z API zostanie wykorzystany globalny system powiadomień "Toast".
6. Stan sesji nauki nie będzie zachowywany po odświeżeniu strony w wersji MVP.
7. Przyjęto podejście "mobile-first" do projektowania responsywnego interfejsu z użyciem Tailwind CSS.
8. Trasy chronione będą zarządzane przez główny komponent layoutu, który będzie przekierowywał niezalogowanych użytkowników na stronę logowania.
9. Edycja fiszek na ekranie przeglądu będzie realizowana za pomocą przycisków "Edytuj" i "Zapisz" dla każdej fiszki, a ostateczne dodanie do kolekcji nastąpi po kliknięciu przycisku "Zapisz wszystko" na dole formularza.
10. Paginacja na liście fiszek zostanie zaimplementowana w prostej formie z przyciskami "Poprzednia" i "Następna".
</decisions>

<matched_recommendations>
1. **Nawigacja**: Zostanie zaimplementowany górny pasek nawigacyjny z trzema głównymi sekcjami: "Nauka", "Moje Fiszki" oraz "Generuj".
2. **Przepływ po recenzji fiszek**: Użytkownik po zaakceptowaniu fiszek zostanie przekierowany na listę "Moje Fiszki".
3. **Obsługa błędów API**: Globalny system powiadomień "Toast" będzie informował użytkownika o statusie operacji API.
4. **Responsywność**: Interfejs będzie tworzony zgodnie z podejściem "mobile-first" przy użyciu Tailwind CSS.
5. **Przepływ uwierzytelniania**: Główny layout aplikacji będzie odpowiedzialny za ochronę tras i przekierowywanie niezalogowanych użytkowników.
6. **Edycja fiszek**: Mechanizm edycji na ekranie recenzji będzie oparty na przyciskach "Edytuj/Zapisz" per fiszka oraz jednym zbiorczym przycisku "Zapisz wszystko".
7. **Paginacja**: Lista fiszek będzie wyposażona w prosty mechanizm paginacji.
</matched_recommendations>

<ui_architecture_planning_summary>
### Główne wymagania dotyczące architektury UI
Architektura UI dla MVP musi wspierać kluczowe funkcjonalności zdefiniowane w PRD, z priorytetem na proces generowania fiszek przez AI. Interfejs powinien być intuicyjny, responsywny i zapewniać płynne przejście między generowaniem, recenzowaniem i zarządzaniem fiszkami.

### Kluczowe widoki, ekrany i przepływy użytkownika
1.  **Widoki publiczne**: Strony logowania i rejestracji.
2.  **Widoki prywatne (po zalogowaniu)**:
    *   **Nawigacja główna (górna)**: Zawierająca linki do: "Nauka", "Moje Fiszki", "Generuj".
    *   **Widok Generowania (`/generate`)**: Prosty interfejs z polem tekstowym do wklejenia materiału źródłowego i przyciskiem do rozpoczęcia generowania.
    *   **Widok Przeglądu i Akceptacji (`/review`)**: Ekran prezentujący listę fiszek wygenerowanych przez AI. Każda fiszka będzie miała opcję edycji (za pomocą przycisków "Edytuj"/"Zapisz") oraz akceptacji. Na dole strony znajdzie się przycisk "Zapisz wszystko", który doda zaakceptowane fiszki do kolekcji użytkownika.
    *   **Widok "Moje Fiszki" (`/flashcards`)**: Paginowana lista wszystkich zaakceptowanych fiszek użytkownika z opcjami zarządzania (edycja, usuwanie - do implementacji w przyszłości).
    *   **Widok Nauki (`/study`)**: Panel główny umożliwiający rozpoczęcie sesji nauki.

3.  **Główny przepływ użytkownika w MVP**:
    1.  Użytkownik loguje się do aplikacji.
    2.  Przechodzi do sekcji "Generuj".
    3.  Wkleja tekst i inicjuje proces generowania.
    4.  Zostaje przekierowany do widoku przeglądu, gdzie edytuje i akceptuje fiszki.
    5.  Klika "Zapisz wszystko", aby dodać wybrane fiszki do swojej kolekcji.
    6.  Zostaje przekierowany do widoku "Moje Fiszki", gdzie widzi nowo dodane pozycje.

### Strategia integracji z API i zarządzania stanem
*   **Integracja z API**: Komponenty UI będą bezpośrednio komunikować się z endpointami `/api/generations` i `/api/flashcards`.
*   **Zarządzanie stanem**: W początkowej fazie MVP zarządzanie stanem będzie uproszczone i oparte na lokalnym stanie komponentów (React `useState`). Implementacja zaawansowanej biblioteki do zarządzania stanem serwera (np. React Query) jest zaplanowana na późniejszy etap.
*   **Obsługa błędów**: Błędy i komunikaty o sukcesie zwracane przez API będą obsługiwane przez globalny system powiadomień "Toast", zapewniając spójne informacje zwrotne dla użytkownika.

### Kwestie dotyczące responsywności, dostępności i bezpieczeństwa
*   **Responsywność**: Aplikacja zostanie zbudowana w podejściu "mobile-first" z wykorzystaniem Tailwind CSS, aby zapewnić pełną funkcjonalność na różnych urządzeniach.
*   **Dostępność**: Wykorzystanie biblioteki komponentów Shadcn/ui, która dba o standardy dostępności, będzie podstawą do tworzenia inkluzywnego interfejsu.
*   **Bezpieczeństwo**: Dostęp do prywatnych części aplikacji będzie chroniony. Główny layout będzie weryfikował status uwierzytelnienia użytkownika (za pomocą Supabase) i w razie potrzeby przekierowywał na stronę logowania.

</ui_architecture_planning_summary>

<unresolved_issues>
Następujące kwestie zostały świadomie odłożone na późniejsze etapy rozwoju, aby przyspieszyć dostarczenie MVP:
1.  **Manualne tworzenie fiszek**: Pełny interfejs i logika do ręcznego dodawania fiszek.
2.  **Zaawansowane zarządzanie stanem**: Wdrożenie biblioteki takiej jak React Query w celu optymalizacji pobierania danych i synchronizacji stanu z serwerem.
3.  **Persystencja sesji nauki**: Mechanizm zapisywania postępu w sesji nauki w przypadku odświeżenia strony.
</unresolved_issues>
</conversation_summary>
