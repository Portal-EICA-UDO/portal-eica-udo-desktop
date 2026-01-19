import { z } from "zod";

export const updateSchoolsSchema = z.object({
  nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
});
