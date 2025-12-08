export type StaffWithMaterias = {
    id: number;
    nombre: string;
    apellido: string;
    imagen_url: string;
    posicion: string;
    materias: Array<
        { id: number; nombre: string; carrera: { id: number; nombre: string } }>;
    email: string;
    telefono: string;
};

export type Carrera = {
    id: number;
    nombre: string;
};

export type MateriasMap = {
    id: number;
    nombre?: string;
    carrera?: Carrera | null;
};
