export type StaffTable = {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  posicion: string;
  condicion: string;
  imagen_url: string;
  sistesis_curricular?: string | null;
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
