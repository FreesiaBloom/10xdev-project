-- migration: create_initial_schema
-- purpose: sets up the initial database schema for 10x cards.
-- tables_affected: flashcards, generations, generation_error_logs
-- special_notes: this migration creates the core tables and sets up granular rls policies.

-- step 1: create enum types
-- creates a custom enum type for the 'source' column in the 'flashcards' table.
-- this ensures that the source of a flashcard can only be one of the predefined values.
create type source_enum as enum ('ai_generated', 'ai_edited', 'manual');

-- step 2: create generations table
-- this table logs metrics related to ai flashcard generation events.
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(255),
    generated_count integer,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar(64),
    source_text_length integer check (source_text_length >= 0),
    generation_duration integer, -- in milliseconds
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- step 3: create flashcards table
-- this table stores user-generated and ai-generated flashcards.
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id bigint null references generations(id) on delete set null,
    front text not null,
    back text not null,
    box_number integer not null default 1,
    next_review_at timestamptz not null,
    source source_enum not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- step 4: create generation_error_logs table
-- this table logs errors that occur during the ai flashcard generation process.
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(255),
    source_text_hash varchar(64),
    source_text_length integer check (source_text_length >= 0),
    error_code varchar(50),
    error_message text,
    created_at timestamptz not null default now()
);

-- step 5: create indexes
-- indexes are created to optimize query performance for common query patterns.

-- index to quickly fetch all flashcards for a specific user
create index idx_flashcards_user_id on flashcards(user_id);

-- composite index to efficiently find flashcards due for review for a specific user
create index idx_flashcards_user_id_next_review_at on flashcards(user_id, next_review_at);

-- index to quickly find flashcards associated with a specific generation event
create index idx_flashcards_generation_id on flashcards(generation_id);

-- index to quickly fetch generation logs for a specific user
create index idx_generations_user_id on generations(user_id);

-- index to quickly fetch generation error logs for a specific user
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- step 6: enable row level security
-- rls is enabled on all tables containing user data to ensure that users can only access their own information.
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- step 7: create rls policies for flashcards table
-- policies for anonymous users (should not have any access)
create policy "anon_users_cannot_select_flashcards" on flashcards for select to anon using (false);
create policy "anon_users_cannot_insert_flashcards" on flashcards for insert to anon with check (false);
create policy "anon_users_cannot_update_flashcards" on flashcards for update to anon using (false) with check (false);
create policy "anon_users_cannot_delete_flashcards" on flashcards for delete to anon using (false);

-- policies for authenticated users (can manage their own flashcards)
create policy "auth_users_can_select_own_flashcards" on flashcards for select to authenticated using (auth.uid() = user_id);
create policy "auth_users_can_insert_own_flashcards" on flashcards for insert to authenticated with check (auth.uid() = user_id);
create policy "auth_users_can_update_own_flashcards" on flashcards for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "auth_users_can_delete_own_flashcards" on flashcards for delete to authenticated using (auth.uid() = user_id);

-- step 8: create rls policies for generations table
-- policies for anonymous users (should not have any access)
create policy "anon_users_cannot_select_generations" on generations for select to anon using (false);
create policy "anon_users_cannot_insert_generations" on generations for insert to anon with check (false);
create policy "anon_users_cannot_update_generations" on generations for update to anon using (false) with check (false);
create policy "anon_users_cannot_delete_generations" on generations for delete to anon using (false);

-- policies for authenticated users (can manage their own generation logs)
create policy "auth_users_can_select_own_generations" on generations for select to authenticated using (auth.uid() = user_id);
create policy "auth_users_can_insert_own_generations" on generations for insert to authenticated with check (auth.uid() = user_id);
create policy "auth_users_can_update_own_generations" on generations for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "auth_users_can_delete_own_generations" on generations for delete to authenticated using (auth.uid() = user_id);

-- step 9: create rls policies for generation_error_logs table
-- policies for anonymous users (should not have any access)
create policy "anon_users_cannot_select_error_logs" on generation_error_logs for select to anon using (false);
create policy "anon_users_cannot_insert_error_logs" on generation_error_logs for insert to anon with check (false);
create policy "anon_users_cannot_update_error_logs" on generation_error_logs for update to anon using (false) with check (false);
create policy "anon_users_cannot_delete_error_logs" on generation_error_logs for delete to anon using (false);

-- policies for authenticated users (can manage their own error logs)
create policy "auth_users_can_select_own_error_logs" on generation_error_logs for select to authenticated using (auth.uid() = user_id);
create policy "auth_users_can_insert_own_error_logs" on generation_error_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "auth_users_can_update_own_error_logs" on generation_error_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "auth_users_can_delete_own_error_logs" on generation_error_logs for delete to authenticated using (auth.uid() = user_id);
