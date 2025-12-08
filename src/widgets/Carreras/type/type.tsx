export type Carrera = {
    id: number;
    nombre: string;
    imagen_url: string;
    descripcion: string;
};

export type MateriasMap = {
    id: number;
    nombre?: string;
    carrera?: Carrera | null;
};
