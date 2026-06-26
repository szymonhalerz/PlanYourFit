# Dokumentacja projektu PlanYourFit

## Cel dokumentacji

Dokumentacja pokazuje cały proces pracy nad aplikacją PlanYourFit: od analizy problemu, przez zaplanowanie funkcjonalności i architektury, po implementację, testowanie, wdrożenie oraz prezentację gotowego rozwiązania.

PlanYourFit to aplikacja webowa do planowania aktywności fizycznych. Projekt został przygotowany jako klasyczna aplikacja HTML/CSS/JavaScript z backendem Node.js/Express oraz opcjonalną bazą MySQL. W aktualnej wersji demonstracyjnej aplikacja działa na jednym stałym koncie pokazowym:

```text
E-mail: demo@planyourfit.pl
Hasło: Demo1234!
Nick: Demo
```

---

## 1. Analiza problemu

### 1.1. Opis problemu

Użytkownik, który chce regularnie uprawiać sport, często musi korzystać z kilku osobnych narzędzi: kalendarza, aplikacji pogodowej, map, wyszukiwarki miejsc sportowych oraz notatek. Powoduje to chaos organizacyjny i utrudnia szybkie podjęcie decyzji, kiedy i gdzie zaplanować trening.

Główne problemy użytkownika:

- brak jednego miejsca do planowania różnych aktywności;
- konieczność ręcznego sprawdzania pogody przed treningiem;
- brak szybkiego wyszukiwania basenów, hal lub tras biegowych;
- trudność w kontrolowaniu regularności treningów;
- brak prostych statystyk pokazujących wykonane aktywności;
- brak wygodnego połączenia planu treningowego z lokalizacją.

Problem jest istotny, ponieważ regularna aktywność wymaga planowania. Jeśli użytkownik musi wykonywać zbyt wiele czynności ręcznie, łatwiej rezygnuje z treningu lub zapomina o aktywności. Aplikacja ma uprościć ten proces.

PlanYourFit ma ułatwić:

- planowanie treningów w kalendarzu;
- dodawanie biegania, koszykówki i pływania;
- pobieranie lokalizacji użytkownika;
- sprawdzanie pogody dla miejsca i godziny aktywności;
- generowanie lub wyświetlanie trasy biegu;
- zapisywanie i potwierdzanie wykonania aktywności;
- analizę postępów w statystykach.

### 1.2. Użytkownik aplikacji

Aplikacja jest skierowana do osoby prywatnej, która chce lepiej planować ruch w tygodniu. Typowy użytkownik to osoba aktywna lub chcąca wrócić do regularnych treningów.

Potrzeby użytkownika:

- szybkie dodanie treningu do kalendarza;
- wybór typu aktywności;
- określenie miejsca i czasu;
- sprawdzenie, czy warunki pogodowe są dobre;
- odnalezienie miejsca do ćwiczeń w pobliżu;
- kontrola miesięcznego celu aktywności;
- możliwość testowania aplikacji bez zakładania konta.

### 1.3. Analiza konkurencji / podobnych rozwiązań

| Narzędzie | Co robi dobrze | Ograniczenia | Różnice w PlanYourFit | Inspiracja |
|---|---|---|---|---|
| Google Calendar | Bardzo dobrze obsługuje wydarzenia, powiadomienia i widoki kalendarza. | Nie jest aplikacją sportową, nie analizuje pogody, tras ani miejsc sportowych. | PlanYourFit łączy kalendarz z aktywnościami sportowymi, pogodą i lokalizacją. | Widok miesiąca, tygodnia i dnia. |
| Strava | Świetnie śledzi aktywności sportowe i trasy. | Bardziej skupia się na rejestrowaniu wykonanego treningu niż planowaniu. Część funkcji jest rozbudowana i mniej pokazowa. | PlanYourFit koncentruje się na prostym planowaniu aktywności przed treningiem. | Prezentacja dystansu, trasy i aktywności biegowych. |
| Garmin Connect | Daje rozbudowane statystyki treningowe i cele. | Wymaga ekosystemu urządzeń lub konta, jest bardziej zaawansowany niż potrzebuje początkujący użytkownik. | PlanYourFit działa jako lekka aplikacja webowa z kontem demo. | Cele miesięczne i podsumowanie aktywności. |
| Mapy Google | Bardzo dobrze pokazują mapy, trasy i miejsca. | Nie służą do planowania treningów i nie zapisują harmonogramu sportowego. | PlanYourFit używa map tylko jako jednej z funkcji planowania. | Link do trasy i praca z lokalizacją. |

