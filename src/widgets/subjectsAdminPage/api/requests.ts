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
      "id_materia, materia_nombre, id_carrera, id_escuela, carrera_nombre, escuela_nombre, materia_codigo",
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

export const subjectCodeExists = async (code: string, excludeId?: string) => {
  // Busca coincidencias por código (case-insensitive)
  let query = supabase
    .from("materias")
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

export const createSubject = async ({
  nombre,
  id_carrera,
  codigo,
}: {
  nombre: string;
  id_carrera: string;
  codigo: string;
}) => {
  const { data, error } = await supabase
    .from("materias")
    .insert({ nombre, id_carrera, codigo })
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
  codigo,
}: {
  id: string;
  nombre: string;
  id_carrera: string;
  codigo?: string;
}) => {
  const { data, error } = await supabase
    .from("materias")
    .update({ nombre, id_carrera, codigo })
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
