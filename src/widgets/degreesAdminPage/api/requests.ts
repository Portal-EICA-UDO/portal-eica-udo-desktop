import { supabase } from "@shared/api";

export const getDegress = async () => {
  const { data, error } = await supabase.from("carreras").select(`
    id,
    nombre,
    descripcion,
    imagen_url,
   
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
  }));
};

export const updateDegree = async (
  formData: {
    nombre?: string;
    descripcion?: string;
    imagen_url?: string;
    id_escuela?: string;
  },
  id: string
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
}: {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  id_escuela: string;
}) => {
  const { data, error } = await supabase
    .from("carreras")
    .insert({ nombre, descripcion, imagen_url, id_escuela })
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
