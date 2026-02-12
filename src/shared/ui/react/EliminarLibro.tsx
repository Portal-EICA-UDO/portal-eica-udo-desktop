import { useState, type FC } from "react";
import { supabase } from '@shared/api/lib/supabaseClient';
import { eliminarArchivo } from "@shared/ui/react/EliminarArchive";
type Props = {
    libroId: string;
    reloadLibros?: () => void;
}


export const EliminarLibro: FC<Props> = ({ libroId, reloadLibros}) => {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const deleteBook = async (libroId: string) => {
        // 1. Obtener la URL del archivo antes de borrar el registro
        const { data: libro, error: fetchError } = await supabase
            .from('libros')
            .select('url_download')
            .eq('id', libroId)
            .single();

        if (fetchError || !libro) throw new Error("No se encontró el libro en la base de datos");

        // 2. Eliminar de Google Drive usando la URL
        if (libro.url_download) {
            await eliminarArchivo(libro.url_download);
        }

        const { error: deleteError } = await supabase
            .from('libros')
            .delete()
            .eq('id', libroId);

        if (deleteError) throw deleteError;
    }
    const handleDelete = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            await deleteBook(libroId);
        } catch (error) {
            setErrorMsg("Error al eliminar el libro");
            console.error(error);
            return;
        } finally {
            setLoading(false);
            reloadLibros && reloadLibros();
        }
    }


    return (
        <div>
            <p>
                ¿Estás seguro de que deseas eliminar el libro?
            </p>
            <button
                type="button"
                className="px-4 py-2 rounded cursor-pointer bg-[#CF3115] text-white"
                onClick={handleDelete}
            >
                {loading ? "Eliminando..." : "Eliminar"}
            </button>
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        </div>
    );
}
