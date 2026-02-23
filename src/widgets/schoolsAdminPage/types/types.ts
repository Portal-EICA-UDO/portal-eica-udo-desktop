export type SchoolTable = {
  id: string;
  nombre: string;
  descripcion: string;
  codigo?: string | null;
  objetivos: string;
  mision: string;
  vision: string;
  carreras: {
    count: number;
  }[];
  dependencias: {
    count: number;
  }[];
};

export type SchoolCreateFormData = {
  nombre: string;
  descripcion: string;
  codigo?: string | null;
  objetivos: string;
  mision: string;
  vision: string;
};

export type SchoolUpdateFormData = {
  nombre: string;
  descripcion: string;
  codigo?: string | null;
  objetivos: string;
  mision: string;
  vision: string;
};
