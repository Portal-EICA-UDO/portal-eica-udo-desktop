export type Carrera = {
    id: number;
    nombre: string;
    imagen_url: string;
    descripcion: string;
    horario_url: string;
    dependencias: DependencyWithStaff[];
};

export type DependencyWithStaff = {
    id: number;
    nombre: string;
    staff: {
        id: number;
        nombre: string;
        apellido: string;
    };
}

export type MateriasMap = {
    id: number;
    nombre?: string;
    carrera?: Carrera | null;
};
