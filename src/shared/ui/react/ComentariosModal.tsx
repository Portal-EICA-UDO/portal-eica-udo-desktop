import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@shared/api';
import { X } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import type { User, ComentarioPadre, ComentarioHijo, ComentarioCardProps, ComentariosModalProps } from '@shared/type/type';
import { useStore } from '@nanostores/react';
import { role } from '@features/auth/nanostore';


const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
        day: '2-digit', month: '2-digit', year: 'numeric',
    }) + ' ' + new Date(timestamp).toLocaleTimeString("es-ES", {
        hour: '2-digit', minute: '2-digit'
    });
};

const ComentarioCard: React.FC<ComentarioCardProps> = ({ comment, currentUser, onAddChild, onDelete }) => {
    const userName = (comment.user?.full_name || 'Usuario Anónimo');
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replies, setReplies] = useState<ComentarioHijo[]>(comment.children || []);
    const [replyContent, setReplyContent] = useState('');
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);

    const $role = useStore(role);
    

    useEffect(() => {
        setReplies(comment.children || []);
    }, [comment.children]);

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || isReplySubmitting) return;
        setIsReplySubmitting(true);
        try {
            if (!currentUser?.id) {
                setIsReplySubmitting(false);
                return;
            }

            const newReply = {
                id_comentario: comment.id,
                contenido: replyContent.trim(),
                id_user: currentUser.id,
            };

            const { data, error } = await supabase
                .from('comentarios_hijos')
                .insert([newReply])
                .select(`
                    *,
                    user:roles!id_user (id, full_name)
                `)
                .single();

            if (error) throw error;

            const added = data as ComentarioHijo;
            setReplies(prev => [...prev, added]);
            setReplyContent('');
            setShowReplies(true);
            setShowReplyForm(false);
            onAddChild?.(comment.id, added);
        } catch (err) {
            console.error('Error posting reply:', err);
            alert('Error al enviar la respuesta.');
        } finally {
            setIsReplySubmitting(false);
        }
    };

    return (
        <div className={`flex space-x-3 p-3 transition duration-150 border-b border-gray-100`}>
            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
                {userInitials}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm text-gray-800">{userName}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(comment.created_at)}</span>
                </div>

                <p className="text-sm text-gray-700 mt-1 wrap-break-word whitespace-pre-wrap">{comment.contenido}</p>

                <div className='mt-2 flex items-center space-x-4'>
                    {replies.length > 0 && (
                        <button onClick={() => setShowReplies(prev => !prev)} className='flex items-center text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors cursor-pointer'>
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {replies.length > 0 ? `Ver ${replies.length} respuesta${replies.length > 1 ? 's' : ''}` : 'Ver respuestas'}
                        </button>
                    )}

                    {$role !== 'unauthenticated' && $role !== 'vacio' && (
                        <button onClick={() => { setShowReplyForm(prev => !prev); setShowReplies(true); }} className='text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer'>
                            Responder
                        </button>
                    )}

                    {($role === 'admin' || $role === 'superAdmin') && (
                        <button onClick={() => onDelete?.(comment.id, false)} className="text-xs text-red-600 hover:text-red-700 cursor-pointer">Eliminar</button>
                    )}
                </div>

                {showReplyForm && (
                    <form onSubmit={handleSubmitReply} className="mt-2">
                        <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={2} placeholder="Escribe tu respuesta..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm resize-none" />
                        <div className="mt-2 flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowReplyForm(false)} className="px-3 py-1 text-xs bg-gray-200 rounded-md cursor-pointer">Cancelar</button>
                            <button type="submit" disabled={isReplySubmitting || !replyContent.trim()} className="cursor-pointer px-3 py-1 text-xs bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">{isReplySubmitting ? 'Enviando...' : 'Responder'}</button>
                        </div>
                    </form>
                )}

                {showReplies && replies.length > 0 && (
                    <div className="mt-3 ml-9 space-y-2">
                        {replies.map(r => {
                            const replyName = (r.user?.full_name || 'Usuario Anónimo');
                            const replyInitials = replyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            return (
                                <div key={r.id} className="flex space-x-3 p-2 bg-gray-50 rounded-md">
                                    <div className="shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                                        {replyInitials}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs font-medium text-gray-800">{replyName}</span>
                                            <span className="text-xs text-gray-500 ml-2">{formatDateTime(r.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.contenido}</p>
                                        {($role === 'admin' || $role === 'superAdmin') && (
                                            <div className="mt-2">
                                                <button onClick={() => onDelete?.(r.id, true)} className="text-xs text-red-600 hover:text-red-700 cursor-pointer">Eliminar</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );

};










// --- 2. Componente Principal del Modal ---

const ComentariosModal: React.FC<ComentariosModalProps> = ({ idComunicado, onClose, currentUser }) => {
    const [comentariosPadres, setComentariosPadres] = useState<ComentarioPadre[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Estados para confirmación de borrado
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; isChild: boolean } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Acceder al rol del usuario con nanostores dentro del componente (hooks sólo en componentes)
    const $role = useStore(role);



    // --- 3. Lógica de Carga de Comentarios Padres ---

    const fetchComentariosPadres = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('comentarios')
                .select(`
                    *,
                    user:roles!id_user (id, full_name)
                `)
                .eq('id_comunicado', idComunicado)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const initialComments: ComentarioPadre[] = data.map((c: any) => ({
                ...c,
                user: c.user,
            }));

            // Obtener todas las respuestas (comentarios_hijos) para estos comentarios en una sola petición
            const parentIds = initialComments.map(c => c.id);
            if (parentIds.length > 0) {
                const { data: childData, error: childError } = await supabase
                    .from('comentarios_hijos')
                    .select(`
                        *,
                        user:roles!id_user (id, full_name)
                    `)
                    .in('id_comentario', parentIds)
                    .order('created_at', { ascending: true });

                if (childError) throw childError;

                const childrenByParent: Record<string, ComentarioHijo[]> = {};
                (childData || []).forEach((ch: any) => {
                    const parentId = ch.id_comentario;
                    if (!childrenByParent[parentId]) childrenByParent[parentId] = [];
                    childrenByParent[parentId].push(ch);
                });

                const commentsWithChildren: ComentarioPadre[] = initialComments.map(c => ({
                    ...c,
                    children: childrenByParent[c.id] || [],
                }));

                setComentariosPadres(commentsWithChildren);
            } else {
                setComentariosPadres(initialComments);
            }

            setLoading(false);
        } catch (e) {
            console.error('Error fetching comments:', e);
            setLoading(false);
        }
    }, [idComunicado]);

    // Eliminar comentario (hijo o padre)
    const performDelete = async (id: string, isChild: boolean) => {
        try {
            setIsDeleting(true);

            if (isChild) {
                const { data, error } = await supabase.from('comentarios_hijos').delete().eq('id', id).select();
                console.log('delete child response', { data, error });
                if (error) throw error;

                // actualizar UI: remover hijo del padre correspondiente
                setComentariosPadres(prev => prev.map(p => ({
                    ...p,
                    children: (p.children || []).filter(c => c.id !== id)
                })));
            } else {
                // eliminar posibles hijos primero
                const { data: removedChildren, error: childErr } = await supabase.from('comentarios_hijos').delete().eq('id_comentario', id).select();
                console.log('deleted children', { removedChildren, childErr });
                if (childErr) throw childErr;

                // luego eliminar el padre
                const { data, error } = await supabase.from('comentarios').delete().eq('id', id).select();
                console.log('delete parent response', { data, error });
                if (error) throw error;

                // actualizar UI: remover padre
                setComentariosPadres(prev => prev.filter(p => p.id !== id));
            }

            setDeleteModalOpen(false);
            setDeleteTarget(null);
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert('Error al eliminar el comentario. Revisa la consola.');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Lógica para Cargar Conteo de Respuestas ---
    // No hay lógica de comentarios hijos en esta versión

    // --- 5. Lógica de Envío de Nuevo Comentario ---

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentContent.trim() || isSubmitting) return;

        if (!currentUser?.id) {
            return;
        }

        setIsSubmitting(true);
        try {
            const newComment = {
                id_comunicado: idComunicado,
                contenido: newCommentContent.trim(),
                id_user: currentUser.id,
            };
            console.log('Submitting new comment:', newComment);
            const { data, error } = await supabase
                .from('comentarios')
                .insert([newComment])
                .select(`
                    *,
                    user:roles!id_user (id, full_name)
                `)
                .single();

            if (error) throw error;

            setComentariosPadres(prev => [...prev, data as ComentarioPadre]);
            setNewCommentContent('');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Error al enviar el comentario.');
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Ejecutar Carga Inicial ---
    useEffect(() => {
        fetchComentariosPadres();
    }, [fetchComentariosPadres]);


    // --- Renderizado del Modal ---

    return (
        // Fondo 
        <div className="fixed inset-0 bg-[#d1d1d654] bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Contenedor del Modal */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                {/* Cabecera */}
                <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Comentarios</h2>
                    <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Lista de Comentarios (Scrollable) */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {loading && (
                        <div className="p-4 text-center text-gray-500">Cargando comentarios...</div>
                    )}

                    {!loading && comentariosPadres.length === 0 && (
                        <div className="p-4 text-center text-gray-500">Sé el primero en comentar.</div>
                    )}

                    {!loading && comentariosPadres.map(comment => (
                        <ComentarioCard
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser}
                            onAddChild={(parentId, child) => setComentariosPadres(prev => prev.map(p => p.id === parentId ? { ...p, children: [...(p.children || []), child] } : p))}
                            onDelete={(id, isChild) => { setDeleteTarget({ id, isChild: !!isChild }); setDeleteModalOpen(true); }}
                        />
                    ))}
                </div>

                {/* Formulario de Nuevo Comentario */}
                {$role !== 'unauthenticated' && (
                    <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
                        <form onSubmit={handleSubmitComment} className="flex space-x-3 items-end">

                            {/* Avatar del usuario actual */}
                            <div className="shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                                {(currentUser?.full_name || 'Usuario').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>

                            <div className="flex-1">
                                <textarea
                                    value={newCommentContent}
                                    onChange={(e) => setNewCommentContent(e.target.value)}
                                    rows={2}
                                    placeholder="Escribe tu comentario..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                />
                            </div>

                            <div className="shrink-0 flex space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newCommentContent.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                                </button>

                            </div>
                        </form>
                    </div>
                )}
        
                    {/* Modal de confirmación de eliminación */}
                    {deleteModalOpen && deleteTarget && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}></div>
                            <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                                <p className="text-sm text-gray-600 mb-4">¿Seguro que deseas eliminar este comentario? Esta acción no se puede deshacer.</p>
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }} className="px-3 py-1 bg-gray-200 rounded cursor-pointer">Cancelar</button>
                                    <button onClick={() => performDelete(deleteTarget.id, deleteTarget.isChild)} disabled={isDeleting} className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer">{isDeleting ? 'Eliminando...' : 'Eliminar'}</button>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default ComentariosModal;

