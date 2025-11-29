<conversation_summary>
<decisions>
Grupą docelową produktu są osoby uczące się na egzaminy lub przygotowujące się do rozmów technicznych.
Proces generowania fiszek przez AI w MVP będzie w pełni zautomatyzowany, bez zaawansowanych opcji dla użytkownika.
Zastosowany zostanie prosty algorytm powtórek oparty na systemie Leitnera.
System kont będzie oparty na prostej rejestracji e-mail i hasło.
Fiszki w MVP będą miały format tekstowy przód-tył.
Wszystkie fiszki będą przechowywane w jednej, wspólnej kolekcji, bez podziału na talie.
Głównym zidentyfikowanym ryzykiem jest jakość i koszt generowania fiszek przez AI.
Wprowadzony zostanie proces przeglądu i akceptacji/edycji fiszek po ich wygenerowaniu.
Limit znaków dla tekstu do generowania fiszek w MVP wynosi 1000.
Sesja nauki będzie ograniczona do 10 kart i zakończona ekranem podsumowania.
Aplikacja będzie posiadać prostą wyszukiwarkę tekstową do filtrowania fiszek.
Stos technologiczny jest zdefiniowany i obejmuje Astro, React, Supabase, Openrouter.ai i DigitalOcean.
Mechanizm oceny fiszek podczas nauki będzie oparty na opcjach 'Zapamiętane' i 'Do powtórki'.
</decisions>
<matched_recommendations>
Zdefiniowanie persony użytkownika: Decyzja o skupieniu się na osobach przygotowujących się do egzaminów i rozmów technicznych precyzuje grupę docelową.
Uproszczenie funkcji MVP: Wiele decyzji, takich jak automatyczny proces AI, pojedyncza kolekcja fiszek i prosty format tekstowy, jest zgodnych z zaleceniem maksymalnego uproszczenia MVP.
Zarządzanie ryzykiem kosztów AI: Decyzja o ustaleniu twardego limitu budżetowego w panelu dostawcy AI jest bezpośrednią odpowiedzią na zidentyfikowane ryzyko.
Poprawa doświadczenia użytkownika (UX): Wprowadzenie wyszukiwarki, przyjaznych komunikatów o błędach i możliwości edycji fiszek w dowolnym czasie jest zgodne z zaleceniami dotyczącymi budowania intuicyjnej i przyjaznej aplikacji.
Transparentność algorytmu: Decyzja o jasnym komunikowaniu dat powtórek buduje zaufanie użytkownika do systemu.
Mierzalność sukcesu: Proces akceptacji/odrzucenia fiszek po ich wygenerowaniu pozwala na precyzyjny pomiar kluczowego wskaźnika sukcesu (75% akceptacji).
</matched_recommendations>
<prd_planning_summary>
Podsumowanie Planowania PRD
Na podstawie przeprowadzonej analizy i podjętych decyzji, PRD dla MVP powinno skupić się na dostarczeniu produktu rozwiązującego główny problem: czasochłonnego, manualnego tworzenia fiszek edukacyjnych.
a. Główne wymagania funkcjonalne produktu:
System Uwierzytelniania: Użytkownicy mogą tworzyć konto i logować się za pomocą adresu e-mail i hasła. Po Utworzeniu konta konto jet od razu aktywne.
Generowanie Fiszek przez AI:
Użytkownik może wkleić tekst (do 10000 znaków) w dedykowane pole.
System wysyła tekst do zewnętrznego API (przez Openrouter.ai) w celu wygenerowania fiszek w formacie przód-tył.
Po wygenerowaniu, użytkownik przechodzi do widoku akceptacji, gdzie może edytować, zaakceptować lub odrzucić każdą fiszkę.
Manualne Tworzenie Fiszek: Użytkownik ma dostęp do prostego formularza z polami "Przód" i "Tył" do ręcznego dodawania fiszek.
Zarządzanie Fiszkami:
Wszystkie zaakceptowane fiszki (zarówno wygenerowane, jak i dodane ręcznie) są wyświetlane na jednej liście.
Użytkownik może edytować i usuwać każdą fiszkę z listy w dowolnym momencie.
System Powtórek (Nauka):
Na głównym ekranie znajduje się przycisk "Rozpocznij naukę".
Jego naciśnięcie rozpoczyna sesję nauki z fiszkami zaplanowanymi na dany dzień.
Sesja nauki obejmuje maksymalnie 10 kart.
Podczas sesji, po odkryciu odpowiedzi, użytkownik ocenia fiszkę za pomocą dwóch przycisków: 'Zapamiętane' i 'Do powtórki'.
System wykorzystuje uproszczony algorytm Leitnera:
Nowe fiszki startują na poziomie 1.
Ocena 'Zapamiętane' przesuwa fiszkę na wyższy poziom (dłuższy interwał do następnej powtórki, np. 1 dzień -> 3 dni -> 7 dni).
Ocena 'Do powtórki' resetuje fiszkę na poziom 1 (powtórka następnego dnia).
Po przejrzeniu 10 kart sesja kończy się ekranem podsumowującym.
b. Kluczowe historie użytkownika i ścieżki korzystania:
Nowy użytkownik: Janek, student przygotowujący się do egzaminu, rejestruje się w aplikacji. Przechodzi na pusty ekran z przyciskiem do generowania fiszek.
Generowanie i nauka: Ania, przygotowująca się do rozmowy technicznej, loguje się do aplikacji. Wkleja opis algorytmu, generuje z niego fiszki, edytuje dwie z nich, aby były bardziej precyzyjne, i akceptuje wszystkie. Następnie klika "Rozpocznij naukę". Podczas sesji ocenia, które odpowiedzi pamięta, a które wymagają powtórki.
Zarządzanie fiszkami: Po tygodniu korzystania, Janek zauważa błąd w jednej ze swoich starych fiszek. Klika przycisk "Edytuj", poprawia treść i zapisuje zmiany.
c. Ważne kryteria sukcesu i sposoby ich mierzenia:
Jakość generowania AI: 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika.
Sposób mierzenia: System musi zliczać liczbę fiszek zaakceptowanych vs. odrzuconych w kroku przeglądu po wygenerowaniu.
Adopcja funkcji AI: Użytkownicy tworzą 75% wszystkich swoich fiszek z wykorzystaniem AI.
Sposób mierzenia: System musi śledzić źródło każdej utworzonej fiszki (wygenerowana vs. dodana manualnie) i obliczać proporcję na poziomie użytkownika lub globalnie.
</prd_planning_summary>