---

## 2. Analiza funkcjonalna

### 2.1. Lista funkcji

Najważniejsze funkcje aplikacji:

1. Logowanie na stałe konto demo.
2. Wyświetlenie strony głównej z opisem aplikacji.
3. Przejście do panelu aplikacji po zalogowaniu.
4. Kalendarz aktywności w widoku miesiąca, tygodnia i dnia.
5. Dodawanie aktywności:
   - bieganie,
   - koszykówka,
   - pływanie.
6. Edycja aktywności.
7. Usuwanie aktywności.
8. Oznaczanie aktywności jako wykonanej lub anulowanej.
9. Wykrywanie nakładania się terminów.
10. Powtarzanie aktywności co tydzień.
11. Pobieranie lokalizacji użytkownika z przeglądarki.
12. Odwrócone geokodowanie lokalizacji na adres i kod pocztowy.
13. Wyszukiwanie hal i basenów w pobliżu.
14. Pobieranie pogody dla miejsca i godziny treningu.
15. Generowanie lub prezentowanie trasy biegu.
16. Otwieranie trasy w Google Maps.
17. Wyświetlanie szczegółów aktywności.
18. Wyświetlanie rekomendacji pogodowej.
19. Statystyki miesięczne:
   - liczba ukończonych aktywności,
   - czas treningu,
   - dystans biegowy,
   - podział na dyscypliny.
20. Ustawianie miesięcznego celu aktywności.
21. Ustawienia profilu:
   - imię/nick,
   - e-mail,
   - lokalizacja domyślna,
   - kod pocztowy,
   - promień wyszukiwania.
22. Motyw jasny, ciemny i systemowy.
23. Powiadomienia o zaplanowanych aktywnościach.
24. Tryb demo bez konieczności konfiguracji bazy danych.
25. Opcjonalna obsługa MySQL po ustawieniu `DEMO_MODE=false`.

### 2.2. User stories

| ID | User story |
|---|---|
| US1 | Jako użytkownik chcę zalogować się na konto demo, aby szybko przetestować aplikację bez rejestracji. |
| US2 | Jako użytkownik chcę zobaczyć kalendarz aktywności, aby wiedzieć, kiedy mam zaplanowane treningi. |
| US3 | Jako użytkownik chcę dodać aktywność, aby zapisać plan treningowy. |
| US4 | Jako użytkownik chcę wybrać typ aktywności, aby aplikacja dopasowała formularz do biegania, koszykówki lub pływania. |
| US5 | Jako użytkownik chcę pobrać swoją lokalizację, aby nie wpisywać adresu ręcznie. |
| US6 | Jako użytkownik chcę sprawdzić pogodę, aby wiedzieć, czy warunki są dobre do treningu. |
| US7 | Jako użytkownik chcę znaleźć halę lub basen w pobliżu, aby łatwiej wybrać miejsce aktywności. |
| US8 | Jako użytkownik chcę zobaczyć trasę biegu na mapie, aby wiedzieć, gdzie będę biegł. |
| US9 | Jako użytkownik chcę otworzyć trasę w Google Maps, aby móc użyć jej poza aplikacją. |
| US10 | Jako użytkownik chcę edytować aktywność, aby poprawić błędnie wpisane dane. |
| US11 | Jako użytkownik chcę usunąć aktywność, aby pozbyć się nieaktualnego treningu. |
| US12 | Jako użytkownik chcę oznaczyć trening jako wykonany, aby statystyki były aktualne. |
| US13 | Jako użytkownik chcę ustawić miesięczny cel aktywności, aby śledzić regularność. |
| US14 | Jako użytkownik chcę zmienić motyw aplikacji, aby dopasować wygląd do swoich preferencji. |
| US15 | Jako użytkownik chcę, aby demo działało bez bazy danych, żeby łatwo zaprezentować projekt. |

### 2.3. Zakres MVP

Minimalna wersja aplikacji powinna umożliwiać:

- zalogowanie się na konto demo;
- wyświetlenie kalendarza;
- dodanie aktywności;
- edycję i usunięcie aktywności;
- wyświetlenie szczegółów aktywności;
- zapis danych demo w pamięci aplikacji;
- pokazanie podstawowych statystyk.

