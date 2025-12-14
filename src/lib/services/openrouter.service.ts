/* eslint-disable @typescript-eslint/no-explicit-any */
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
export interface GenerationOptions<T extends z.ZodTypeAny> {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: T;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

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
      throw new NetworkError(
        `Network request to OpenRouter API failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
          : `Failed to parse or validate response: ${error instanceof Error ? error.message : "Unknown error"}`;

      throw new SchemaValidationError(errorMessage);
    }
  }
}
