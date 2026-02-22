import { z } from "zod";
import { type Degree } from "../types/types";
export const createSubjectsSchema = (selectOptions: Degree[]) => {
  const degreeSelectSchema = z.string().refine(
    (val) => {
      if (
        !selectOptions ||
        (Array.isArray(selectOptions) && selectOptions.length === 0)
      )
        return false;
      return selectOptions.map((c) => c.id).includes(val);
    },
    { message: "Seleccione una opción válida" },
  );

  const base = z.object({
    nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
    codigo: z.string().min(1, { message: "Ingrese un código válido" }),
    id_carrera: degreeSelectSchema,
  });

  return base;
};
