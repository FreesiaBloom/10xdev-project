# REST API Plan

This document outlines the REST API for the 10x Cards application, designed to support all functionalities described in the Product Requirements Document (PRD). The API is built on top of Supabase and Astro.

## 1. Resources

- **Users**
  - _Database Table_: `users`
  - Managed through Supabase Auth; operations such as registration and login may be handled via Supabase or custom endpoints if needed.

- **Flashcards**
  - _Database Table_: `flashcards`
  - Fields include: `id`, `front`, `back`, `source`, `created_at`, `updated_at`, `generation_id`, `user_id`.

- **Generations**
  - _Database Table_: `generations`
  - Stores metadata and results of AI generation requests (e.g., `model`, `generated_count`, `source_text_hash`, `source_text_length`, `generation_duration`).

- **Generation Error Logs**
  - _Database Table_: `generation_error_logs`
  - Used for logging errors encountered during AI flashcard generation.

## 2. Endpoints

All endpoints are prefixed with `/api`.

### 2.1. Flashcards

- **GET `/flashcards`**
  - **Description**: Retrieve a paginated, filtered, and sortable list of flashcards for the authenticated user.
  - **Query Parameters**:
    - `page` (default: 1)
    - `limit` (default: 10)
    - `sort` (e.g., `created_at`)
    - `order` (`asc` or `desc`)
    - Optional filters (e.g., `source`, `generation_id`).
  - **Response JSON**:
    ```json
    {
      "data": [
        { "id": 1, "front": "Question", "back": "Answer", "source": "manual", "created_at": "...", "updated_at": "..." }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 100 }
    }
    ```
  - **Errors**: 401 Unauthorized if token is invalid.

- **GET `/flashcards/{id}`**
  - **Description**: Retrieve details for a specific flashcard.
  - **Response JSON**: Flashcard object.
  - **Errors**: 404 Not Found, 401 Unauthorized.

- **POST `/flashcards`**
  - **Description**: Create one or more flashcards (manually or from AI generation).
  - **Request JSON**:
    ```json
    {
      "flashcards": [
        {
          "front": "Question 1",
          "back": "Answer 1",
          "source": "manual",
          "generation_id": null
        },
        {
          "front": "Question 2",
          "back": "Answer 2",
          "source": "ai_generated",
          "generation_id": 123
        }
      ]
    }
    ```
  - **Response JSON**:
    ```json
    {
      "flashcards": [
        { "id": 1, "front": "Question 1", "back": "Answer 1", "source": "manual", "generation_id": null },
        { "id": 2, "front": "Question 2", "back": "Answer 2", "source": "ai_generated", "generation_id": 123 }
      ]
    }
    ```
  - **Validations**:
    - `front` maximum length: 200 characters.
    - `back` maximum length: 500 characters.
    - `source`: Must be one of `ai_generated`, `ai_edited`, or `manual`.
    - `generation_id`: Required for `ai_generated` and `ai_edited` sources, must be null for `manual` source.
  - **Errors**: 400 for invalid inputs, including validation errors for any flashcard in the array.

- **PUT `/flashcards/{id}`**
  - **Description**: Edit an existing flashcard.
  - **Request JSON**: Fields to update.
  - **Response JSON**: Updated flashcard object.
  - **Errors**: 400 for invalid input, 404 if flashcard not found, 401 Unauthorized.

- **DELETE `/flashcards/{id}`**
  - **Description**: Delete a flashcard.
  - **Response JSON**: Success message.
  - **Errors**: 404 if flashcard not found, 401 Unauthorized.

### 2.2. Generation

#### Generate Flashcards from Text

- **POST `/generations`**
  - **Description**: Initiate the AI generation process for flashcards proposals based on user-provided text.
  - **Request JSON**:
    ```json
    {
      "source_text": "User provided text (1000 to 10000 characters)"
    }
    ```
  - **Business Logic**:
    - Validate that `source_text` length is between 1000 and 10000 characters.
    - Call the AI service to generate flashcards proposals.
    - Store the generation metadata and return flashcard proposals to the user.
  - **Response JSON**:
    ```json
    {
      "generation_id": 123,
      "flashcards_proposals": [{ "front": "Generated Question", "back": "Generated Answer", "source": "ai_generated" }],
      "generated_count": 5
    }
    ```
  - **Errors**:
    - 400: Invalid input.
    - 500: AI service errors (logs recorded in `generation_error_logs`).

- **GET `/generations`**
  - **Description**: Retrieve a list of generation requests for the authenticated user.
  - **Query Parameters**: Supports pagination as needed.
  - **Response JSON**: List of generation objects with metadata.

- **GET `/generations/{id}`**
  - **Description**: Retrieve detailed information of a specific generation including its flashcards.
  - **Response JSON**: Generation details and associated flashcards.
  - **Errors**: 404 Not Found.

## 3. Authentication and Authorization

- **Authentication**: The API will use JSON Web Tokens (JWT) provided by Supabase Auth. The client must include the JWT in the `Authorization` header of every request as a Bearer token (`Authorization: Bearer <SUPABASE_JWT>`).
- **Authorization**: Row-Level Security (RLS) is enabled on all tables in the PostgreSQL database. Policies ensure that users can only perform actions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) on their own data. The API server will use the Supabase SDK with the user's JWT to ensure all database queries are executed within the user's security context.

## 4. Validation and Business Logic

### Validation

- `POST /generate`: `text` field must be a string between 1 and 10,000 characters.
- `POST /flashcards`: `front` and `back` are required. `source` must be one of `'manual'`, `'ai_generated'`, `'ai_edited'`.
- `PATCH /flashcards/{id}`: At least one of `front` or `back` must be provided.
- `POST /flashcards/{id}/grade`: `status` must be either `'remembered'` or `'forgotten'`.

### Business Logic

- **AI Generation**: The `POST /generate` endpoint will call an external AI service (e.g., via OpenRouter). On success, it will log the event to the `generations` table. On failure, it will log to the `generation_error_logs` table.
- **Metrics**: The `source` field on flashcards, along with the `generations` table, will be used to track the "AI Quality" and "AI Adoption" metrics as defined in the PRD.
