# PlanYourFit

Projekt demonstracyjny z klasycznym frontendem **HTML + CSS + JavaScript**, API w Node.js/Express i bazą MySQL. Frontend nie używa Reacta, bundlera ani procesu kompilacji — jest serwowany bezpośrednio przez backend.

Domyślnie `DEMO_MODE=true`: aplikacja uruchamia się bez MySQL, a dane są przechowywane w pamięci do restartu serwera. Ustaw `DEMO_MODE=false`, aby używać trwałego zapisu MySQL.

## Funkcje

- stałe konto pokazowe i proste logowanie bez JWT, hashowania oraz zabezpieczeń produkcyjnych,
- kalendarz w widoku miesiąca, tygodnia i dnia,
- dodawanie, edycja, usuwanie, powtarzanie oraz potwierdzanie aktywności,
- bieganie, koszykówka i pływanie,
- pogoda Open-Meteo, geokodowanie Nominatim i czas lokalny,
- wyszukiwanie hal i basenów przez Overpass API,
- generowanie pętli biegowych OSRM i podgląd na OpenStreetMap,
- rekomendacje warunków, statystyki, miesięczny cel, powiadomienia,
- ustawienia profilu, geolokalizacja oraz jasny/ciemny motyw.

## Stałe konto

```text
E-mail: demo@planyourfit.pl
Hasło:  Demo1234!
```

Konto ma zawsze identyfikator `1`. Rejestracja i zmiana hasła są celowo wyłączone. Cookie `demo_session=1` jest jawne i przewidywalne — to założenie projektu pokazowego, nie rozwiązanie do wdrożenia publicznego.

## Struktura

```text
client/
  index.html        dokument aplikacji
  styles.css        główne style
  vanilla.css       uzupełnienia wersji bez frameworka
  app.js            interfejs i komunikacja z API
server/              API Express, integracje i logika aplikacji
database/            schemat, migracje oraz dane startowe MySQL
```

## Uruchomienie

Wymagane są Node.js 20+ i MySQL 8+.

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Utwórz bazę i wczytaj konto pokazowe:

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p planyourfit < database/seed.sql
   ```

3. Skopiuj `.env.example` do `.env` i wpisz parametry MySQL.

4. Uruchom cały projekt jednym poleceniem:

   ```bash
   npm start
   ```

5. Otwórz `http://localhost:4000`.

Tryb z automatycznym restartem backendu: `npm run dev`. Frontend nie wymaga `npm run build`.

## API

Istniejące endpointy REST pozostają dostępne pod `/api`, w tym aktywności, statystyki, ustawienia, pogodę, miejsca, geokodowanie, trasy i rekomendacje. `POST /api/auth/register` zwraca `405`, ponieważ w projekcie działa tylko jedno konto.

## Testy

```bash
npm test
npm run build
```

`build` jest kontrolnym poleceniem informującym, że statyczny frontend nie wymaga kompilacji.
