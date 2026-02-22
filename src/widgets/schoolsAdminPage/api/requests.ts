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

export const updateSchool = async (id: string, data: SchoolUpdateFormData) => {
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

export const schoolCodeExists = async (code: string, excludeId?: string) => {
  // Busca coincidencias por código (case-insensitive)
  let query = supabase
    .from("escuelas")
    .select("id")
    .eq("codigo", code)
    .limit(1);

  // Si estamos excluyendo un ID, lo agregamos a la consulta
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

export const schoolNameExists = async (name: string, excludeId?: string) => {
  let query = supabase
    .from("escuelas")
    .select("id")
    .ilike("nombre", name)
    .limit(1);

  // Si estamos excluyendo un ID, lo agregamos a la consulta
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
