# Nauka Słówek - Aplikacja do Nauki Języka Angielskiego

Prosta, ale potężna aplikacja webowa do nauki angielskich słówek na poziomach A2, B1 i B2. Umożliwia naukę poprzez listy, fiszki (z wykorzystaniem algorytmu SM-2 light) oraz testy wielokrotnego wyboru (ABC).

![Podgląd aplikacji](https://i.imgur.com/your-screenshot.png) <!-- Należy podmienić na aktualny zrzut ekranu -->

## Funkcje

-   **Poziomy trudności:** Słówka podzielone na poziomy A2, B1, B2.
-   **Kategorie tematyczne:** Słówka pogrupowane w kategorie ułatwiające naukę kontekstową.
-   **Wiele trybów nauki:**
    -   **Lista:** Przeglądaj wszystkie słówka z danej kategorii.
    -   **Fiszki:** Ucz się efektywnie dzięki systemowi powtórek interwałowych (SM-2 light).
    -   **Test ABC:** Sprawdzaj swoją wiedzę w teście wielokrotnego wyboru.
-   **Filtrowanie i personalizacja:**
    -   Filtruj słówka (wszystkie, nieznane, znane).
    -   Ukrywaj i pokazuj tłumaczenia.
    -   Mieszaj kolejność słówek.
    -   Filtruj słówka, które posiadają przykładowe zdania.
-   **Śledzenie postępów:** Aplikacja zapisuje Twoje postępy (zapamiętane słówka, harmonogram powtórek) w `localStorage` przeglądarki.
-   **Sesje nauki:** Mierz czas i skuteczność swoich sesji nauki.
-   **Ćwiczenia z przykładami:** Dedykowana sekcja do przeglądania słówek w kontekście przykładowych zdań.
-   **Skróty klawiaturowe:** Usprawnij naukę dzięki intuicyjnym skrótom.

## Struktura plików

Aplikacja ma prostą i przejrzystą strukturę plików:

```
/
├── css/
│   └── style.css         # Style CSS aplikacji
├── data/
│   ├── samples.txt       # Przykładowe zdania (opcjonalne)
│   └── words.txt         # Lista słówek
├── js/
│   └── app.js            # Logika aplikacji
├── index.html            # Główny plik HTML
└── README.md             # Ten plik
```

## Jak uruchomić?

Aplikacja jest w pełni statyczna i nie wymaga serwera backendowego. Wystarczy otworzyć plik `index.html` w nowoczesnej przeglądarce internetowej (np. Chrome, Firefox, Edge).

Ze względu na politykę bezpieczeństwa przeglądarek (`CORS`), która blokuje żądania `fetch()` do lokalnych plików, **zalecane jest uruchomienie prostego serwera deweloperskiego.**

1.  Upewnij się, że masz zainstalowany **Node.js**.
2.  Zainstaluj globalnie pakiet `serve`:
    ```bash
    npm install -g serve
    ```
3.  W głównym folderze aplikacji uruchom serwer:
    ```bash
    serve .
    ```
4.  Otwórz w przeglądarce adres URL podany w terminalu (zazwyczaj `http://localhost:3000`).

## Jak dodawać własne słówka?

Możesz łatwo rozbudowywać bazę słówek, edytując pliki w folderze `data/`.

### 1. Dodawanie słówek (`data/words.txt`)

Plik `words.txt` to plik CSV (dane rozdzielone średnikami) o następującej strukturze:

```csv
Poziom;Kategoria;English;Polski
```

**Przykład:**

```csv
A2;Dom;a window;okno
B1;Podróże;a journey;podróż
B2;Nauka;a discovery;odkrycie
```

### 2. Dodawanie przykładów (`data/samples.txt`)

Plik `samples.txt` jest opcjonalny i również jest plikiem CSV. Służy do dodawania przykładowych zdań.

```csv
Poziom;Kategoria;English;Polski;English Sample;Polish Sample
```

**Ważne:** Wartość w kolumnie `English` musi **dokładnie odpowiadać** wartości z pliku `words.txt`, aby przykład został poprawnie dopasowany.

**Przykład:**

```csv
A2;Dom;a window;okno;"The cat is sitting by the window.";"Kot siedzi przy oknie."
```

## Autor

Stworzone przez **Jules, AI Software Engineer**.