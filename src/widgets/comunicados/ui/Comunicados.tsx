import React, { useEffect, useState, useMemo, useRef } from 'react';
import ComentariosModal from '@shared/ui/react/ComentariosModal';
import { supabase } from '@shared/api';
import type { ComunicadoItem } from '../type/type';
import type { User } from '@shared/type/type';
import { useStore } from '@nanostores/react';
import { role } from '@features/auth/nanostore';
// Interfaz para la URL de la imagen
function getImageUrl(bucketName: string, fileName: string): string {
    if (!fileName) return '';
    const name = fileName.includes('.') ? fileName : `${fileName}.jpg`;
    return `https://ldnmltnoowonkijxtrag.supabase.co/storage/v1/object/public/${bucketName}/${name}`;
}


const Comunicados: React.FC = () => {
    // --- Referencia para el Scroll ---
    const listContainerRef = useRef<HTMLDivElement>(null); // Referencia al div que contiene la lista

    // --- Estado para los datos y la lógica de carga ---
    const [data, setData] = useState<ComunicadoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // --- Estado para la Paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5); // Elementos por página
    const [totalCount, setTotalCount] = useState(0);
    const [comunicadoID, setComunicadoID] = useState<string | null>(null);

    // --- Estados y lógica para Crear Comunicado ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // --- Modal de Comentarios --- //
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // Modal de confirmación para eliminar
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; imagen?: string | null } | null>(null);

    // Rol del usuario (nanostore)
    const $role = useStore(role);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                if (mounted) setCurrentUser(null);
                return;
            }

            const { data, error } = await supabase
                .from('roles')
                .select('id, full_name')
                .eq('user_id', user.id)
                .single();

            if (!error && data && mounted) {
                setCurrentUser({ id: data.id, full_name: data.full_name });
            }
        }).catch(err => console.error('Error getting auth user:', err));

        return () => { mounted = false; };
    }, []);

    

    // Calcular el número total de páginas
    const totalPages = useMemo(() => {
        return Math.ceil(totalCount / pageSize);
    }, [totalCount, pageSize]);

    // Función para cambiar de página Y hacer scroll
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);

            // --- LÓGICA DE SCROLL AÑADIDA AQUÍ ---
            if (listContainerRef.current) {
                // Opción 1: Scroll suave al inicio del componente
                listContainerRef.current.scrollIntoView({ behavior: 'smooth' });
                // Opción 2: Scroll al inicio de la ventana (si el componente es alto)
                // window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            // Calcular el rango (offset y limit)
            const startRange = (currentPage - 1) * pageSize;
            const endRange = startRange + pageSize - 1;

            try {
                let query = supabase
                    .from("comunicados")
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(startRange, endRange);

                const { data: fetchedData, error, count } = await query;

                if (error) throw error;

                setData(fetchedData || []);
                setTotalCount(count || 0);

            } catch (e) {
                console.error("Error al obtener datos:", e);
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage, pageSize]); // Dependencias: Recargar cuando cambie la página o el tamaño de página

    // Maneja cambio de archivo para la imagen
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewImageFile(e.target.files[0]);
        }
    };

    // Crear nuevo comunicado (subir imagen si aplica, insertar registro)
    const handleCreateComunicado = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isCreating) return;
        if (!newContent.trim() && !newImageFile) {
            return;
        }

        setIsCreating(true);

        try {
            let imagenFilename: string | null = null;

            if (newImageFile) {
                // Crear nombre único
                const filename = `${Date.now()}_${newImageFile.name}`;

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('comunicados')
                    .upload(filename, newImageFile);

                if (uploadError) throw uploadError;

                imagenFilename = filename; // guardamos el nombre tal cual
            }

            const newComunicado = {
                contenido: newContent.trim(),
                imagen_url: imagenFilename,
            };

            const { data: inserted, error: insertError } = await supabase
                .from('comunicados')
                .insert([newComunicado])
                .select()
                .single();

            if (insertError) throw insertError;

            // Actualizar UI inmediatamente sin recargar:
            if (inserted) {
                // Si estamos en la primera página, simplemente anteponemos
                if (currentPage === 1) {
                    setData(prev => {
                        const updated = [inserted as ComunicadoItem, ...prev];
                        return updated.slice(0, pageSize); // mantener tamaño de página
                    });
                } else {
                    // Si no estamos en la primera página, vamos a la primera y mostramos el nuevo item al tope
                    setCurrentPage(1);
                    setData(prev => [inserted as ComunicadoItem, ...prev].slice(0, pageSize));
                }

                setTotalCount(prev => (prev || 0) + 1);
            }

            // Reiniciar formulario
            setNewContent('');
            setNewImageFile(null);
            setIsCreateOpen(false);

        } catch (err) {
            console.error('Error creating comunicado:', err);
            alert('Error al crear comunicado.');
        } finally {
            setIsCreating(false);
        }
    };

    // Eliminar comunicado (imagen en storage + registro en la tabla)
    const handleDeleteComunicado = async (id: number | string, imagenFilename?: string | null) => {
        try {
            setLoading(true);

            // 1) Eliminar imagen del storage si existe
            if (imagenFilename) {
                const { error: removeError } = await supabase.storage.from('comunicados').remove([imagenFilename]);
                
            }

            // 2) Eliminar registro de la tabla (pedimos selección para obtener respuesta clara)
            const { data: deletedData, error: deleteError, status } = await supabase
                .from('comunicados')
                .delete()
                .eq('id', id)
                .select();

            console.log('Supabase delete response:', { status, deletedData, deleteError });

            if (deleteError) {
                // Mostrar mensaje de error más explícito
                const msg = (deleteError && (deleteError.message || deleteError.details)) || 'Error desconocido al eliminar el registro.';
                throw new Error(msg as string);
            }

            // 3) Actualizar UI local
            setData(prev => prev.filter(item => item.id !== id));
            setTotalCount(prev => Math.max(0, (prev || 0) - 1));

            // Si después de borrar no quedan items en la página actual y no estamos en la primera, intentamos retroceder una página
            if ((data.length === 1) && currentPage > 1) {
                setCurrentPage(prev => Math.max(1, prev - 1));
            }

        } catch (err) {
            console.error('Error deleting comunicado:', err);
            alert('Error al eliminar comunicado. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
            // cerrar modal y limpiar objetivo
            setDeleteModalOpen(false);
            setDeleteTarget(null);
        }
    };

    // --- Componente de Tarjeta de Comunicado (ComunicadoCard)  ---
    const ComunicadoCard: React.FC<{ item: ComunicadoItem }> = ({ item }) => {
        const formattedDate = new Date(item.created_at).toLocaleDateString("es-ES", {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        return (
            <div className="p-4 border-b border-gray-100 transition duration-300 ease-in-out hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                    {/* Contenido del Post */}
                    <div className="flex-1 min-w-0">
                        {/* Fecha */}
                        <div className="flex items-baseline space-x-1 text-sm mb-1">
                            <span className="text-gray-500 text-xs">
                                {formattedDate}
                            </span>
                        </div>
                        {/* Contenido (El texto) */}
                        <p className="text-sm text-gray-700 mb-3 wrap-break-word">
                            {item.contenido || "Comunicado sin contenido."}
                        </p>
                        {/* Renderizado de la Imagen (Si imagen_url existe) */}
                        {item.imagen_url && (
                            <div className="mb-3">
                                <img
                                    src={getImageUrl("comunicados", item.imagen_url)}
                                    className="w-full max-h-64 object-center rounded-xl border border-gray-200"
                                />
                            </div>
                        )}
                        {/* Iconos inferiores: comentarios (izq) y eliminar (der) */}
                        <div className="mt-2 flex items-center justify-between">
                            <div className="text-gray-500 hover:text-blue-500 cursor-pointer" onClick={() => { setIsModalOpen(true); setComunicadoID(item.id.toString()) }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.805A9.73 9.73 0 0112 3c4.97 0 9 3.582 9 8z" />
                                </svg>
                            </div>
                            {($role === 'admin' || $role === 'superAdmin') && currentUser && (
                                <button type="button" onClick={() => { setDeleteTarget({ id: item.id, imagen: item.imagen_url }); setDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700 ml-auto flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                    </svg>
                                    <span className="text-xs font-medium">Eliminar</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Componente de Carga (LoadingSkeleton)  ---
    const LoadingSkeleton = () => (
        <div className="p-4 border-b border-gray-100 animate-pulse">
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-8"></div>
                </div>
            </div>
        </div>
    );

    // --- Componente de Paginación ---
    const PaginationControls: React.FC = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-100 mt-4">
                {/* Botón Anterior */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 cursor-pointer rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </button>

                {/* Números de página */}
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`px-3 py-1 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${number === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                    >
                        {number}
                    </button>
                ))}

                {/* Botón Siguiente */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 cursor-pointer rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </button>
            </div>

        );
    };

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
            <div
                ref={listContainerRef}
                className='w-full max-w-lg bg-white border-x border-gray-100 shadow-sm'
            >
                {/* 0. Crear Comunicado */}
                {($role === 'admin' || $role === 'superAdmin') && currentUser && (
                    <div className="p-4 border-b">
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Crear nuevo comunicado</h3>
                            <button onClick={() => setIsCreateOpen(prev => !prev)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">{isCreateOpen ? 'Cerrar' : 'Nuevo'}</button>
                        </div>

                        {isCreateOpen && (
                            <form onSubmit={handleCreateComunicado} className="mt-3">
                                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} placeholder="Escribe el comunicado..." className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none" />

                                <div className="mt-2 flex items-center space-x-3">
                                    <label className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-sm cursor-pointer">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        <span className="text-xs text-gray-700">Adjuntar imagen</span>
                                    </label>

                                    {newImageFile && (
                                        <div className="flex items-center space-x-3">
                                            <div className="text-xs text-gray-500">{newImageFile.name}</div>
                                            <img src={URL.createObjectURL(newImageFile)} alt="preview" className="w-20 h-12 object-cover rounded-md border" />
                                        </div>
                                    )}

                                    <div className="ml-auto space-x-2">
                                        <button type="button" onClick={() => { setIsCreateOpen(false); setNewContent(''); setNewImageFile(null); }} className="px-3 py-1 text-sm bg-gray-200 rounded-md">Cancelar</button>
                                        <button type="submit" disabled={isCreating} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">{isCreating ? 'Creando...' : 'Crear'}</button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* 1. Carga (Skeleton) */}
                {loading && (
                    <>
                        <LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton />
                    </>
                )}

                {/* 2. Sin Datos */}
                {!loading && data.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay comunicados disponibles en este momento.
                    </div>
                )}

                {/* 3. Datos y Paginación */}
                {!loading && data.length > 0 && (
                    <div>
                        {/* Lista de Comunicados */}
                        {data.map((item) => (
                            <ComunicadoCard key={item.id} item={item} />
                        ))}

                        {/* Controles de Paginación */}
                        <PaginationControls />

                    </div>
                )}
            </div>
            {isModalOpen && comunicadoID && (
                <ComentariosModal
                    idComunicado={comunicadoID}
                    onClose={() => setIsModalOpen(false)}
                    currentUser={currentUser}
                />
            )}

            {/* Modal de confirmación para eliminar */}
            {deleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}></div>
                    <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                        <p className="text-sm text-gray-600 mb-4">¿Seguro que deseas eliminar este comunicado? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                            <button onClick={() => handleDeleteComunicado(deleteTarget.id, deleteTarget.imagen)} className="px-3 py-1 bg-red-600 text-white rounded">{loading ? 'Eliminando...' : 'Eliminar'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comunicados;