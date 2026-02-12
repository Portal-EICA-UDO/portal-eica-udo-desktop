export type DegreeTable = {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  escuela: string;
  codigo: string;
  horario_url: string;
  escuela_id: string;
  nombre_horario: string;
};

export type Escuela = {
  id: string;
  nombre: string;
};

export type TableProps = {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  escuela: string;
  escuela_id: string;
  codigo: string;
  horario_url: string;
  nombre_horario: string;
};
