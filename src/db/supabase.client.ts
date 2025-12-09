import { createClient, type SupabaseClient as SupabaseClientGeneric } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const createTypedSupabaseClient = (options?: any) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anonymous key must be provided.");
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
};

export type SupabaseClient = SupabaseClientGeneric<Database>;

export const DEFAULT_USER_ID = "43454c13-032d-4a61-8f7c-356fab613472";
