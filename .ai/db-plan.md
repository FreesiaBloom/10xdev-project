# Database Schema for 10x Cards

This document outlines the database schema for the 10x Cards application, designed for PostgreSQL and managed via Supabase.

## 1. Tables

### `auth.users`

This table is managed by Supabase Authentication and stores user information. It is not created manually. The schema below represents the key columns relevant to our application.

- **id**: `UUID` - Primary Key, unique identifier for the user.
- **email**: `VARCHAR(255)` - User's email address, must be unique.
- **encrypted_password**: `VARCHAR` - The user's hashed password.
- **created_at**: `TIMESTAMPTZ` - Timestamp of when the user account was created.
- **confirmed_at**: `TIMESTAMPTZ` - Timestamp of when the user confirmed their email address.

All other tables in this schema will reference the `id` from this table.

### Enum Types

First, we define a custom ENUM type for the `source` column in the `flashcards` table.

```sql
CREATE TYPE source_enum AS ENUM ('ai_generated', 'ai_edited', 'manual');
```

### `flashcards`

Stores user-generated and AI-generated flashcards.

```sql
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_id BIGINT NULL REFERENCES generations(id) ON DELETE SET NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    source source_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `generations`

Logs metrics related to AI flashcard generation events.

```sql
CREATE TABLE generations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model VARCHAR(255),
    generated_count INTEGER,
    accepted_unedited_count INTEGER,
    accepted_edited_count INTEGER,
    source_text_hash VARCHAR(64),
    source_text_length INTEGER CHECK (source_text_length >= 0),
    generation_duration INTEGER, -- in milliseconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `generation_error_logs`

Logs errors that occur during the AI flashcard generation process.

```sql
CREATE TABLE generation_error_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model VARCHAR(255),
    source_text_hash VARCHAR(64),
    source_text_length INTEGER CHECK (source_text_length >= 0),
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 2. Relationships

The database schema is centered around the `auth.users` table provided by Supabase.

- **`users` and `flashcards`**: A one-to-many relationship. A user can have many flashcards, but each flashcard belongs to a single user.
- **`generations` and `flashcards`**: A one-to-many relationship. A single generation event can result in multiple flashcards. Each flashcard can optionally be linked to a single generation event.
- **`users` and `generations`**: A one-to-many relationship. A user can have many generation events, but each event is tied to a single user.
- **`users` and `generation_error_logs`**: A one-to-many relationship. A user can have multiple generation errors logged, and each log entry is associated with one user.

The `ON DELETE CASCADE` constraint on `user_id` foreign keys ensures that when a user is deleted, all their associated data (flashcards, generation logs, and error logs) is also automatically deleted, complying with data privacy requirements like GDPR. The `ON DELETE SET NULL` for `generation_id` ensures that flashcards are not deleted if their corresponding generation log is removed.

## 3. Indexes

Indexes are created to optimize query performance, especially for common query patterns.

```sql
-- Index to quickly fetch all flashcards for a specific user
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);

-- Index to quickly find flashcards associated with a specific generation event
CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);

-- Index to quickly fetch generation logs for a specific user
CREATE INDEX idx_generations_user_id ON generations(user_id);

-- Index to quickly fetch generation error logs for a specific user
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
```

## 4. Row-Level Security (RLS) Policies

RLS is enabled on all tables containing user data to ensure that users can only access their own information.

### Enable RLS

```sql
-- Enable RLS for each table
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
```

### Define Policies

A single policy on each table is sufficient to grant full access (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) to a user for their own records.

```sql
-- Policy for the 'flashcards' table
CREATE POLICY "Users can manage their own flashcards"
ON flashcards
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for the 'generations' table
CREATE POLICY "Users can view their own generation logs"
ON generations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for the 'generation_error_logs' table
CREATE POLICY "Users can view their own generation error logs"
ON generation_error_logs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## 5. Additional Notes

- **UUIDs for Primary Keys**: `UUID` is used as the primary key for the `flashcards` table. This is a good practice for scalability, as it avoids issues with sequential ID generation in distributed systems. For logging tables (`generations`, `generation_error_logs`), `BIGSERIAL` is sufficient and more performant.
- **Timestamps**: All tables include `created_at` and `updated_at` (where applicable) timestamps, which are crucial for auditing and debugging. The `DEFAULT now()` function automatically sets these timestamps upon record creation.
- **Normalization**: The schema is in Third Normal Form (3NF). Data is logically structured to minimize redundancy and improve data integrity without the need for denormalization at this stage.
