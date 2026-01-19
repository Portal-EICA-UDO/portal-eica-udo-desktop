import { supabase } from "@shared/api";
import type { SchoolTable } from "../types";

export const getSchools = async () => {
  const { data, error } = await supabase.from("escuelas").select(`
    id,
    nombre,
    carreras (
      count
    )
  `);
  console.log("Schools data:", data);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createSchool = async (nombre: string) => {
  const { data, error } = await supabase
    .from("escuelas")
    .insert({ nombre })
    .select("*, carreras (count)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SchoolTable;
};

export const updateSchool = async (id: number, data: { nombre: string }) => {
  const { data: requestData, error } = await supabase
    .from("escuelas")
    .update({ nombre: data.nombre })
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
