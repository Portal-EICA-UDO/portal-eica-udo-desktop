import { z } from "zod";
import type { Escuela } from "../types";

export const updateDegreesSchema = (selectOptions: Escuela[]) => {
  // Validación para el select cuando las opciones son strings
  const schoolsSelectSchema = z.string().refine(
    (val) => {
      // si options aún no cargadas o vacías, podemos rechazar o aceptar - aquí rechazamos vacío
      if (
        !selectOptions ||
        (Array.isArray(selectOptions) && selectOptions.length === 0)
      )
        return false;
      return selectOptions.map((item) => item.id).includes(val);
    },
    {
      message: "Seleccione una opción válida",
    },
  );
  // Preprocess: si recibe FileList (input file), toma el primer File; si no, undefined
  const fileOrUndefined = z.preprocess(
    (val) => {
      const admittedTypes = ["png", "jpg", "jpeg", "webp", "avif"];
      if (typeof FileList !== "undefined" && val instanceof FileList) {
        const fileExtension = val[0]?.name.split(".").pop()?.toLowerCase();
        return admittedTypes.includes(fileExtension || "") ? val[0] : undefined;
      }
      return undefined;
    },
    z
      .instanceof(File, {
        message:
          "Por favor selecciona una imagen válida (JPG, PNG, WEBP, AVIF)",
      })
      .optional(),
  );
  // schema base

  const base = z.object({
    nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
    descripcion: z.string().min(1, { message: "Ingrese una descripción" }),
    codigo: z.string().min(1, { message: "Ingrese un código" }),

    imagen_url: fileOrUndefined,

    // campo que representa el select (puedes cambiar el nombre a lo que uses en el form)
    escuela: schoolsSelectSchema,
  });

  return base;
};

export type UpdateFormData = z.infer<ReturnType<typeof updateDegreesSchema>>;
