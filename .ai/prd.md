# Dokument wymagań produktu (PRD) - 10x Cards

## 1. Przegląd produktu
10x Cards to aplikacja internetowa zaprojektowana w celu usprawnienia procesu nauki poprzez automatyzację tworzenia fiszek edukacyjnych. Wykorzystując sztuczną inteligencję, aplikacja pozwala użytkownikom na szybkie generowanie zestawów fiszek z dowolnego dostarczonego tekstu, eliminując czasochłonny proces ich ręcznego przygotowywania. Produkt jest skierowany do studentów i profesjonalistów, którzy chcą zoptymalizować swoją naukę przy użyciu techniki powtórek interwałowych (spaced repetition). Oprócz generowania fiszek przez AI, użytkownicy mogą również tworzyć, edytować i zarządzać swoimi fiszkami manualnie oraz korzystać z wbudowanego systemu nauki opartego na uproszczonym algorytmie Leitnera.

## 2. Problem użytkownika
Tradycyjne metody tworzenia fiszek są nieefektywne i czasochłonne. Uczniowie i profesjonaliści spędzają cenne godziny na ręcznym przepisywaniu i formatowaniu materiałów do nauki, co mogliby poświęcić na faktyczne przyswajanie wiedzy. Ten żmudny proces często prowadzi do rezygnacji z regularnego tworzenia fiszek i, w konsekwencji, z efektywnej metody nauki, jaką jest spaced repetition. Brak prostego i szybkiego narzędzia do tworzenia wysokiej jakości materiałów do nauki stanowi barierę w efektywnym zarządzaniu procesem edukacyjnym.

## 3. Wymagania funkcjonalne
- FW-001: Uwierzytelnianie użytkowników: System musi umożliwiać użytkownikom rejestrację konta za pomocą adresu e-mail i hasła oraz późniejsze logowanie. Użytkownicy mogą logować się i wylogowywać ze swojego konta.
- FW-002: Generowanie fiszek przez AI: Aplikacja musi pozwalać na wklejenie tekstu (do 10 000 znaków) i wygenerowanie z niego fiszek w formacie przód-tył.
- FW-003: Przegląd i akceptacja fiszek: Po wygenerowaniu przez AI, fiszki muszą być przedstawione użytkownikowi w widoku przeglądu, gdzie każdą z nich można edytować, zaakceptować lub odrzucić.
- FW-004: Manualne tworzenie fiszek: Użytkownicy muszą mieć możliwość ręcznego dodawania nowych fiszek poprzez prosty formularz z polami "Przód" i "Tył".
- FW-005: Zarządzanie fiszkami: Wszystkie zaakceptowane fiszki muszą być dostępne na jednej liście, z możliwością ich edycji i trwałego usunięcia.
- FW-006: System nauki (Spaced Repetition): Aplikacja musi implementować system nauki oparty na uproszczonym algorytmie Leitnera.
- FW-008: Sesja nauki: Sesja nauki musi być uruchamiana przez użytkownika, obejmować maksymalnie 10 fiszek zaplanowanych na dany dzień i kończyć się ekranem podsumowującym.
- FW-009: Ocena fiszek: Podczas sesji nauki, użytkownik musi mieć możliwość oceny każdej fiszki jako 'Zapamiętane' (przesunięcie na wyższy poziom) lub 'Do powtórki' (reset do poziomu 1).
- FW-010: Statystyki generowania fiszek: Zbieranie informacji o tym, ile fiszek zostało wygenerowanych przez AI i ile z nich ostatecznie zaakceptowano.
- FW-011: Wymagania prawne i ograniczenia:Dane osobowe użytkowników i fiszek przechowywane zgodnie z RODO. Prawo do wglądu i usunięcia danych (konto wraz z fiszkami) na wniosek użytkownika.

## 4. Granice produktu
Wersja MVP (Minimum Viable Product) będzie posiadała następujące ograniczenia, aby zapewnić szybkie dostarczenie kluczowej wartości:
- Brak zaawansowanego algorytmu powtórek: System nauki będzie oparty wyłącznie na prostej implementacji algorytmu Leitnera.
- Brak importu plików: Generowanie fiszek będzie możliwe tylko z tekstu wklejonego do aplikacji. Import z formatów takich jak PDF czy DOCX nie będzie wspierany.
- Pojedyncza kolekcja fiszek: Użytkownicy będą przechowywać wszystkie swoje fiszki w jednej, wspólnej kolekcji, bez możliwości tworzenia oddzielnych talii czy folderów.
- Brak funkcji społecznościowych: Aplikacja nie będzie umożliwiać współdzielenia fiszek ani interakcji między użytkownikami.
- Aplikacja wyłącznie webowa: Nie będą tworzone dedykowane aplikacje mobilne na systemy iOS i Android.
- Prosty format fiszek: Fiszki będą miały wyłącznie format tekstowy (awers i rewers), bez wsparcia dla obrazów, audio czy formatowania tekstu.

