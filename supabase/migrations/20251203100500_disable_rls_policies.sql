-- migration: disable_rls_policies
-- purpose: disables all row-level security policies for flashcards, generations, and generation_error_logs tables.
-- tables_affected: flashcards, generations, generation_error_logs
-- special_notes: this migration removes data access restrictions. ensure this is the intended behavior.

-- step 1: drop policies for flashcards table
-- dropping all policies for both anonymous and authenticated users on the flashcards table.
drop policy if exists "anon_users_cannot_select_flashcards" on flashcards;
drop policy if exists "anon_users_cannot_insert_flashcards" on flashcards;
drop policy if exists "anon_users_cannot_update_flashcards" on flashcards;
drop policy if exists "anon_users_cannot_delete_flashcards" on flashcards;
drop policy if exists "auth_users_can_select_own_flashcards" on flashcards;
drop policy if exists "auth_users_can_insert_own_flashcards" on flashcards;
drop policy if exists "auth_users_can_update_own_flashcards" on flashcards;
drop policy if exists "auth_users_can_delete_own_flashcards" on flashcards;

-- step 2: drop policies for generations table
-- dropping all policies for both anonymous and authenticated users on the generations table.
drop policy if exists "anon_users_cannot_select_generations" on generations;
drop policy if exists "anon_users_cannot_insert_generations" on generations;
drop policy if exists "anon_users_cannot_update_generations" on generations;
drop policy if exists "anon_users_cannot_delete_generations" on generations;
drop policy if exists "auth_users_can_select_own_generations" on generations;
drop policy if exists "auth_users_can_insert_own_generations" on generations;
drop policy if exists "auth_users_can_update_own_generations" on generations;
drop policy if exists "auth_users_can_delete_own_generations" on generations;

-- step 3: drop policies for generation_error_logs table
-- dropping all policies for both anonymous and authenticated users on the generation_error_logs table.
drop policy if exists "anon_users_cannot_select_error_logs" on generation_error_logs;
drop policy if exists "anon_users_cannot_insert_error_logs" on generation_error_logs;
drop policy if exists "anon_users_cannot_update_error_logs" on generation_error_logs;
drop policy if exists "anon_users_cannot_delete_error_logs" on generation_error_logs;
drop policy if exists "auth_users_can_select_own_error_logs" on generation_error_logs;
drop policy if exists "auth_users_can_insert_own_error_logs" on generation_error_logs;
drop policy if exists "auth_users_can_update_own_error_logs" on generation_error_logs;
drop policy if exists "auth_users_can_delete_own_error_logs" on generation_error_logs;
