import React, { useEffect, useState } from 'react';
import { supabase } from '@shared/api';
import { get } from 'react-hook-form';

// Interfaz actualizada

function getImageUrl(bucketName: string, fileName: string): string {
    const projectRef = "xyzcompany"; // Reemplaza con tu Project Ref
    return `https://ldnmltnoowonkijxtrag.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
}

const Comunicados = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Consulta corregida a la tabla "comunicados"
                const { data: fetchedData, error } = await supabase
                    .from("comunicados")
                    .select("id, created_at, contenido, imagen_url") // Seleccionamos solo las columnas necesarias
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setData(fetchedData);
            } catch (e) {
                console.error("Error al obtener datos:", e);
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Componente de Tarjeta de Comunicado ---
    const ComunicadoCard: React.FC<{ item }> = ({ item }) => {
        // Formatear la fecha usando created_at
        const formattedDate = new Date(item.created_at).toLocaleDateString("es-ES", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return (
            <div className="p-4 border-b border-gray-100 transition duration-300 ease-in-out hover:bg-gray-50">
                <div className="flex items-start space-x-3">

                    {/* 2. Contenido del Post */}
                    <div className="flex-1 min-w-0">
                        {/* Nombre y Fecha (Usaremos un nombre estático ya que la columna no existe) */}
                        <div className="flex items-baseline space-x-1 text-sm mb-1">

                            <span className="text-gray-500 text-xs">
                                {formattedDate}
                            </span>
                        </div>

                        {/* Contenido (El texto) */}
                        <p className="text-sm text-gray-700 mb-3 wrap-break-word">
                            {item.contenido || "Comunicado sin contenido."}
                        </p>

                        {/* 3. Renderizado de la Imagen (Si imagen_url existe) */}
                        {item.imagen_url && (
                            <div className="mb-3">
                                <img
                                    src={getImageUrl("comunicados", `${item.imagen_url}.jpg`)}
                                    className="w-full max-h-64 object-cover rounded-xl border border-gray-200"
                                />
                            </div>
                        )}



                        {/* Icono inferior de Respuesta/Comentario */}
                        <div className="mt-2 text-gray-500 hover:text-blue-500 cursor-pointer w-fit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.805A9.73 9.73 0 0112 3c4.97 0 9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Componente de Carga (Skeleton Loader) ---
    const LoadingSkeleton = () => (
        <div className="p-4 border-b border-gray-100 animate-pulse">
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    {/* El bloque principal ahora es más variable: si no hay imagen, ocupa el espacio */}
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-8"></div>
                </div>
            </div>
        </div>
    );

    // --- Renderizado de Errores y Principal ---

    if (error) {
        return (
            <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar comunicados</h3>
                <p className="text-gray-600">{error.message || "Error desconocido. Intente recargar la página."}</p>
            </div>
        );
    }

    return (
        <div className='flex justify-center min-h-screen bg-gray-50'>
            <div className='w-full max-w-lg bg-white border-x border-gray-100 shadow-sm'>


                {loading && (
                    <>
                        <LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton />
                    </>
                )}

                {!loading && data.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay comunicados disponibles en este momento.
                    </div>
                )}

                {!loading && data.length > 0 && (
                    <div>
                        {data.map((item) => (
                            <ComunicadoCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comunicados;