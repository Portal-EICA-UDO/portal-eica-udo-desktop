import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDegreesSchema } from "../validations/index";
import type z from "zod";
import { getImageUrl } from "@shared/lib";
import type { Escuela, TableProps } from "../types";
import {
  guardarArchivo,
  updateDegree,
  updateDegreeFile,
  updateDegreeImage,
} from "../api";
import { file } from "zod";

type FormData = z.infer<ReturnType<typeof updateDegreesSchema>>; // para tipado

type props = {
  onSubmitProp: (props: TableProps) => void;
  initialData: TableProps;
  schools: Escuela[];
};

export const UpdateDegrees: React.FC<props> = ({
  onSubmitProp,
  initialData,
  schools,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Crear schema dinámicamente cuando tengamos opciones
  const schema = useMemo(() => updateDegreesSchema(schools), [schools]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      nombre: initialData.nombre,
      descripcion: initialData.descripcion,
      imagen_url: undefined,
      escuela: initialData.escuela_id,
      codigo: initialData.codigo,
    },
  });
  // estados para la gestion de la imagen
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // estados para la gestion del horario
  const [preview, setPreview] = useState<string | null>(null);
  // Observar el archivo para la preview
  const watchedFile = watch("archivo" as any) as unknown as FileList;

  useEffect(() => {
    const file = watchedFile?.[0];
    console.log("file: ", file);
    console.log("initialData: ", initialData);
    if (file) {
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPreview("non-image"); // Para mostrar un icono de documento
      }
    } else if (initialData.nombre_horario) {
      setPreview("non-image");
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

  // Registrar el campo de imagen con react-hook-form
  const imageRegister = register("imagen_url");

  useEffect(() => {
    // Si se seleccionó un archivo nuevo, crear object URL y limpiarlo al desmontar
    if (imageFile instanceof File) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }

    // Si no hay archivo nuevo, usar la imagen existente del servidor (si la hay)
    if (initialData && initialData.imagen_url) {
      setImagePreview(getImageUrl("carreras-imagenes", initialData.imagen_url));
      console.log(getImageUrl("carreras-imagenes", initialData.imagen_url));
    } else {
      setImagePreview(null);
    }

    return undefined;
  }, [imageFile]);

  const onSubmit = async (data: FormData) => {
    console.log("data: ", data);
    let fileResponse = null;
    try {
      if (!!data.imagen_url) {
        await updateDegreeImage(imageFile as any);
      }

      if (watchedFile[0]) {
        fileResponse = await updateDegreeFile(
          watchedFile[0],
          initialData.horario_url,
        );
      } else {
        // await updateDegree(
        //   {
        //     nombre: data.nombre,
        //     descripcion: data.descripcion,
        //     id_escuela: data.escuela,
        //   },
        //   initialData.id,
        // );
      }
      await updateDegree(
        {
          nombre: data.nombre,
          descripcion: data.descripcion,
          imagen_url: data.imagen_url
            ? data.imagen_url.name
            : initialData.imagen_url,
          id_escuela: data.escuela,
          codigo: data.codigo,
          nombre_horario: watchedFile[0]
            ? watchedFile[0].name
            : initialData.nombre_horario,
          horario_url: watchedFile[0]
            ? (fileResponse as any).url
            : initialData.horario_url,
        },
        initialData.id,
      );

      onSubmitProp({
        id: initialData.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        escuela: schools.find((op) => op.id === data.escuela)?.nombre as string,
        imagen_url: data.imagen_url
          ? data.imagen_url.name
          : initialData.imagen_url,
        escuela_id: data.escuela,
        codigo: data.codigo,
        horario_url: (watchedFile[0] as any)?.name || initialData.horario_url,
        nombre_horario:
          (watchedFile[0] as any)?.name || initialData.nombre_horario,
      });
      // console.log({
      //   id: initialData.id,
      //   nombre: data.nombre,
      //   descripcion: data.descripcion,
      //   escuela: schools.find((op) => op.id === data.escuela)?.nombre as string,
      //   imagen_url: (data.imagen_url as any)?.nombre || initialData.imagen_url,
      //   escuela_id: data.escuela,
      //   codigo: data.codigo,
      //   horario_url: (watchedFile[0] as any)?.name || initialData.horario_url,
      //   nombre_horario:
      //     (watchedFile[0] as any)?.name || initialData.nombre_horario,
      // });
      setSuccessMsg("Carrera creada correctamente");
    } catch (err: any) {
      setSuccessMsg(null);
      setErrorMsg(err.message);
      console.error(err);
    }
  };

  return (
    <section className="max-w-2xl p-6 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Actualizar Carrera</h3>
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
            placeholder="Nombre de la carrera"
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
            {schools.map((opt) => (
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
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 px-2">
                  <p>Arrastra o selecciona una imagen</p>
                  <p className="mt-2 text-xs text-gray-400">
                    JPG, PNG · max 2MB
                  </p>
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
          {errors.imagen_url && (
            <p className="text-sm text-red-600 mt-1">
              {errors.imagen_url.message}
            </p>
          )}
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
                        {watchedFile[0]?.name || initialData.nombre_horario}
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
            {isSubmitting ? "Actualizando..." : "Actualizar carrera"}
          </button>
        </div>
      </form>
    </section>
  );
};