## 5. Historyjki użytkowników
### Uwierzytelnianie
- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, abym mógł bezpiecznie przechowywać moje fiszki.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - System waliduje poprawność formatu adresu e-mail.
  - Hasło musi spełniać podstawowe wymagania bezpieczeństwa (np. minimalna długość).
  - Po pomyślnej rejestracji, jestem automatycznie logowany i przekierowywany do głównego panelu aplikacji.
  - W przypadku, gdy e-mail jest już zajęty, wyświetlany jest stosowny komunikat.

- ID: US-002
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto, aby uzyskać dostęp do moich fiszek.
- Kryteria akceptacji:
  - Formularz logowania zawiera pola na adres e-mail i hasło.
  - Po wprowadzeniu poprawnych danych, jestem zalogowany i przekierowany do głównego panelu.
  - W przypadku wprowadzenia błędnych danych, wyświetlany jest odpowiedni komunikat błędu.

- ID: US-003
- Tytuł: Wylogowanie użytkownika
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć dostęp do mojego konta.
- Kryteria akceptacji:
  - W interfejsie aplikacji znajduje się widoczny przycisk "Wyloguj".
  - Po kliknięciu przycisku, moja sesja zostaje zakończona i jestem przekierowywany na stronę logowania.

### Zarządzanie Fiszkami
- ID: US-004
- Tytuł: Generowanie fiszek z tekstu przez AI
- Opis: Jako użytkownik, chcę wkleić fragment tekstu do aplikacji i automatycznie wygenerować z niego zestaw fiszek, aby zaoszczędzić czas na ich ręcznym tworzeniu.
- Kryteria akceptacji:
  - Na głównym ekranie znajduje się pole tekstowe do wklejenia tekstu o maksymalnej długości 10 000 znaków.
  - Po wklejeniu tekstu i kliknięciu przycisku "Generuj", aplikacja wysyła zapytanie do AI.
  - W trakcie generowania wyświetlany jest wskaźnik postępu.
  - Po zakończeniu generowania, jestem przekierowywany do ekranu przeglądu i akceptacji fiszek.
  - W przypadku błędu generowania, wyświetlany jest zrozumiały komunikat.

- ID: US-005
- Tytuł: Przegląd, edycja i akceptacja wygenerowanych fiszek
- Opis: Jako użytkownik, po wygenerowaniu fiszek przez AI, chcę mieć możliwość ich przejrzenia, edycji oraz zaakceptowania lub odrzucenia każdej z nich, aby upewnić się co do ich jakości i poprawności.
- Kryteria akceptacji:
  - Ekran przeglądu wyświetla listę wygenerowanych par (przód-tył).
  - Każdą fiszkę na liście mogę edytować w miejscu (inline editing).
  - Przy każdej fiszce znajdują się przyciski "Akceptuj" i "Odrzuć".
  - Mogę zaakceptować lub odrzucić wszystkie fiszki jednym kliknięciem.
  - Zaakceptowane fiszki są dodawane do mojej głównej kolekcji.
  - Odrzucone fiszki są trwale usuwane.

- ID: US-006
- Tytuł: Manualne tworzenie fiszki
- Opis: Jako użytkownik, chcę mieć możliwość ręcznego dodania nowej fiszki, gdy mam konkretną parę pytanie-odpowiedź do zapamiętania.
- Kryteria akceptacji:
  - Dostępny jest formularz z polami "Przód" i "Tył".
  - Po wypełnieniu pól i zapisaniu, nowa fiszka jest dodawana do mojej kolekcji.
  - Oba pola są wymagane do zapisania fiszki.

- ID: US-007
- Tytuł: Przeglądanie listy fiszek
- Opis: Jako użytkownik, chcę widzieć wszystkie moje zaakceptowane fiszki na jednej liście, abym mógł zarządzać moją bazą wiedzy.
- Kryteria akceptacji:
  - Główny panel aplikacji wyświetla listę wszystkich moich fiszek.
  - Każdy element listy pokazuje treść przodu i tyłu fiszki.
  - Lista jest paginowana, jeśli zawiera dużą liczbę fiszek.

