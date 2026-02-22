export type DegreeTable = {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  escuela: string;
  codigo: string;
  escuela_id: string;
  horario_url?: string | null;
  nombre_horario?: string | null;
};

export type Escuela = {
  id: string;
  nombre: string;
};
