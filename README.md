# PlanYourFit

## Krótki opis

PlanYourFit to aplikacja webowa do planowania aktywności fizycznych. Pozwala zapisywać treningi w kalendarzu, sprawdzać warunki pogodowe, wyszukiwać miejsca do ćwiczeń oraz analizować podstawowe statystyki aktywności.

## Cel aplikacji

Celem projektu jest ułatwienie planowania ruchu w jednym miejscu: od wyboru aktywności i terminu, przez sprawdzenie pogody lub trasy, aż po monitorowanie realizacji miesięcznego celu. Aplikacja działa jako projekt demonstracyjny z jednym kontem pokazowym.

## Funkcje

- logowanie na stałe konto pokazowe,
- kalendarz aktywności w widoku miesiąca, tygodnia i dnia,
- dodawanie, edycja, usuwanie i potwierdzanie aktywności,
- obsługa biegania, koszykówki i pływania,
- zapisywanie statusu aktywności: planowana, wykonana lub anulowana,
- rekomendacje warunków dla treningu,
- integracja z pogodą Open-Meteo,
- geokodowanie lokalizacji przez Nominatim,
- wyszukiwanie hal sportowych i basenów przez Overpass API,
- generowanie tras biegowych z użyciem OSRM,
- podgląd mapy z wykorzystaniem OpenStreetMap i Leaflet,
- statystyki aktywności oraz miesięczny cel treningowy,
- ustawienia profilu, domyślnej lokalizacji, promienia wyszukiwania i motywu.

## Technologie

- HTML5, CSS3 i JavaScript po stronie klienta,
- Node.js,
- Express.js,
- MySQL 8,
- mysql2,
- Zod,
- dotenv,
- cookie-parser,
- cors,
- helmet,
- express-rate-limit,
- Leaflet i OpenStreetMap,
- zewnętrzne API: Open-Meteo, Nominatim, Overpass API i OSRM.

## Model danych

Główne tabele w bazie danych:

- `users` - dane konta użytkownika, domyślna lokalizacja, preferowany promień wyszukiwania, miesięczny cel aktywności i motyw aplikacji,
- `activities` - podstawowe dane aktywności: typ, tytuł, data, godziny, lokalizacja, notatka, promień wyszukiwania i status,
- `running_details` - szczegóły biegania, m.in. dystans docelowy, dystans rzeczywisty, tempo, szacowany czas, trasa GeoJSON i podsumowanie pogody,
- `basketball_details` - szczegóły koszykówki, typ boiska, wybrane miejsce, pogoda i rekomendacja,
- `swimming_details` - szczegóły pływania, wybrany basen, pogoda i rekomendacja,
- `places_cache` - pamięć podręczna znalezionych hal i basenów,
- `weather_cache` - pamięć podręczna prognozy pogody.

Relacja główna: jeden użytkownik może mieć wiele aktywności (`users` 1:N `activities`). Każda aktywność może mieć jeden rekord szczegółów zależny od typu treningu.

## Instrukcja uruchomienia

Wymagania:

- Node.js 20 lub nowszy,
- npm,
- MySQL 8 lub nowszy, jeśli aplikacja ma działać z trwałym zapisem danych.

Kroki uruchomienia:

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Skopiuj plik `.env.example` do `.env`.

3. Uruchom aplikację w trybie demonstracyjnym bez MySQL:

   ```bash
   npm start
   ```

4. Otwórz aplikację w przeglądarce:

   ```text
   http://localhost:4000
   ```

Tryb deweloperski z automatycznym restartem serwera:

```bash
npm run dev
```

Uruchomienie z MySQL:

1. Ustaw w `.env` wartość `DEMO_MODE=false`.
2. Uzupełnij dane połączenia z bazą: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
3. Utwórz bazę i wczytaj dane startowe:

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p planyourfit < database/seed.sql
   ```

4. Uruchom projekt:

   ```bash
   npm start
   ```

## Konto pokazowe

```text
E-mail: demo@planyourfit.pl
Hasło:  Demo1234!
```

Rejestracja i zmiana hasła są celowo wyłączone, ponieważ projekt korzysta z jednego konta demonstracyjnego.

## Link do wersji online

https://planyourfit.cfolks.pl/

## Autorzy

Autor: Jakub Bała, Szymon Halerz, Wiktor Fornalcczyk

Projekt wykonany jako aplikacja demonstracyjna do planowania aktywności fizycznych.
