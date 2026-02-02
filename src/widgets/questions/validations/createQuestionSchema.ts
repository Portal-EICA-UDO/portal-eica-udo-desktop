import z from "zod";

export const createQuestionSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  user_email: z
    .string()
    .email("Por favor ingresa un correo electrónico válido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});
