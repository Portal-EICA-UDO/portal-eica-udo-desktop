import { z } from "zod";
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
      message: "Por favor selecciona una imagen válida (JPG, PNG, WEBP, AVIF)",
    })
    .optional(),
);
export const updateStaffSchema = z.object({
  cedula: z.string().min(1, { message: "Ingrese una cédula válida" }),
  nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
  apellido: z.string().min(1, { message: "Ingrese un apellido válido" }),
  email: z.string().email({ message: "Ingrese un correo válido" }),
  sistesis_curricular: z
    .string()
    .max(2000, {
      message: "La síntesis curricular no debe exceder 2000 caracteres",
    })
    .optional()
    .nullable(),
  telefono: z.string().optional().nullable(),
  posicion: z.string().min(1, { message: "Ingrese una posición válida" }),
  condicion: z.string().min(1, { message: "Ingrese una condición válida" }),
  imagen_url: fileOrUndefined,
  // "materiasAsociadas" puede estar vacío, omitido o contener ids/nombres de materias
  materiasAsociadas: z.array(z.string()).optional(),
});

export type UpdateStaffForm = {
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  imagen_url: string;
  sistesis_curricular?: string | null | undefined;
  telefono: string | null | undefined;
  posicion: string;
  condicion: string;
  materiasAsociadas?: string[] | undefined;
};
