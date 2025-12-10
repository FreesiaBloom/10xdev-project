# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi

`OpenRouterService` to usługa po stronie serwera, odpowiedzialna za hermetyzację całej logiki komunikacji z API OpenRouter. Jej głównym zadaniem jest wysyłanie promptów do wybranych modeli językowych (LLM) i otrzymywanie ustrukturyzowanych odpowiedzi w formacie JSON. Usługa ta będzie kluczowym elementem do generowania dynamicznych treści, takich jak fiszki, na podstawie danych wejściowych użytkownika.

Usługa zapewni:

- Bezpieczną obsługę klucza API.
- Abstrakcję nad złożonością budowania zapytań do API.
- Możliwość wymuszania konkretnego schematu odpowiedzi JSON od modelu.
- Ujednoliconą obsługę błędów i walidację danych.

## 2. Opis konstruktora

Konstruktor `OpenRouterService` inicjalizuje usługę, weryfikując, czy wszystkie niezbędne zmienne środowiskowe są dostępne. Głównym zadaniem konstruktora jest sprawdzenie obecności klucza `OPENROUTER_API_KEY`.

```typescript
// Przykład użycia
// Konstruktor nie przyjmuje argumentów, ponieważ konfiguracja
// jest wczytywana ze zmiennych środowiskowych.

try {
  const openRouterService = new OpenRouterService();
} catch (error) {
  console.error("Failed to initialize OpenRouterService:", error.message);
}
```

W przypadku braku klucza API, konstruktor rzuci błędem `ConfigurationError`, co zapobiegnie działaniu aplikacji w niepoprawnym stanie i natychmiast zasygnalizuje problem z konfiguracją.

## 3. Publiczne metody i pola

### `public async generateStructuredResponse<T extends z.ZodTypeAny>(options: GenerationOptions<T>): Promise<z.infer<T>>`

Jest to główna i jedyna publiczna metoda usługi. Jest generyczna i silnie typowana, co zapewnia bezpieczeństwo i wygodę użytkowania.

#### Argumenty

Metoda przyjmuje jeden obiekt `options` typu `GenerationOptions<T>`:

```typescript
import { z } from "zod";

type GenerationOptions<T extends z.ZodTypeAny> = {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: T;
  model?: string; // Opcjonalne, domyślnie np. 'anthropic/claude-3-haiku'
  temperature?: number; // Opcjonalne, domyślnie 0.5
  maxTokens?: number; // Opcjonalne, domyślnie 2048
};
```

- `systemPrompt`: Instrukcja dla modelu, określająca jego rolę i zadanie.
- `userPrompt`: Konkretne zapytanie lub dane od użytkownika.
- `responseSchema`: Schemat `zod`, który definiuje oczekiwaną strukturę odpowiedzi.
- `model` (opcjonalnie): Nazwa modelu OpenRouter do użycia.
- `temperature` (opcjonalnie): Parametr kontrolujący "kreatywność" modelu.
- `maxTokens` (opcjonalnie): Maksymalna liczba tokenów w odpowiedzi.

#### Zwracana wartość

Metoda zwraca `Promise`, który po pomyślnym rozwiązaniu zawiera obiekt zgodny ze schematem `responseSchema`. W przypadku błędu `Promise` zostanie odrzucony z odpowiednim, niestandardowym błędem (patrz sekcja "Obsługa błędów").

## 4. Prywatne metody i pola

- `private readonly apiKey: string;`: Przechowuje klucz API OpenRouter.
- `private readonly apiUrl: string;`: Przechowuje bazowy URL API.
- `private _buildRequestBody<T extends z.ZodTypeAny>(options: GenerationOptions<T>): Record<string, any>`: Buduje ciało zapytania HTTP na podstawie przekazanych opcji, w tym konwertuje schemat `zod` na JSON Schema i formatuje obiekt `response_format`.
- `private async _sendRequest(body: Record<string, any>): Promise<any>`: Wysyła zapytanie `fetch` do API OpenRouter, obsługuje podstawowe błędy sieciowe i statusy HTTP.
- `private _validateAndParseResponse<T extends z.ZodTypeAny>(rawResponse: any, schema: T): z.infer<T>`: Parsuje odpowiedź od API, a następnie waliduje jej strukturę za pomocą przekazanego schematu `zod`. Rzuca `SchemaValidationError`, jeśli odpowiedź nie jest zgodna ze schematem.

