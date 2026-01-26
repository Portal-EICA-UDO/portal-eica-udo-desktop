export type StaffTable = {
  id: string;

  nombre: string;
  apellido: string;
  email: string;
  posicion: string;
  imagen_url: string;
  materiasAsociadas?: MateriasAsociadas[];
};

export type MateriasAsociadas = {
  id: string;
  nombre: string;
  carrera: string;
  id_carrera: string;
};

export type MateriaMultiSelect = {
  id: string;
  name: string;
  nombre: string | null;
  carrera: string | null;
  id_carrera: string | null;
};
