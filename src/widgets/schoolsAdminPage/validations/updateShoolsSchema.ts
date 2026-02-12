import { z } from "zod";

export const updateSchoolsSchema = z.object({
  nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
  descripcion: z.string().min(1, { message: "Ingrese una descripción" }),
  codigo: z.string().optional(),
  objetivos: z.string().min(1, { message: "Ingrese unos objetivos" }),
  mision: z.string().min(1, { message: "Ingrese una misión" }),
  vision: z.string().min(1, { message: "Ingrese una visión" }),
});
