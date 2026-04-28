import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un email valido."),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email("Ingresa un email valido."),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres."),
  org_name: z
    .string()
    .min(2, "El nombre de la organizacion es obligatorio.")
    .max(80, "Maximo 80 caracteres."),
  full_name: z.string().max(80).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
