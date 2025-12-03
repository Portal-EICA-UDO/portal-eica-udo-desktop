import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    message: "Ingrese un correo válido",
  }),
  password: z
    .string()
    .min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    })
    .max(20, {
      message: "La contraseña debe tener como máximo 20 caracteres",
    }),
});
