import { z } from "zod";
type Escuela = {
  id: string;
  nombre: string;
};
export const createDegreesSchema = (selectOptions: Escuela[]) => {
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
    }
  );
  // Preprocess: si recibe FileList (input file), toma el primer File; si no, undefined
  const fileOrUndefined = z.preprocess((val) => {
    console.log(val instanceof File);
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

  // schema base

  const base = z.object({
    nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
    descripcion: z.string().min(1, { message: "Ingrese una descripción" }),

    imagen_url: fileOrUndefined,

    // campo que representa el select (puedes cambiar el nombre a lo que uses en el form)
    escuela: schoolsSelectSchema,
  });

  return base;
};
