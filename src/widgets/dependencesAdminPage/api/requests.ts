import { supabase } from "@shared/api";
import type { DependenceTable } from "../types";

export const getSchools = async () => {
  const { data, error } = await supabase.from("escuelas").select("id, nombre");
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
export const getDegrees = async () => {
  const { data, error } = await supabase.from("carreras").select("id, nombre");
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getDependences = async (): Promise<DependenceTable[]> => {
  const { data, error } = await supabase.from("dependencias").select(`
    codigo,
    id,
    nombre,
    vision,
    mision,
    objetivos,
    descripcion,
    escuelas (
      id,
      nombre
    ),
    carreras (
      id,
      nombre
    ),
    staff (
      id,
      nombre
    )
    `);

  if (error) {
    throw error;
  }
  const newData = data.map((dependence) => ({
    ...dependence,
    // por si la escuela es null, para evitar errores
    id_escuela: (dependence.escuelas as any)?.id || null,
    escuela: (dependence.escuelas as any)?.nombre || null,
    // por si la carrera es null, para evitar errores
    id_carrera: (dependence.carreras as any)?.id || null,
    carrera: (dependence.carreras as any)?.nombre || null,
    // por si el staff es null, para evitar errores
    id_coordinador: (dependence.staff as any)?.id || null,
    coordinador: (dependence.staff as any)?.nombre || null,
  }));
  return newData;
};

export const createDependence = async (formData: {
  codigo?: string | null;
  nombre: string;
  vision: string;
  mision: string;
  objetivos: string;
  descripcion: string;
  id_escuela: string | null;
  id_carrera: string | null;
  id_coordinador: string;
}) => {
  const { data, error } = await supabase
    .from("dependencias")
    .insert([formData])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateDependence = async (
  formData: {
    codigo?: string | null;
    nombre?: string;
    vision?: string;
    mision?: string;
    objetivos?: string;
    descripcion?: string;
    id_escuela?: string | null;
    id_carrera?: string | null;
    id_coordinador?: string;
  },
  id: string,
) => {
  console.log(formData);
  console.log(id);
  const { data, error } = await supabase
    .from("dependencias")
    .update(formData)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteDependences = async (ids: string[]) => {
  const { data, error } = await supabase
    .from("dependencias")
    .delete()
    .in("id", ids)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const dependenceCodeExists = async (
  codigo: string,
  excludeId?: string,
): Promise<boolean> => {
  let query = supabase
    .from("dependencias")
    .select("id")
    .eq("codigo", codigo)
    .limit(1); // Limitamos la consulta a 1 resultado();

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es "no se encontraron resultados"
    throw new Error(error.message);
  }
  return !!data;
};

export const dependenceNameExists = async (
  name: string,
  excludeId?: string,
): Promise<boolean> => {
  let query = supabase
    .from("dependencias")
    .select("id")
    .ilike("nombre", name)
    .limit(1); // Limitamos la consulta a 1 resultado();

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es "no se encontraron resultados"
    throw new Error(error.message);
  }
  return !!data;
};

export const getStaff = async () => {
  const { data, error } = await supabase.from("staff").select(`
    id,
    nombre,
    apellido
    `);
  if (error) {
    throw new Error(error.message);
  }
  const staff = data.map((s) => ({
    id: s.id,
    nombre: `${s.nombre} ${s.apellido}`,
  }));

  return staff;
};
