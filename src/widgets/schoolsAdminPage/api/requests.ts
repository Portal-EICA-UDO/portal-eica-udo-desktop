import { supabase } from "@shared/api";
import type {
  SchoolCreateFormData,
  SchoolTable,
  SchoolUpdateFormData,
} from "../types";

export const getSchools = async () => {
  const { data, error } = await supabase.from("escuelas").select(`
    id,
    nombre,
    carreras (
      count
    ),
      mision,
      objetivos,
      descripcion,
      codigo,
      vision,
      dependencias (
        count
      )
  `);
  console.log("Schools data:", data);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createSchool = async (schoolData: SchoolCreateFormData) => {
  console.log("Creating school with data:", schoolData);
  const { data, error } = await supabase
    .from("escuelas")
    .insert(schoolData)
    .select("*, carreras (count)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SchoolTable;
};

export const updateSchool = async (id: number, data: SchoolUpdateFormData) => {
  const { data: requestData, error } = await supabase
    .from("escuelas")
    .update(data)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return requestData;
};

export const deleteSchools = async (ids: string[]) => {
  const { data, error } = await supabase
    .from("escuelas")
    .delete()
    .in("id", ids)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const schoolCodeExists = async (code: string) => {
  // Busca coincidencias por código (case-insensitive)
  const { data, error } = await supabase
    .from("escuelas")
    .select("id")
    .ilike("codigo", code)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) && data.length > 0;
};

export const schoolNameExists = async (name: string) => {
  // Busca coincidencias por nombre (case-insensitive)
  const { data, error } = await supabase
    .from("escuelas")
    .select("id")
    .ilike("nombre", name)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) && data.length > 0;
};
