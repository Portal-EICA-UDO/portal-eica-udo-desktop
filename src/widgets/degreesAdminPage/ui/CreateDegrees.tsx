// ...existing code...
import { useEffect, useMemo, useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDegreesSchema } from "../validations/index";
import type z from "zod";
import { createDegree, getEscuelas, uploadDegreeImage } from "../api";
import type { Data, Escuela } from "../types";

type FormData = z.infer<ReturnType<typeof createDegreesSchema>>; // para tipado

type Props = {
  onSuccess: (data: Data) => void;
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
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  // preview de imagen
  const watchedFile = watch("imagen_url") as any as FileList;

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    console.log("esta pasando");
    const file = watchedFile?.[0];
    console.log(file);
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [watchedFile]);

  const onSubmit = async (data: FormData) => {
    console.log("data: ", data);
    try {
      const degreeData = await createDegree({
        nombre: data.nombre,
        descripcion: data.descripcion,
        imagen_url: data.imagen_url.name,
        id_escuela: data.escuela,
      });

      await uploadDegreeImage(data.imagen_url);

      onSuccess({
        id: degreeData.id,
        nombre: degreeData.nombre,
        descripcion: degreeData.descripcion,
        imagen_url: degreeData.imagen_url,
        escuela:
          opciones.find((option) => option.id === data.escuela)?.nombre || "",
        escuela_id: data.escuela,
      });

      setSuccessMsg("Carrera creada correctamente");
      setErrorMsg(null);
      //resetear el formulario
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
            Crear carrera
          </button>
        </div>
      </form>
    </section>
  );
};
// ...existing code...
