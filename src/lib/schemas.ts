import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmPassword"],
  });