Funkcje rozszerzone:

- geolokalizacja;
- pogoda;
- trasy biegowe;
- wyszukiwanie basenów i hal;
- Google Maps;
- ciemny motyw;
- miesięczny cel.

### 2.4. Lista zadań projektowych

| ID | Zadanie | Priorytet | Status |
|---|---|---|---|
| T1 | Analiza problemu i podobnych aplikacji | Wysoki | Wykonane |
| T2 | Przygotowanie listy funkcji i user stories | Wysoki | Wykonane |
| T3 | Zaprojektowanie struktury frontend/backend | Wysoki | Wykonane |
| T4 | Przygotowanie statycznego frontendu HTML/CSS/JS | Wysoki | Wykonane |
| T5 | Przygotowanie backendu Express | Wysoki | Wykonane |
| T6 | Przygotowanie trybu demo i stałego użytkownika | Wysoki | Wykonane |
| T7 | Implementacja logowania demo | Wysoki | Wykonane |
| T8 | Implementacja kalendarza aktywności | Wysoki | Wykonane |
| T9 | Formularz dodawania aktywności | Wysoki | Wykonane |
| T10 | Edycja i usuwanie aktywności | Wysoki | Wykonane |
| T11 | Obsługa statusu aktywności | Średni | Wykonane |
| T12 | Integracja z geolokalizacją i geokodowaniem | Średni | Wykonane |
| T13 | Integracja z pogodą Open-Meteo | Średni | Wykonane |
| T14 | Integracja z Overpass API | Średni | Wykonane |
| T15 | Generowanie/podgląd trasy biegu | Średni | Wykonane |
| T16 | Link do Google Maps | Średni | Wykonane |
| T17 | Statystyki i cel miesięczny | Średni | Wykonane |
| T18 | Ustawienia profilu i motywu | Średni | Wykonane |
| T19 | Testy backendu | Średni | Wykonane |
| T20 | Poprawki UI po testach | Wysoki | Wykonane |
| T21 | Instrukcja deployu | Wysoki | Wykonane |

### 2.5. Narzędzie do zarządzania zadaniami

Do zarządzania zadaniami można wykorzystać prostą tablicę zadań w dokumentacji lub README. W projekcie zadania zostały rozpisane w tabeli w sekcji 2.4.

Organizacja pracy:

- zadania zostały podzielone na analizę, frontend, backend, integracje, testy i deploy;
- priorytet wysoki oznaczał funkcje niezbędne do działania aplikacji;
- priorytet średni oznaczał funkcje ważne dla pełnej prezentacji;
- status „Wykonane” oznacza, że funkcja znajduje się w aktualnej wersji projektu.

Zrzut ekranu tablicy zadań można dodać w folderze:

```text
docs/screenshots/task-board.png
```

---

## 3. Harmonogram pracy

| Etap | Zakres prac | Planowany termin | Status |
|---|---|---|---|
| 1 | Analiza problemu i konkurencji | Tydzień 1 | Wykonane |
| 2 | Lista funkcji i user stories | Tydzień 1 | Wykonane |
| 3 | Projekt struktury aplikacji | Tydzień 2 | Wykonane |
| 4 | Implementacja HTML/CSS | Tydzień 2 | Wykonane |
| 5 | Implementacja logiki JavaScript | Tydzień 3 | Wykonane |
| 6 | Implementacja API Express | Tydzień 3 | Wykonane |
| 7 | Integracje z API zewnętrznymi | Tydzień 3/4 | Wykonane |
| 8 | Tryb demo i uproszczone logowanie | Tydzień 4 | Wykonane |
| 9 | Testowanie i poprawki UI | Tydzień 4 | Wykonane |
| 10 | Deploy i prezentacja | Tydzień 4 | Do wykonania / zależne od hostingu |

### Podsumowanie harmonogramu

Większość harmonogramu udało się zrealizować zgodnie z planem. Najwięcej czasu zajęły:

- poprawne działanie logowania demo;
- przepisanie aplikacji na klasyczne HTML/CSS/JS;
- obsługa popupów i zachowanie formularzy;
- integracja trasy z Google Maps;
- dopracowanie ciemnego motywu;
- poprawki po testach ręcznych.

