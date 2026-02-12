import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  name: string;
  description: string;
  image: FileList;
};

export const CreateDegreeModal: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const [preview, setPreview] = useState<string | null>(null);

  // observar cambios en el input file para mostrar preview
  const watchedImage = watch("image");

  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const file = watchedImage[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [watchedImage]);

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      // Ajusta la URL a tu endpoint real
      const res = await fetch("/api/majors", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al crear la carrera");
      }

      // éxito: resetear formulario
      reset();
      setPreview(null);
      // aquí podrías cerrar modal o emitir evento
      alert("Carrera creada correctamente");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al crear la carrera");
    }
  };

  return (
    <article className="max-w-4xl bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Crear nueva carrera / especialidad
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            {...register("name", {
              required: "El nombre es obligatorio",
              maxLength: { value: 120, message: "Máx 120 caracteres" },
            })}
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            placeholder="Nombre de la carrera"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            {...register("description", {
              required: "La descripción es obligatoria",
              maxLength: { value: 2000, message: "Máx 2000 caracteres" },
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            placeholder="Descripción breve de la carrera"
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen (opcional)
          </label>
          <input
            {...register("image")}
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-700"
          />
          {preview && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover rounded border"
              />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-full bg-[#0A5C8D] text-white hover:bg-[#084a6b] transition disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear carrera"}
          </button>

          <button
            type="button"
            onClick={() => {
              reset();
              setPreview(null);
            }}
            className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
        </div>
      </form>
    </article>
  );
};
