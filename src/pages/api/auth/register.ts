import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { RegisterSchema } from "@/lib/schemas";
import { ZodError } from "zod";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = RegisterSchema.parse(body);

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // W panelu Supabase należy wyłączyć opcję "Enable email confirmation", 
    // aby użytkownik był od razu zalogowany po rejestracji.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: "Ten adres e-mail jest już zajęty." }), {
          status: 409, // Conflict
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Zgodnie z PRD (US-001), użytkownik jest automatycznie logowany po rejestracji.
    // Supabase signUp domyślnie loguje użytkownika i ustawia sesję.

    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane wejściowe.", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error(error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd serwera." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
