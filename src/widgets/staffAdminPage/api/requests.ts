import { supabase } from "@shared/api";
import type { MateriaMultiSelect, StaffTable } from "../types/types";
import type { CreateStaffForm } from "../validations";

export const getStaff = async () => {
  const { data, error } = await supabase.from("staff").select(`
      id,
      cedula,
      created_at,
      nombre,
      apellido,
      sistesis_curricular,
      email,
      posicion,
      condicion,
      telefono,
      imagen_url,
      pensum (
        id, id_materias, id_staff,
        materias (
         nombre, carreras (
           nombre,
            id
          )
        )
      )
    `);

  if (error) {
    throw new Error(error.message);
  }
  const newData = data.map((staff) => {
    return {
      ...staff,
      materiasAsociadas: staff.pensum?.map((p) => {
        return {
          id: p.id_materias,
          nombre: (p.materias as any)?.nombre,
          carrera: (p.materias as any)?.carreras?.nombre,
          id_carrera: (p.materias as any)?.carreras?.id,
        };
      }),
    };
  });

  return newData as any as StaffTable[];
};
export const createStaff = async (staffData: CreateStaffForm) => {
  const { data, error } = await supabase
    .from("staff")
    .insert([
      {
        cedula: staffData.cedula,
        nombre: staffData.nombre,
        apellido: staffData.apellido,
        email: staffData.email,
        sistesis_curricular: staffData.sistesis_curricular ?? null,
        posicion: staffData.posicion,
        telefono: staffData.telefono ?? null,
        imagen_url: staffData.imagen_url,
        condicion: staffData.condicion,
      },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  if (staffData.materiasAsociadas && staffData.materiasAsociadas.length > 0) {
    const staffId = data[0].id;
    const pensumInserts = staffData.materiasAsociadas.map((materiaId) => ({
      id_staff: staffId,
      id_materias: materiaId,
    }));
    const { error: pensumError } = await supabase
      .from("pensum")
      .insert(pensumInserts);
    if (pensumError) {
      throw new Error(pensumError.message);
    }
  }
  return data[0];
};
export const identityCardExists = async (
  cedula: string,
  excludeId?: string,
) => {
  let query = supabase.from("staff").select("id").eq("cedula", cedula).limit(1);

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

export const updateStaff = async (
  id: string,
  staffData: CreateStaffForm,
  oldMateriasAsociadas?: string[],
  newMateriasAsociadas?: string[],
) => {
  const { data, error } = await supabase
    .from("staff")
    .update({
      cedula: staffData.cedula,
      nombre: staffData.nombre,
      apellido: staffData.apellido,
      email: staffData.email,
      sistesis_curricular: staffData.sistesis_curricular ?? null,
      posicion: staffData.posicion,
      telefono: staffData.telefono ?? null,
      imagen_url: staffData.imagen_url,
      condicion: staffData.condicion,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  if (staffData.materiasAsociadas) {
    const materiasToAdd =
      newMateriasAsociadas?.filter(
        (id) => !oldMateriasAsociadas?.includes(id),
      ) || [];
    const materiasToRemove =
      oldMateriasAsociadas?.filter(
        (id) => !newMateriasAsociadas?.includes(id),
      ) || [];

    if (materiasToAdd.length > 0) {
      const pensumInserts = materiasToAdd.map((materiaId) => ({
        id_staff: id,
        id_materias: materiaId,
      }));
      const { error: pensumError } = await supabase
        .from("pensum")
        .insert(pensumInserts);
      if (pensumError) {
        throw new Error(pensumError.message);
      }
    }

    if (materiasToRemove.length > 0) {
      const { error: pensumDeleteError } = await supabase
        .from("pensum")
        .delete()
        .eq("id_staff", id)
        .in("id_materias", materiasToRemove);
      if (pensumDeleteError) {
        throw new Error(pensumDeleteError.message);
      }
    }
  }
  return data[0];
};

export const deleteStaffs = async (ids: string[]) => {
  const { data, error } = await supabase
    .from("staff")
    .delete()
    .in("id", ids)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
export const getSubjects = async (): Promise<MateriaMultiSelect[]> => {
  const { data, error } = await supabase
    .from("materias_completas")
    .select(
      "id_materia, materia_nombre, id_carrera, id_escuela, carrera_nombre, escuela_nombre",
    );
  if (error) {
    throw new Error(error.message);
  }
  const newData: MateriaMultiSelect[] = data.map((subject) => {
    return {
      id: subject.id_materia,
      name: `${subject.materia_nombre} - ${subject.carrera_nombre}`,
      nombre: subject.materia_nombre,
      carrera: subject.carrera_nombre,
      id_carrera: subject.id_carrera,
    };
  });
  return newData || [];
};

export const uploadStaffImage = async (file: File) => {
  const { error } = await supabase.storage
    .from("staff-imagenes")
    .upload(file.name, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw new Error(error.message);
  }
};

export const updateStaffImage = async (file: File) => {
  const { data, error } = await supabase.storage
    .from("staff-imagenes")
    .upload(file.name, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteStaffImage = async (filePath: string) => {
  const { error } = await supabase.storage
    .from("staff-imagenes")
    .remove([filePath]);
  if (error) {
    throw new Error(error.message);
  }
};
