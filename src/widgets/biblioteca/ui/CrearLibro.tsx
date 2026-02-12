import { useEffect, useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookSchema } from "../validations/"; // Asegúrate de actualizar tu schema Zod
import type z from "zod";
import { MultiSelect } from "@shared/ui/react/MultiSelect";
import { guardarArchivo } from './GuardarArchivo';
import { supabase } from '@shared/api/lib/supabaseClient';

type FormData = z.infer<typeof createBookSchema>;

type Props = {
    reloadLibros: () => void;
};

export const CreateBook: FC<Props> = ({reloadLibros }) => {
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [options, setOptions] = useState<{ id: string | number; name: string }[]>([]);
    useEffect(() => {
        let mounted = true;
        const loadEtiquetas = async () => {
            try {
                const { data, error } = await supabase
                    .from('etiquetas')
                    .select('id, nombre');
                if (error) throw error;
                if (mounted && Array.isArray(data)) {
                    // Use tag name as id so the multi-select returns tag names (matches libro.etiquetas)
                    setOptions(data.map((e: any) => ({ id: e.nombre, name: e.nombre })));
                }
            } catch (err) {
                console.error('loadEtiquetas error:', err);
            }
        };
        loadEtiquetas();
        return () => {
            mounted = false;
        };
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        control,
    } = useForm<FormData>({
        // Nota: Asegúrate de que tu createBookSchema acepte archivos y el campo tags
        resolver: zodResolver(createBookSchema as any),
        defaultValues: {
            etiquetas: [], // Inicializa como array vacío
        },
    });

    // Observar el archivo para la preview
    const watchedFile = watch("archivo" as any) as unknown as FileList;

    useEffect(() => {
        const file = watchedFile?.[0];
        if (file) {
            const isImage = file.type.startsWith("image/");
            if (isImage) {
                const url = URL.createObjectURL(file);
                setPreview(url);
                return () => URL.revokeObjectURL(url);
            } else {
                setPreview("non-image"); // Para mostrar un icono de documento
            }
        } else {
            setPreview(null);
        }
    }, [watchedFile]);

    const onSubmit = async (data: any) => {
        try {
            const url_download = await guardarArchivo(watchedFile[0]);
            // Preparamos el payload
            const objeto = {}
            data.etiquetas.forEach((etiqueta, index) => {
                objeto[index] = etiqueta
            });
            console.log(objeto)

            const payload = {
                nombre: data.nombre,
                descripcion: data.descripcion,
                etiquetas: JSON.stringify(objeto),
                url_download: url_download.url,
            };

            const { data: responseData, error } = await supabase
                .from('libros')
                .insert([payload])
                .select();

            if (error) throw error;




            console.log("Enviando:", payload);

            // Aquí iría tu lógica de fetch/axios
            // await uploadFile(payload); 
            reloadLibros();
            setSuccessMsg("Archivo guardado exitosamente");
            setTags([]);
            setPreview(null);
            reset();
        } catch (error) {
            console.error("Error completo:", error);
        }

    };

    return (
        <section className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <header className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800">Subir Nuevo Recurso</h3>
                <p className="text-gray-500 text-sm">Completa los detalles del archivo a continuación.</p>
            </header>

            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">{successMsg}</div>}
            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{errorMsg}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo Nombre */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Archivo</label>
                    <input
                        {...register("nombre" as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ej: Manual de Usuario 2024"
                    />
                </div>

                {/* Campo Descripción */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                    <textarea
                        {...register("descripcion" as any)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        placeholder="Describe brevemente el contenido..."
                    />
                </div>

                {/* Campo Etiquetas (Tags) */}
                <div className="mt-4 z-10">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etiquetas
                    </label>
                    <MultiSelect
                        control={control}
                        name="etiquetas"
                        options={options}
                        placeholder="Buscar etiquetas..."
                    />
                    {errors.etiquetas && (
                        <p className="text-sm text-red-600 mt-1">
                            {(errors.etiquetas as any)?.message}
                        </p>
                    )}
                </div>

                {/* Campo Archivo con Preview */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Archivo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-sky-400 transition-colors bg-gray-50 relative">
                        <div className="space-y-1 text-center">
                            {preview ? (
                                <div className="flex flex-col items-center">
                                    {preview === "non-image" ? (
                                        <div className="p-4 bg-sky-100 rounded-lg">
                                            <span className="text-4xl">📄</span>
                                            <p className="text-xs mt-2 text-sky-800 font-mono truncate max-w-[150px]">
                                                {watchedFile[0]?.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-lg shadow-md" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setValue("archivo" as any, null); setPreview(null); }}
                                        className="mt-2 text-xs text-red-500 underline"
                                    >
                                        Quitar archivo
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none">
                                            <span>Subir un archivo</span>
                                            <input {...register("archivo" as any)} type="file" className="sr-only" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botón Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-md transition-all ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700 active:scale-95"
                            }`}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar Archivo"}
                    </button>
                </div>
            </form>
        </section>
    );
};