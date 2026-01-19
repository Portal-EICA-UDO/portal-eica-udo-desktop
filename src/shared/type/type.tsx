export type User = {
    id: string;
    full_name: string;
    // Añade email u otros campos si los necesitas en el futuro
}

export type ComentarioHijo = {
    id: string;
    created_at: string;
    id_comentario: string;
    contenido: string;
    id_user: string;
    user?: User;
}

export type ComentarioPadre = {
    id: string;
    created_at: string;
    id_comunicado: string;
    contenido: string;
    id_user: string;
    user?: User;
    children?: ComentarioHijo[];
}

export type ComentariosModalProps = {
    idComunicado: string; // El ID del comunicado cuyos comentarios queremos ver
    onClose: () => void; // Función para cerrar el modal
    currentUser?: User | null; // El usuario actualmente autenticado (opcional)
}

// --- Componente de Tarjeta de Comentario (Padre/Hijo) ---

export type ComentarioCardProps = {
    comment: ComentarioPadre;
    currentUser?: User | null;
    onAddChild?: (parentId: string, child: ComentarioHijo) => void;
    onDelete?: (id: string, isChild?: boolean) => void;
};