Największym problemem organizacyjnym było dopasowanie aplikacji do trybu pokazowego, ponieważ część funkcji pierwotnie zależała od bazy danych lub zewnętrznych API. Rozwiązaniem było przygotowanie `DEMO_MODE=true` i danych w pamięci aplikacji.

---

## 4. Specyfikacja techniczna

### 4.1. Technologie

| Technologia | Zastosowanie |
|---|---|
| HTML | Struktura strony i statyczny frontend. |
| CSS | Wygląd aplikacji, responsywność, motyw jasny i ciemny. |
| JavaScript | Logika interfejsu, renderowanie widoków, obsługa zdarzeń i komunikacja z API. |
| Node.js | Środowisko uruchomieniowe backendu. |
| Express | Serwer API oraz serwowanie statycznego frontendu. |
| Zod | Walidacja danych przychodzących do API. |
| MySQL | Opcjonalna trwała baza danych po wyłączeniu trybu demo. |
| mysql2 | Połączenie backendu z MySQL. |
| Open-Meteo | Pobieranie prognozy pogody. |
| Nominatim / OpenStreetMap | Geokodowanie i odwrócone geokodowanie lokalizacji. |
| Overpass API | Wyszukiwanie basenów i hal sportowych. |
| OSRM / routing | Generowanie tras biegowych. |
| Leaflet | Wyświetlanie mapy w szczegółach aktywności. |
| Google Maps URL API | Otwieranie trasy w Google Maps. |

### 4.2. Model danych

W trybie demo dane przechowywane są w pamięci serwera w pliku:

```text
server/src/database/demoStore.js
```

Główne dane użytkownika:

| Pole | Opis |
|---|---|
| `id` | Stały identyfikator użytkownika demo. |
| `name` | Nick użytkownika, obecnie `Demo`. |
| `email` | Adres logowania demo. |
| `defaultLocation` | Domyślna lokalizacja. |
| `defaultPostalCode` | Domyślny kod pocztowy. |
| `defaultLocationLat` | Szerokość geograficzna domyślnej lokalizacji. |
| `defaultLocationLng` | Długość geograficzna domyślnej lokalizacji. |
| `preferredRadiusKm` | Domyślny promień wyszukiwania miejsc. |
| `monthlyActivityGoal` | Miesięczny cel aktywności. |
| `theme` | Wybrany motyw interfejsu. |

Główne dane aktywności:

| Pole | Opis |
|---|---|
| `id` | Identyfikator aktywności. |
| `activityType` | Typ aktywności: `running`, `basketball`, `swimming`. |
| `title` | Nazwa aktywności. |
| `activityDate` | Data aktywności. |
| `startTime` | Godzina rozpoczęcia. |
| `endTime` | Godzina zakończenia. |
| `locationAddress` | Adres lub nazwa miejsca. |
| `postalCode` | Kod pocztowy. |
| `locationLat` | Szerokość geograficzna. |
| `locationLng` | Długość geograficzna. |
| `searchRadiusKm` | Promień wyszukiwania miejsc. |
| `status` | Status: zaplanowana, ukończona, anulowana. |
| `note` | Notatka użytkownika. |
| `details` | Szczegóły zależne od typu aktywności. |

Przykładowe szczegóły dla biegania:

- dystans docelowy;
- dystans rzeczywisty;
- tempo;
- przewidywany czas;
- trasa GeoJSON;
- pogoda;
- rekomendacja.

Opcjonalny model SQL znajduje się w:

```text
database/schema.sql
database/seed.sql
database/migration_*.sql
```

### 4.3. Architektura aplikacji

Struktura projektu:

```text
client/
  index.html
  app.js
  styles.css
  vanilla.css
  public/images/

server/
  src/
    app.js
    index.js
    config.js
    controllers/
    database/
    middleware/
    routes/
    services/
    tests/
    validation/

database/
  schema.sql
  seed.sql
  migration_*.sql
```

Opis najważniejszych części:

- `client/index.html` — główny dokument HTML aplikacji;
- `client/app.js` — logika frontendu, renderowanie widoków, obsługa formularzy, komunikacja z API;
- `client/styles.css` — główne style i responsywność;
- `client/vanilla.css` — poprawki dla wersji bez frameworka;
- `server/src/app.js` — konfiguracja Express, middleware, statyczny frontend i routing API;
- `server/src/controllers/` — logika endpointów;
- `server/src/routes/` — definicje tras API;
- `server/src/services/` — integracje z pogodą, geokodowaniem, miejscami i trasami;
- `server/src/database/demoStore.js` — dane trybu demo;
- `server/src/database/pool.js` — połączenie z MySQL;
- `server/src/validation/schemas.js` — walidacja danych;
- `server/src/tests/` — testy jednostkowe usług.

