import { supabase } from "@shared/api";
import { eliminarArchivo } from "@shared/ui/react/EliminarArchive";

export const getDegress = async () => {
  const { data, error } = await supabase.from("carreras").select(`
    id,
    nombre,
    descripcion,
    imagen_url,
    codigo,
    horario_url,
    nombre_horario,
    escuelas (
      id, nombre)
  `);
  if (error) {
    throw new Error(error.message);
  }

  return data.map((degree) => ({
    id: degree.id,
    nombre: degree.nombre,
    descripcion: degree.descripcion,
    imagen_url: degree.imagen_url,
    escuela: (degree.escuelas as any).nombre,
    escuela_id: (degree.escuelas as any).id,
    codigo: degree.codigo,
    horario_url: degree.horario_url,
    nombre_horario: degree.nombre_horario,
  }));
};

export const updateDegree = async (
  formData: {
    nombre?: string;
    descripcion?: string;
    imagen_url?: string;
    id_escuela?: string;
    codigo?: string;
    horario_url?: string;
    nombre_horario?: string;
  },
  id: string,
) => {
  const { data, error } = await supabase
    .from("carreras")
    .update(formData)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const createDegree = async ({
  nombre,
  descripcion,
  imagen_url,
  id_escuela,
  codigo,
  horario_url,
  nombre_horario,
}: {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  id_escuela: string;
  codigo: string;
  horario_url: string;
  nombre_horario: string;
}) => {
  const { data, error } = await supabase
    .from("carreras")
    .insert({
      nombre,
      descripcion,
      imagen_url,
      id_escuela,
      codigo,
      horario_url,
      nombre_horario,
    })
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteDegrees = async (ids: string[]) => {
  const { error } = await supabase.from("carreras").delete().eq("id", ids);
  if (error) {
    throw new Error(error.message);
  }
};

export const uploadDegreeImage = async (file: File) => {
  const { error } = await supabase.storage
    .from("carreras-imagenes")
    .upload(file.name, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw new Error(error.message);
  }
};

export const updateDegreeImage = async (file: File) => {
  const { data, error } = await supabase.storage
    .from("carreras-imagenes")
    .upload(file.name, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateDegreeFile = async (file: File, oldFilePath: string) => {
  // Primero eliminamos el archivo antiguo
  await eliminarArchivo(oldFilePath);
  // Luego subimos el nuevo archivo
  return await guardarArchivo(file);
};

export const deleteDegreeImage = async (filePath: string) => {
  const { error } = await supabase.storage
    .from("carreras-imagenes")
    .remove([filePath]);
  if (error) {
    throw new Error(error.message);
  }
};

export const getEscuelas = async () => {
  const { data, error } = await supabase.from("escuelas").select("nombre, id");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const degreeNameExists = async (name: string) => {
  // Busca coincidencias por nombre (case-insensitive)
  const { data, error } = await supabase
    .from("carreras")
    .select("id")
    .ilike("nombre", name)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) && data.length > 0;
};
export const degreeCodeExists = async (code: string) => {
  // Busca coincidencias por código (case-insensitive)
  const { data, error } = await supabase
    .from("carreras")
    .select("id")
    .ilike("codigo", code)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) && data.length > 0;
};

export function guardarArchivo(file: File, extras = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Leemos el archivo como DataURL
    reader.readAsDataURL(file);

    // Cuando termine la conversión a Base64
    reader.onload = async () => {
      try {
        const rawLog =
          typeof reader.result === "string" ? reader.result.split(",")[1] : "";

        const dataSend = {
          dataReq: {
            data: rawLog,
            name: file.name,
            type: file.type, // Aquí puedes pasar las etiquetas
          },
          fname: "uploadFilesToGoogleDrive",
        };

        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbwPJ1m-3xbCm7kOG4hKHgZnFyuB7Xn9b5qjNCvByTJhF7iCTdU1F6ZtOLDvLjEmC7chVA/exec",
          {
            method: "POST",
            body: JSON.stringify(dataSend),
          },
        );

        const result = await response.json();
        resolve(result); // Devolvemos la respuesta exitosa
      } catch (error) {
        reject(error); // Si falla el fetch o el parseo
      }
    };

    // Si hay un error leyendo el archivo local
    reader.onerror = (error) => reject(error);
  });
}
