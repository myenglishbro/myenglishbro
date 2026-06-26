import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email demasiado largo"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128, "Contraseña demasiado larga"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(100, "Nombre demasiado largo"),
  email: z.string().trim().email("Email inválido").max(255, "Email demasiado largo"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128, "Contraseña demasiado larga"),
  countryCode: z.string().min(1, "Selecciona el código de país"),
  phone: z
    .string()
    .trim()
    .min(6, "Número de teléfono demasiado corto")
    .max(15, "Número de teléfono demasiado largo")
    .regex(/^\d+$/, "Solo se permiten dígitos, sin espacios ni guiones"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email demasiado largo"),
});

export const adminCreateUserSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email demasiado largo"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128, "Contraseña demasiado larga"),
  nombre: z.string().trim().max(100, "Nombre demasiado largo").optional(),
});

export const adminResetPasswordSchema = z.object({
  password: z.string().min(6, "Mínimo 6 caracteres").max(128, "Contraseña demasiado larga"),
});