## 5. Obsługa błędów

Usługa będzie implementować niestandardowe klasy błędów dziedziczące po `Error`, aby umożliwić precyzyjne ich przechwytywanie i obsługę w kodzie wywołującym.

- `ConfigurationError`: Rzucany przez konstruktor, jeśli brakuje `OPENROUTER_API_KEY`.
- `ApiError`: Bazowa klasa dla błędów zwracanych przez API.
  - `AuthenticationError` (dziedziczy po `ApiError`): Dla statusu `401 Unauthorized`.
  - `RateLimitError` (dziedziczy po `ApiError`): Dla statusu `429 Too Many Requests`.
  - `ServerError` (dziedziczy po `ApiError`): Dla statusów `5xx`.
- `NetworkError`: Rzucany w przypadku problemów z połączeniem sieciowym podczas wywołania `fetch`.
- `SchemaValidationError`: Rzucany, gdy odpowiedź modelu jest poprawnym JSON-em, ale nie jest zgodna z oczekiwanym schematem `zod`.

## 6. Kwestie bezpieczeństwa

1.  **Zarządzanie kluczem API**: Klucz `OPENROUTER_API_KEY` musi być przechowywany wyłącznie w zmiennych środowiskowych. Nigdy nie może być umieszczony bezpośrednio w kodzie ani w plikach konfiguracyjnych wersjonowanych w Gicie. Należy użyć pliku `.env` w środowisku deweloperskim i mechanizmu sekretów platformy hostingowej (np. DigitalOcean App Platform) w środowisku produkcyjnym.
2.  **Walidacja wejścia**: Chociaż usługa jest po stronie serwera, należy zadbać o walidację danych przychodzących do endpointów API, które będą z niej korzystać. Zapobiegnie to atakom typu "prompt injection" na wczesnym etapie.
3.  **Brak ekspozycji po stronie klienta**: Cała logika `OpenRouterService`, a zwłaszcza klucz API, musi pozostać na serwerze. Klient (przeglądarka) nigdy nie powinien mieć bezpośredniego dostępu do tej usługi. Komunikacja powinna odbywać się poprzez dedykowane endpointy API w Astro (`/pages/api`).

## 7. Plan wdrożenia krok po kroku

### Krok 1: Instalacja zależności

Dodaj `zod` i `zod-to-json-schema` do zależności projektu.

```bash
npm install zod zod-to-json-schema
```

### Krok 2: Konfiguracja zmiennych środowiskowych

1.  Utwórz plik `.env` w głównym katalogu projektu (jeśli jeszcze nie istnieje).
2.  Dodaj do niego swój klucz API:

    ```env
    # .env
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```

3.  Dodaj `.env` do pliku `.gitignore`.

### Krok 3: Utworzenie plików usługi i błędów

1.  Utwórz plik dla niestandardowych błędów: `src/lib/errors.ts`.
2.  Utwórz plik dla usługi: `src/lib/services/openrouter-service.ts`.

### Krok 4: Implementacja niestandardowych błędów

W pliku `src/lib/errors.ts` zdefiniuj klasy błędów.

```typescript
// src/lib/errors.ts

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class ServerError extends ApiError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "ServerError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaValidationError";
  }
}
```

### Krok 5: Implementacja `OpenRouterService`

W pliku `src/lib/services/openrouter-service.ts` zaimplementuj logikę usługi.

