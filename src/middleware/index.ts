import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;

  // Lista ścieżek, które nie wymagają uwierzytelnienia
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/update-password",
  ];

  const isPublicPath = publicPaths.some((path) => url.pathname === path);

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  context.locals.session = session;

  if (!session && !isPublicPath) {
    return redirect("/auth/login");
  }

  if (session && (url.pathname === "/auth/login" || url.pathname === "/auth/register")) {
    return redirect("/generate");
  }

  return next();
});
