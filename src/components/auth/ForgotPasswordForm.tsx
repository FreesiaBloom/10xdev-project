import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setTimeout(() => {
      setIsLoading(false);
      setMessage("Jeśli konto o podanym adresie e-mail istnieje, wysłaliśmy na nie link do resetowania hasła.");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Zapomniałeś hasła?</CardTitle>
        <CardDescription>Podaj swój adres e-mail, a wyślemy Ci link do zresetowania hasła.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
        </CardContent>
        <CardFooter className="pt-8">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Wysyłanie..." : "Wyślij link do resetowania"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
