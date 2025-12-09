-- migration: allow_anonymous_access
-- purpose: configures the database to allow anonymous access for development purposes.
-- tables_affected: auth.users, flashcards, generations, generation_error_logs
-- special_notes: this migration creates a default user and sets permissive rls policies for anonymous users.

-- step 1: create the default user
-- inserts a default user into the auth.users table to satisfy foreign key constraints.
-- this allows non-authenticated operations to be associated with a default user account.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, email_change, email_change_sent_at)
values (
  '00000000-0000-0000-0000-000000000000',
  '43454c13-032d-4a61-8f7c-356fab613472', -- src/db/supabase.client.ts::default_user_id
  'authenticated',
  'authenticated',
  'default-user@example.com',
  '', -- not intended for login
  '',
  null,
  null,
  '{"provider":"email","providers":["email"]}',
  '{}',
  '',
  '',
  null
);

-- step 2: remove restrictive anonymous policies
-- drops the initial set of policies that explicitly deny access to anonymous users.
drop policy if exists "anon_users_cannot_select_flashcards" on flashcards;
drop policy if exists "anon_users_cannot_insert_flashcards" on flashcards;
drop policy if exists "anon_users_cannot_update_flashcards" on flashcards;
drop policy if exists "anon_users_cannot_delete_flashcards" on flashcards;

drop policy if exists "anon_users_cannot_select_generations" on generations;
drop policy if exists "anon_users_cannot_insert_generations" on generations;
drop policy if exists "anon_users_cannot_update_generations" on generations;
drop policy if exists "anon_users_cannot_delete_generations" on generations;

drop policy if exists "anon_users_cannot_select_error_logs" on generation_error_logs;
drop policy if exists "anon_users_cannot_insert_error_logs" on generation_error_logs;
drop policy if exists "anon_users_cannot_update_error_logs" on generation_error_logs;
drop policy if exists "anon_users_cannot_delete_error_logs" on generation_error_logs;

-- step 3: create permissive anonymous policies
-- creates new policies that allow anonymous users to perform all operations on the tables.
-- this is intended for development and should be replaced with secure policies in production.
create policy "anon_users_can_access_flashcards" on flashcards for all to anon using (true) with check (true);
create policy "anon_users_can_access_generations" on generations for all to anon using (true) with check (true);
create policy "anon_users_can_access_generation_error_logs" on generation_error_logs for all to anon using (true) with check (true);