```typescript
// src/lib/services/openrouter-service.ts

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  ApiError,
  AuthenticationError,
  ConfigurationError,
  NetworkError,
  RateLimitError,
  SchemaValidationError,
  ServerError,
} from "../errors";

// Definicja typu dla opcji
export type GenerationOptions<T extends z.ZodTypeAny> = {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: T;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new ConfigurationError("OPENROUTER_API_KEY is not set in environment variables.");
    }
  }

  public async generateStructuredResponse<T extends z.ZodTypeAny>(options: GenerationOptions<T>): Promise<z.infer<T>> {
    const requestBody = this._buildRequestBody(options);
    const rawResponse = await this._sendRequest(requestBody);
    return this._validateAndParseResponse(rawResponse, options.responseSchema);
  }

  private _buildRequestBody<T extends z.ZodTypeAny>(options: GenerationOptions<T>): Record<string, any> {
    const {
      systemPrompt,
      userPrompt,
      responseSchema,
      model = "openai/gpt-4o-mini",
      temperature = 0.5,
      maxTokens = 2048,
    } = options;

    const schemaName = "StructuredResponse";
    const jsonSchema = zodToJsonSchema(responseSchema, schemaName);

    return {
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: true,
          schema: jsonSchema.definitions?.[schemaName],
        },
      },
    };
  }

  private async _sendRequest(body: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || "An unknown API error occurred.";

        if (response.status === 401) throw new AuthenticationError(errorMessage);
        if (response.status === 429) throw new RateLimitError(errorMessage);
        if (response.status >= 500) throw new ServerError(errorMessage, response.status);

        throw new ApiError(errorMessage, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // Złap błędy sieciowe (np. `fetch` failed)
      throw new NetworkError(`Network request to OpenRouter API failed: ${error.message}`);
    }
  }

  private _validateAndParseResponse<T extends z.ZodTypeAny>(rawResponse: any, schema: T): z.infer<T> {
    try {
      // Pobierz treść wiadomości od asystenta
      const content = rawResponse.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Response content is empty or in an invalid format.");
      }

      // Sparsuj treść, która powinna być stringiem JSON
      const parsedContent = JSON.parse(content);

      // Waliduj sparsowany obiekt za pomocą schematu Zod
      return schema.parse(parsedContent);
    } catch (error) {
      const errorMessage =
        error instanceof z.ZodError
          ? `Schema validation failed: ${error.errors.map((e) => e.message).join(", ")}`
          : `Failed to parse or validate response: ${error.message}`;

      throw new SchemaValidationError(errorMessage);
    }
  }
}
```

### Krok 6: Przykładowe użycie w Astro API Endpoint

Utwórz endpoint, np. `src/pages/api/generate-flashcards.ts`, aby użyć nowej usługi.

```typescript
// src/pages/api/generate-flashcards.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "../../lib/services/openrouter-service";

// 1. Zdefiniuj schemat oczekiwanej odpowiedzi
const FlashcardSchema = z.object({
  front: z.string().describe("The question or term on the front of the flashcard."),
  back: z.string().describe("The answer or definition on the back of the flashcard."),
});

const FlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(1).describe("An array of generated flashcards."),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const topic = body.topic;

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "Topic is required." }), { status: 400 });
    }

    // 2. Utwórz instancję usługi
    const openRouterService = new OpenRouterService();

    // 3. Wywołaj metodę, przekazując prompty i schemat
    const result = await openRouterService.generateStructuredResponse({
      systemPrompt:
        "You are a helpful assistant that creates flashcards. You always respond in the exact JSON format requested.",
      userPrompt: `Create 3 flashcards about ${topic}.`,
      responseSchema: FlashcardsResponseSchema,
    });

    // 4. Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 5. Obsłuż potencjalne błędy z usługi
    console.error(`[API Error] /generate-flashcards:`, error);
    const status = error.status || 500;
    const message = error.message || "An internal server error occurred.";
    return new Response(JSON.stringify({ error: message }), { status });
  }
};
```
