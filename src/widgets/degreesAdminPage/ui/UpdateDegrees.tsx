import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDegreesSchema } from "../validations/index";
import type z from "zod";
import { getImageUrl } from "@shared/lib";
import type { Escuela, TableProps } from "../types";
import { updateDegree, updateDegreeImage } from "../api";

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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      nombre: initialData.nombre,
      descripcion: initialData.descripcion,
      imagen_url: undefined,
      escuela: initialData.escuela_id,
    },
  });

  // preview de imagen
  const watchedFile = watch("imagen_url") as any as FileList;
  const initialImage = initialData.imagen_url;

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const file = watchedFile?.[0];

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (initialImage) {
      return setPreview(getImageUrl("carreras-imagenes", initialImage));
    }

    setPreview(null);
  }, [watchedFile]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!!data.imagen_url) {
        await updateDegreeImage(data.imagen_url);

        await updateDegree(
          {
            nombre: data.nombre,
            descripcion: data.descripcion,
            imagen_url: data.imagen_url.name,
            id_escuela: data.escuela,
          },
          initialData.id,
        );
      } else {
        await updateDegree(
          {
            nombre: data.nombre,
            descripcion: data.descripcion,
            id_escuela: data.escuela,
          },
          initialData.id,
        );
      }

      onSubmitProp({
        id: initialData.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        escuela: schools.find((op) => op.id === data.escuela)?.nombre as string,
        imagen_url: (data.imagen_url as any)?.nombre || initialData.imagen_url,
        escuela_id: data.escuela,
      });
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
            Nombre
          </label>
          <input
            {...register("nombre")}
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2"
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
            className="mt-1 block w-full border rounded px-3 py-2"
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
            className="mt-1 block w-full border rounded px-3 py-2"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen
          </label>
          <input
            {...register("imagen_url")}
            type="file"
            accept="image/*"
            className="mt-1 block w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
          {errors && errors.imagen_url && (
            <p className="text-sm text-red-600 mt-1">
              {(errors.imagen_url as any)?.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-sky-700 text-white"
          >
            Actualizar carrera
          </button>
        </div>
      </form>
    </section>
  );
};
