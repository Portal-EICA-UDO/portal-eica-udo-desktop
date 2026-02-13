import { supabase } from '@shared/api/lib/supabaseClient';
import { useEffect, useState, type FC } from "react";

// Definimos un tipo para la etiqueta
interface Etiqueta {
    id: string | number;
    nombre: string;
}

type Props = {
    reloadEtiquetas: () => void; // Recibimos la función para recargar las etiquetas después de agregar/eliminar
}

export const ManageEtiquetas: FC<Props> = ({ reloadEtiquetas }) => {
    // 1. Cambiamos el estado a un array de objetos
    const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
    const [newEtiqueta, setNewEtiqueta] = useState<string>("");
    const [repetido, setRepetido] = useState<boolean>(false);

    useEffect(() => {
        const loadEtiquetas = async () => {
            const { data, error } = await supabase
                .from("etiquetas")
                .select("id, nombre");
            if (error) console.error(error);
            if (data) setEtiquetas(data); // Guardamos el objeto completo
        };
        loadEtiquetas();
    }, []);

    const handleAddEtiqueta = async () => {
        const nombreLimpio = newEtiqueta.trim();

        // 2. Validación de duplicados (local)
        if (!nombreLimpio) return;

        const existe = etiquetas.some(
            (e) => e.nombre.toLowerCase() === nombreLimpio.toLowerCase()
        );

        if (existe) {
            setRepetido(true);
            return;
        }
        setRepetido(false);

        // 3. Insertar y obtener el ID generado por la DB
        const { data, error } = await supabase
            .from("etiquetas")
            .insert({ nombre: nombreLimpio })
            .select() // Importante para que devuelva el objeto con el ID
            .single();

        if (error) {
            console.error(error);
            return;
        }

        if (data) {
            setEtiquetas([...etiquetas, data]);
            setNewEtiqueta("");
        }
        reloadEtiquetas();
    };

    const handleDeleteEtiqueta = async (id: string | number) => {
        // 4. Borramos por ID, que es mucho más seguro
        const { error } = await supabase
            .from("etiquetas")
            .delete()
            .eq("id", id);

        if (error) {
            console.error(error);
            return;
        }

        setEtiquetas(etiquetas.filter((e) => e.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gestionar Etiquetas</h2>
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newEtiqueta}
                        onChange={(e) => {
                            setNewEtiqueta(e.target.value);
                            if (repetido) setRepetido(false); // Limpiamos el error al escribir
                        }}
                        placeholder="Nueva etiqueta"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleAddEtiqueta}
                        className="px-4 py-2 bg-[#0A5C8D] cursor-pointer text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                        Agregar
                    </button>
                </div>

                {repetido && (
                    <p className="text-red-500 text-sm font-medium animate-pulse">
                        ⚠️ Esta etiqueta ya existe
                    </p>
                )}

                {/* --- CONTENEDOR CON SCROLL --- */}
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {etiquetas.length > 0 ? (
                        etiquetas.map((etiqueta) => (
                            <li key={etiqueta.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-gray-700">{etiqueta.nombre}</span>
                                <button
                                    onClick={() => handleDeleteEtiqueta(etiqueta.id)}
                                    className="px-3 py-1 cursor-pointer bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">No hay etiquetas creadas</p>
                    )}
                </ul>
            </div>
        </div>
    );
}