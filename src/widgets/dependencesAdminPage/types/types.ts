export type DependenceTable = {
  codigo?: string | null;
  id: string;
  nombre: string;
  vision: string;
  mision: string;
  objetivos: string;
  descripcion: string;
  id_escuela?: string | null;
  escuela?: string;
  id_carrera?: string | null;
  carrera?: string;
  id_coordinador: string;
  coordinador: string;
};
