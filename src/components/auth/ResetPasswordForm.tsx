import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setTimeout(() => {
      setIsLoading(false);
      setMessage("Twoje hasło zostało zmienione. Możesz się teraz zalogować.");
      // setError("Hasła nie są zgodne.");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Zresetuj hasło</CardTitle>
        <CardDescription>Wprowadź nowe hasło dla swojego konta.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="password">Nowe hasło</label>
            <Input id="password" type="password" required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="confirmPassword">Potwierdź nowe hasło</label>
            <Input id="confirmPassword" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </CardContent>
        <CardFooter className="pt-8">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Ustawianie..." : "Ustaw nowe hasło"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
