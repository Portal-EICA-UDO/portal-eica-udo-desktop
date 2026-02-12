export type School = {
  id: string;
  nombre: string;
  mision: string;
  vision: string;
  descripcion: string;
  objetivos: string;
  dependencias: { nombre: string; coordinador: string }[];
};
