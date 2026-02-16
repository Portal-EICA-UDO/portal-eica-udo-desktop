// ...existing code...
import { useEffect, useMemo, useState, useRef, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDegreesSchema } from "../validations/index";
import type z from "zod";
import {
  createDegree,
  getEscuelas,
  guardarArchivo,
  uploadDegreeImage,
  degreeNameExists,
  degreeCodeExists,
} from "../api";
import type { DegreeTable, Escuela } from "../types";
import { file } from "zod";

type FormData = z.infer<ReturnType<typeof createDegreesSchema>>; // para tipado

type Props = {
  onSuccess: (data: DegreeTable) => void;
};

export const CreateDegrees: FC<Props> = ({ onSuccess }) => {
  const [opciones, setOpciones] = useState<Escuela[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getEscuelas();
        if (!mounted) return;

        setOpciones(data || []);
      } catch (err) {
        console.error(err);
        setOpciones([]);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();
    console.log("opciones: ", opciones);
    return () => {
      mounted = false;
    };
  }, []);

  // Crear schema dinámicamente cuando tengamos opciones
  const schema = useMemo(() => createDegreesSchema(opciones), [opciones]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const url = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(url);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const imageRegister = register("imagen_url");

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onSubmit = async (data: FormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    console.log(
      "data: ",
      data,
      watchedFile.item(0)?.name,
      watchedFile,
      imageFile,
    );
    try {
      // verificar unicidad del nombre en el submit
      clearErrors("nombre");
      const exists = await degreeNameExists(data.nombre);
      if (exists) {
        setError("nombre", {
          type: "manual",
          message: "Ya existe una carrera con ese nombre",
        });
        return;
      }
      // verificar unicidad del codigo en el submit
      clearErrors("codigo");
      const existsCode = await degreeCodeExists(data.codigo);
      if (existsCode) {
        setError("codigo", {
          type: "manual",
          message: "Ya existe una carrera con ese codigo",
        });
        return;
      }

      const fileResponse = await guardarArchivo(watchedFile[0]);
      await uploadDegreeImage(imageFile as any);
      const degreeData = await createDegree({
        nombre: data.nombre,
        descripcion: data.descripcion,
        imagen_url: imageFile?.name ?? "",
        id_escuela: data.escuela,
        codigo: data.codigo,
        nombre_horario: watchedFile[0]?.name,
        horario_url: (fileResponse as any).url,
      });

      onSuccess({
        id: degreeData.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        imagen_url: data.imagen_url.name,
        escuela:
          opciones.find((option) => option.id === data.escuela)?.nombre || "",
        escuela_id: data.escuela,
        codigo: data.codigo,
        horario_url: (fileResponse as any).url,
        nombre_horario: watchedFile[0]?.name,
      });
      // console.log({
      //   id: "fds",
      //   nombre: data.nombre,
      //   descripcion: data.descripcion,
      //   imagen_url: data.imagen_url.name,
      //   escuela:
      //     opciones.find((option) => option.id === data.escuela)?.nombre || "",
      //   escuela_id: data.escuela,
      //   codigo: data.codigo,
      //   horario_url: watchedFile[0]?.name,
      //   nombre_horario: watchedFile[0]?.name,
      // });

      setSuccessMsg("Carrera creada correctamente");
      setErrorMsg(null);
      //resetear el formulario
      removeImage();
      setImagePreview(null);
      setImageFile(null);
      setPreview(null);

      reset();
    } catch (err: any) {
      setSuccessMsg(null);
      setErrorMsg("Error al crear la carrera");
      console.error(err);
    }
  };

  if (loadingOptions) return <div>Cargando opciones...</div>;

  return (
    <section className="max-w-2xl p-6 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Crear Carrera</h3>
      {successMsg && <p className="text-green-600">{successMsg}</p>}
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Codigo
          </label>
          <input
            {...register("codigo")}
            type="text"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            placeholder="Codigo de la carrera"
          />
          {errors.codigo && (
            <p className="text-sm text-red-600 mt-1">
              {(errors as any).codigo.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            {...register("nombre")}
            type="text"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            placeholder="Nombre de la carrera"
          />
          {errors.nombre && (
            <p className="text-sm text-red-600 mt-1">
              {(errors as any).nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            {...register("descripcion")}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            rows={4}
            placeholder="Descripción breve"
          />
          {errors && errors.descripcion && (
            <p className="text-sm text-red-600 mt-1">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Escuela
          </label>
          <select
            {...register("escuela")}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">-- Seleccionar --</option>
            {opciones.map((opt) => (
              <option key={opt.nombre} value={opt.id}>
                {opt.nombre}
              </option>
            ))}
          </select>
          {errors && (errors as any).escuela && (
            <p className="text-sm text-red-600 mt-1">
              {errors.escuela?.message}
            </p>
          )}
        </div>

        {/* Input para imagen con vista previa */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen
          </label>
          <div className="flex items-start gap-4">
            <div
              className="w-36 h-36 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-36 h-36 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-white rounded-full px-2 py-0.5 text-sm shadow"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 px-2">
                  <p>Arrastra o selecciona una imagen</p>
                  <p className="mt-2 text-xs text-gray-400">JPG, PNG</p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Sube una foto del staff para mostrar en el directorio.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
                >
                  Seleccionar imagen
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
          <input
            // otros props que RHF pueda incluir (p. ej. name) - colocados primero
            {...(imageRegister as any)}
            // combinamos el ref del input (para trigger desde UI) y el ref que devuelve RHF
            ref={(el) => {
              fileInputRef.current = el;
              // @ts-ignore -- el tipo de ref viene dentro de imageRegister
              if (imageRegister && typeof imageRegister.ref === "function")
                imageRegister.ref(el);
            }}
            type="file"
            accept="image/*"
            // llamamos tanto al onChange de RHF como al manejador local para preview
            onChange={(e) => {
              // llamar al onChange que RHF pudo haber pasado en el spread
              try {
                (imageRegister as any).onChange?.(e as any);
              } catch (err) {
                /* ignore */
              }
              handleImageChange(e);
            }}
            className="sr-only"
          />
        </div>
        {/* Campo Archivo con Preview */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Horario de clases (Seleccionar Archivo)
          </label>
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
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg shadow-md"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                    }}
                    className="mt-2 text-xs text-red-500 underline"
                  >
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none">
                      <span>Subir un archivo</span>
                      <input
                        {...register("archivo" as any)}
                        type="file"
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF hasta 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-sky-700 text-white"
          >
            {isSubmitting ? "Cargando..." : "Crear carrera"}
          </button>
        </div>
      </form>
    </section>
  );
};
// ...existing code...
