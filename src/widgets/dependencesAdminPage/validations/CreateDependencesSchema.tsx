import { z } from "zod";

export const createDependencesSchema = z
  .object({
    nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
    mision: z.string().min(1, { message: "Ingrese una misión" }),
    vision: z.string().min(1, { message: "Ingrese una visión" }),
    objetivos: z.string().min(1, { message: "Ingrese unos objetivos" }),
    descripcion: z.string().min(1, { message: "Ingrese una descripción" }),
    escuela: z.string().optional(),
    carrera: z.string().optional(),
    coordinador: z
      .string()
      .min(1, { message: "Seleccione un coordinador valido" }),
  })
  .superRefine((data, ctx) => {
    const tieneEscuela = data.escuela && data.escuela.trim().length > 0;
    const tieneCarrera = data.carrera && data.carrera.trim().length > 0;

    if (!tieneEscuela && !tieneCarrera) {
      ctx.addIssue({
        code: "custom",
        message: "Debe seleccionar una escuela o una carrera",
        path: ["escuela"], // El error se marcará en el campo escuela
      });
      ctx.addIssue({
        code: "custom",
        message: "Debe seleccionar una escuela o una carrera",
        path: ["carrera"], // También en carrera para feedback visual
      });
    }
  });
