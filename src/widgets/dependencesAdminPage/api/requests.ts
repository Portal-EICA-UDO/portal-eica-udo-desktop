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
    id_escuela: (dependence.escuelas as any).id,
    escuela: (dependence.escuelas as any).nombre,
    id_carrera: (dependence.carreras as any).id,
    carrera: (dependence.carreras as any).nombre,
    id_coordinador: (dependence.staff as any).id,
    coordinador: (dependence.staff as any).nombre,
  }));
  return newData;
};

export const createDependence = async (formData: {
  nombre: string;
  vision: string;
  mision: string;
  objetivos: string;
  descripcion: string;
  id_escuela: string;
  id_carrera: string;
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
    nombre?: string;
    vision?: string;
    mision?: string;
    objetivos?: string;
    descripcion?: string;
    id_escuela?: string;
    id_carrera?: string;
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

export const deleteDependences = async (id: string[]) => {
  const { data, error } = await supabase
    .from("dependencias")
    .delete()
    .in("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const getStaff = async () => {
  const { data, error } = await supabase.from("staff").select(`
    id,
    nombre
    `);
  if (error) {
    throw new Error(error.message);
  }

  return data;
};
