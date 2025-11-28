import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email({
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

    role: z.enum(["admin", "superAdmin"] as const, {
      error: "Seleccione un rol",
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
