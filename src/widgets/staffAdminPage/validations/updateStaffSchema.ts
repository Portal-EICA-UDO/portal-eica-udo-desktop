import { z } from "zod";
// Preprocess: si recibe FileList (input file), toma el primer File; si no, undefined
const fileOrUndefined = z.preprocess(
  (val) => {
    // react-hook-form entrega FileList desde input[type=file]
    if (typeof FileList !== "undefined" && val instanceof FileList) {
      return val.length > 0 ? val[0] : undefined;
    }
    // si ya es File
    if (typeof File !== "undefined" && val instanceof File) {
      return val;
    }
    return undefined;
  },
  z.instanceof(File, { message: "Debe ser un archivo válido" }).optional(),
);
export const updateStaffSchema = z.object({
  nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
  apellido: z.string().min(1, { message: "Ingrese un apellido válido" }),
  email: z.string().email({ message: "Ingrese un correo válido" }),
  telefono: z.string().optional().nullable(),
  posicion: z.string().min(1, { message: "Ingrese una posición válida" }),

  imagen_url: fileOrUndefined,
  // "materiasAsociadas" puede estar vacío, omitido o contener ids/nombres de materias
  materiasAsociadas: z.array(z.string()).optional(),
});

export type UpdateStaffForm = {
  nombre: string;
  apellido: string;
  email: string;
  imagen_url: string;
  telefono: string | null | undefined;
  posicion: string;
  materiasAsociadas?: string[] | undefined;
};