### 4.4. Przepływ działania aplikacji

Przykład: dodanie aktywności.

1. Użytkownik klika „Dodaj aktywność”.
2. Frontend otwiera formularz w popupie.
3. Użytkownik wybiera typ aktywności.
4. Użytkownik wpisuje datę, godzinę, lokalizację i szczegóły.
5. Aplikacja synchronizuje dane formularza ze stanem interfejsu.
6. Po kliknięciu „Dodaj do kalendarza” wykonywana jest walidacja.
7. Aplikacja pobiera lub wylicza lokalizację.
8. Dla biegania generowana jest trasa.
9. Pobierana jest pogoda.
10. Tworzona jest rekomendacja warunków.
11. Frontend wysyła dane do API.
12. Backend zapisuje aktywność w `demoStore` lub w MySQL.
13. Frontend pobiera aktualną listę aktywności.
14. Kalendarz jest renderowany ponownie.
15. Użytkownik widzi nową aktywność.

Przykład: logowanie demo.

1. Użytkownik wpisuje `demo@planyourfit.pl` i `Demo1234!`.
2. Frontend wysyła dane do `/api/auth/login`.
3. Backend porównuje dane ze stałymi danymi konta demo.
4. Backend zwraca użytkownika demo.
5. Frontend zapisuje sesję pokazową i pobiera aktywności.
6. Użytkownik przechodzi do panelu aplikacji.

---

## 5. Kod i repozytorium

### 5.1. Repozytorium

Link do repozytorium GitHub:

```text
DO UZUPEŁNIENIA: https://github.com/...
```

Instrukcja uruchomienia lokalnego:

```bash
npm install
npm start
```

Adres lokalny:

```text
http://localhost:4000
```

Tryb developerski:

```bash
npm run dev
```

Testy:

```bash
npm test
```

### 5.2. Commity

Historia commitów powinna pokazywać kolejne etapy pracy. Przykładowy podział commitów:

| Commit | Zakres |
|---|---|
| 1 | Utworzenie struktury projektu. |
| 2 | Przygotowanie frontendu HTML/CSS/JS. |
| 3 | Implementacja backendu Express. |
| 4 | Dodanie trybu demo i logowania. |
| 5 | Implementacja kalendarza i aktywności. |
| 6 | Integracje z pogodą, mapami i lokalizacją. |
| 7 | Statystyki i ustawienia. |
| 8 | Poprawki UI i testy. |
| 9 | Dokumentacja i instrukcja wdrożenia. |

Jeżeli repozytorium nie zostało jeszcze opublikowane, należy je utworzyć i wypchnąć projekt na GitHub.

### 5.3. README.md

Projekt zawiera plik `README.md`, który opisuje:

- nazwę projektu;
- krótki opis;
- listę funkcji;
- dane konta demo;
- strukturę projektu;
- instrukcję uruchomienia;
- API;
- testy.

---

## 6. Deploy aplikacji

PlanYourFit nie jest zwykłą stroną statyczną, ponieważ posiada backend API w Node.js. Dlatego do hostingu potrzebna jest platforma obsługująca Node.js, np. VPS, Render, Railway, Fly.io lub hosting z obsługą aplikacji Node.

### Linki

Link do aplikacji online:

```text
DO UZUPEŁNIENIA: https://...
```

Link do repozytorium:

```text
DO UZUPEŁNIENIA: https://github.com/...
```

### Zmienne środowiskowe na serwerze

Minimalny plik `.env` dla wersji demo:

```env
NODE_ENV=production
DEMO_MODE=true
CLIENT_URL=https://twoja-domena.pl
```

Jeżeli aplikacja działa tylko pod IP:

```env
CLIENT_URL=http://IP_SERWERA:4000
```

### Wdrożenie na serwerze

Na serwer należy wrzucić:

```text
client/
server/
database/
package.json
package-lock.json
.env
README.md
DOKUMENTACJA_PROJEKTU.md
```

Nie należy wrzucać:

```text
node_modules/
server/node_modules/
client/node_modules/
```

Komendy na serwerze:

```bash
npm install
npm start
```

