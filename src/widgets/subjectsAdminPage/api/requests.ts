import { supabase } from "@shared/api";

export const getSchools = async () => {
  const { data, error } = await supabase.from("escuelas").select("*");
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
export const getDegreesBySchool = async () => {
  const { data, error } = await supabase.from("escuelas").select(`
    id,
    nombre,
    carreras (
        id, nombre
    )`);
  if (error) {
    throw new Error(error.message);
  }
  const schools: { [key: string]: { id: string; nombre: string }[] } = {};
  for (const school of data) {
    schools[school.nombre] = school.carreras.map((carrera) => ({
      ...carrera,
      id_escuela: school.id,
      escuela_nombre: school.nombre,
    }));
  }
  return schools || [];
};

export const getSubjects = async () => {
  const { data, error } = await supabase
    .from("materias_completas")
    .select(
      "id_materia, materia_nombre, id_carrera, id_escuela, carrera_nombre, escuela_nombre"
    );
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

export const getDegreesWithSchool = async () => {
  const { data, error } = await supabase.from("escuelas").select(`
    id,
    nombre,
    carreras (
        id, nombre
    )`);
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

export const createSubject = async ({
  nombre,
  id_carrera,
}: {
  nombre: string;
  id_carrera: string;
}) => {
  const { data, error } = await supabase
    .from("materias")
    .insert({ nombre, id_carrera })
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateSubject = async ({
  id,
  nombre,
  id_carrera,
}: {
  id: string;
  nombre: string;
  id_carrera: string;
}) => {
  const { data, error } = await supabase
    .from("materias")
    .update({ nombre, id_carrera })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteSubjects = async (ids: string[]) => {
  const { error } = await supabase.from("materias").delete().eq("id", ids);
  if (error) {
    throw new Error(error.message);
  }
};
