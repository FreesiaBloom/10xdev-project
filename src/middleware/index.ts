import { defineMiddleware } from "astro:middleware";

import { createTypedSupabaseClient, supabaseAnonKey } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware((context, next) => {
  const supabase = createTypedSupabaseClient({
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    },
  });
  context.locals.supabase = supabase;
  return next();
});
