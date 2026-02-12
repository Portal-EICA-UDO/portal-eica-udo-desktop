import { z } from "zod";
const fileOrUndefined = z.preprocess((val) => {
  // react-hook-form entrega FileList desde input[type=file]
  if (typeof FileList !== "undefined" && val instanceof FileList) {
    return val.length > 0 ? val[0] : undefined;
  }
  // si ya es File
  if (typeof File !== "undefined" && val instanceof File) {
    return val;
  }
  return undefined;
}, z.instanceof(File));
export const createBookSchema = z.object({
    nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
    descripcion: z.string().min(1, { message: "Ingrese una descripción válida" }),
    etiquetas: z.array(z.string()).min(1, { message: "Seleccione al menos una etiqueta" }),
    archivo: fileOrUndefined
});

