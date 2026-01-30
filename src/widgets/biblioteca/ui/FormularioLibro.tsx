import { z } from "zod";

export const createStaffSchema = z.object({
  nombre: z.string().min(1, { message: "Ingrese un nombre válido" }),
  apellido: z.string().min(1, { message: "Ingrese un apellido válido" }),
  email: z.string().email({ message: "Ingrese un correo válido" }),
  telefono: z.string().optional().nullable(),
  posicion: z.string().min(1, { message: "Ingrese una posición válida" }),

  imagen_url: z.instanceof(File, { message: "Debe ser un archivo valido" }),
  materiasAsociadas: z.array(z.string()).optional(),
});