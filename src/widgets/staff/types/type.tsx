export type staffWithMaterias = {
    id: number;
    nombre: string;
    apellido: string;
    imageSrc: string;
    posicion: string;
    materias: Array<
        { id: number; nombre: string; carrera: { id: number; nombre: string } }>;
    email: string;
    telefono: string;
};