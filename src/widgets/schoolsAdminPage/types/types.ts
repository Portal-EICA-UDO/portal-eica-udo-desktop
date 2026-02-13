export type SchoolTable = {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
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
  codigo?: string;
  objetivos: string;
  mision: string;
  vision: string;
};

export type SchoolUpdateFormData = {
  nombre: string;
  descripcion: string;
  codigo?: string;
  objetivos: string;
  mision: string;
  vision: string;
};
