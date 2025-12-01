import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, {
      message: "Ingrese un nombre válido",
    }),
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

    confirmPassword: z
      .string()
      .min(6, {
        message: "La contraseña debe tener al menos 6 caracteres",
      })
      .max(20, {
        message: "La contraseña debe tener como máximo 20 caracteres",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