- ID: US-008
- Tytuł: Edycja istniejącej fiszki
- Opis: Jako użytkownik, chcę móc edytować treść istniejącej fiszki na mojej liście, aby poprawić błędy lub zaktualizować informacje.
- Kryteria akceptacji:
  - Przy każdej fiszce na liście znajduje się przycisk "Edytuj".
  - Kliknięcie przycisku otwiera formularz edycji z wypełnionymi aktualnymi danymi.
  - Po zapisaniu zmian, lista fiszek jest aktualizowana.

- ID: US-009
- Tytuł: Usuwanie fiszki
- Opis: Jako użytkownik, chcę móc trwale usunąć fiszkę z mojej kolekcji, gdy nie jest mi już potrzebna.
- Kryteria akceptacji:
  - Przy każdej fiszce na liście znajduje się przycisk "Usuń".
  - Przed usunięciem wyświetlane jest okno dialogowe z prośbą o potwierdzenie.
  - Po potwierdzeniu, fiszka jest trwale usuwana z mojej kolekcji.

### System Nauki
- ID: US-010
- Tytuł: Rozpoczynanie sesji nauki
- Opis: Jako użytkownik, chcę rozpocząć sesję nauki jednym kliknięciem, aby przejrzeć fiszki zaplanowane na dzisiaj.
- Kryteria akceptacji:
  - Na głównym panelu znajduje się przycisk "Rozpocznij naukę".
  - Przycisk jest aktywny tylko wtedy, gdy są fiszki zaplanowane do powtórki na dany dzień.
  - Kliknięcie przycisku rozpoczyna sesję z maksymalnie 10 fiszkami.

- ID: US-011
- Tytuł: Przebieg sesji nauki
- Opis: Jako użytkownik, podczas sesji nauki chcę widzieć przód fiszki, móc odkryć jej tył, a następnie ocenić, czy zapamiętałem odpowiedź.
- Kryteria akceptacji:
  - Sesja nauki prezentuje fiszki jedna po drugiej.
  - Domyślnie widoczny jest tylko przód fiszki.
  - Kliknięcie przycisku "Pokaż odpowiedź" (lub samej karty) odkrywa jej tył.
  - Po odkryciu odpowiedzi, pojawiają się dwa przyciski: "Zapamiętane" i "Do powtórki".

- ID: US-012
- Tytuł: Ocena fiszki i mechanizm powtórek
- Opis: Jako użytkownik, chcę oceniać znajomość fiszek, aby system mógł zaplanować ich kolejne powtórki w optymalnym czasie.
- Kryteria akceptacji:
  - Kliknięcie "Zapamiętane" przesuwa fiszkę na wyższy poziom w systemie Leitnera, wydłużając czas do następnej powtórki.
  - Kliknięcie "Do powtórki" resetuje fiszkę do poziomu 1, planując jej powtórkę na następny dzień.
  - Po dokonaniu oceny, automatycznie wyświetlana jest kolejna fiszka w sesji.

- ID: US-013
- Tytuł: Zakończenie sesji nauki
- Opis: Jako użytkownik, po przejrzeniu wszystkich fiszek w sesji, chcę zobaczyć ekran podsumowujący mój postęp.
- Kryteria akceptacji:
  - Sesja kończy się po przejrzeniu 10 fiszek lub gdy nie ma więcej kart zaplanowanych na dany dzień.
  - Ekran podsumowania wyświetla liczbę kart ocenionych jako "Zapamiętane" i "Do powtórki".
  - Na ekranie podsumowania znajduje się przycisk powrotu do głównego panelu.

## 6. Metryki sukcesu
- Jakość generowania AI: Co najmniej 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkowników na ekranie przeglądu. Mierzone poprzez zliczanie akcji "Akceptuj" vs "Odrzuć" dla każdej wygenerowanej fiszki.
- Adopcja funkcji AI: Co najmniej 75% wszystkich fiszek w systemie jest tworzonych przy użyciu generatora AI, a nie manualnie. Mierzone poprzez śledzenie źródła pochodzenia każdej nowo utworzonej fiszki.
- Aktywność użytkowników (engagement): Użytkownicy regularnie wracają do aplikacji, aby odbywać sesje nauki. Mierzone poprzez wskaźnik DAU/MAU (Daily Active Users / Monthly Active Users).
- Retencja użytkowników: Użytkownicy kontynuują korzystanie z aplikacji w czasie. Mierzone poprzez analizę kohortową i wskaźnik retencji po 1, 7 i 30 dniach od rejestracji.
