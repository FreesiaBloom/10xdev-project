import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Wylogowywanie nie powiodło się.");
      }

      // Przekierowanie do strony logowania po pomyślnym wylogowaniu
      window.location.href = "/auth/login";
    } catch (error) {
      console.error(error);
      // Opcjonalnie: Pokaż powiadomienie o błędzie
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="outline">
      {isLoading ? "Wylogowywanie..." : "Wyloguj się"}
    </Button>
  );
}
