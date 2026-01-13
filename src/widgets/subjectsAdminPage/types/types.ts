export type Degree = {
  id: string;
  nombre: string;
  id_escuela: string;
  escuela_nombre: string;
};

export type SubjectTable = {
  id_materia: string;
  materia_nombre: string;
  id_carrera: string;
  carrera_nombre: string;
  id_escuela: string;
  escuela_nombre: string;
};

export type DegreesBySchool = {
  [schoolName: string]: Degree[];
};

export type School = {
  id: string;
  nombre: string;
};
