import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/lib/schemas";
import { useState } from "react";
import { ZodError } from "zod";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
      // Walidacja po stronie klienta
      RegisterSchema.parse({ email, password, confirmPassword });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Wystąpił nieznany błąd.");
      }

      // Redirect to the login page after successful registration
      window.location.href = "/auth/login";
    } catch (error) {
      if (error instanceof ZodError) {
        // Wyświetl pierwszy błąd walidacji
        setError(error.errors[0].message);
      } else {
        setError(error instanceof Error ? error.message : "Wystąpił nieznany błąd.");
      }
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Rejestracja</CardTitle>
        <CardDescription>Wprowadź swoje dane, aby utworzyć konto.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Hasło</label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="pt-8">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