Przy użyciu PM2:

```bash
pm2 start npm --name planyourfit -- start
pm2 save
```

Restart po aktualizacji:

```bash
pm2 restart planyourfit
```

Sprawdzenie API:

```text
https://twoja-domena.pl/api/health
```

Oczekiwana odpowiedź:

```json
{
  "status": "ok",
  "service": "PlanYourFit API"
}
```

---

## 7. Screenshoty / materiały wizualne

Dokumentacja powinna zawierać zrzuty ekranu aplikacji. Proponowany folder:

```text
docs/screenshots/
```

Minimalny zestaw screenshotów:

| Plik | Co powinien pokazywać |
|---|---|
| `01-strona-glowna.png` | Strona startowa aplikacji. |
| `02-logowanie-demo.png` | Formularz logowania demo. |
| `03-kalendarz.png` | Widok kalendarza po zalogowaniu. |
| `04-dodawanie-aktywnosci.png` | Popup dodawania aktywności. |
| `05-szczegoly-biegu.png` | Szczegóły aktywności z mapą i Google Maps. |
| `06-statystyki.png` | Statystyki i miesięczny cel. |
| `07-ustawienia.png` | Profil, lokalizacja i motyw. |
| `08-wersja-online.png` | Aplikacja uruchomiona na hostingu. |

Przykładowe odwołanie w dokumentacji po dodaniu plików:

```markdown
![Kalendarz aplikacji](docs/screenshots/03-kalendarz.png)
```

---

## 8. Testowanie

### Testy automatyczne

Projekt zawiera testy backendu:

```bash
npm test
```

Testowane elementy:

- zapytania Overpass dla basenów;
- zapytania Overpass dla hal;
- sortowanie miejsc po odległości;
- rekomendacje pogodowe;
- ostrzeżenia przed burzą i upałem.

### Testy ręczne

W trakcie pracy przetestowano:

- logowanie demo;
- wejście na stałe konto `Demo`;
- dodawanie aktywności;
- edycję aktywności;
- usuwanie aktywności;
- pobieranie lokalizacji;
- zachowanie popupów;
- zmianę motywu;
- działanie celu miesięcznego;
- wyświetlanie trasy na mapie;
- otwieranie trasy w Google Maps.

Wykryte i poprawione problemy:

- logowanie demo nie działało po przepisaniu frontendu;
- popup dodawania aktywności potrafił się zamykać po kliknięciu w tło;
- lokalizacja potrafiła wracać do domyślnej po ponownym renderze;
- ciemny motyw miał nieczytelny tekst na kafelku;
- cel miesięczny był niewygodny przez małe strzałki inputa;
- Google Maps dostawał zbyt uproszczoną trasę.

---

## 9. Najważniejsze założenia projektowe

Najważniejsze decyzje:

1. Aplikacja została uproszczona do wersji pokazowej, dlatego logowanie nie używa JWT ani hashowania.
2. Domyślnie działa `DEMO_MODE=true`, aby projekt można było uruchomić bez MySQL.
3. Frontend został przygotowany jako klasyczne HTML/CSS/JS, bez Reacta i bundlera.
4. Backend Express nadal udostępnia API, żeby zachować logikę aplikacji i integracje.
5. Aplikacja korzysta z zewnętrznych API, ale posiada fallbacki, aby demo nie blokowało się przy chwilowym błędzie usług.
6. Dane demo resetują się po restarcie serwera, co jest akceptowalne dla prezentacji.
7. Kod został podzielony na frontend, kontrolery, trasy, serwisy i walidację.

Projekt pokazuje:

- analizę problemu użytkownika;
- plan funkcji;
- podział pracy na zadania;
- dobór technologii;
- projekt danych;
- implementację aplikacji webowej;
- testowanie;
- przygotowanie do hostingu.

---

## 10. Podsumowanie

PlanYourFit spełnia założenie aplikacji demonstracyjnej do planowania aktywności fizycznej. Użytkownik może zalogować się na konto demo, zaplanować aktywność, sprawdzić pogodę, zobaczyć mapę, analizować statystyki i zmienić ustawienia profilu.

Aplikacja może zostać uruchomiona lokalnie oraz wdrożona na serwerze obsługującym Node.js. Dzięki trybowi demo projekt jest prosty do zaprezentowania i przetestowania bez dodatkowej konfiguracji bazy danych.
