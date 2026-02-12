import type z from "zod";
import { updateSchoolsSchema } from "../validations/updateShoolsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, type FC } from "react";
import type { SchoolTable } from "../types";
import { updateSchool } from "../api";

type FormData = z.infer<typeof updateSchoolsSchema>; // para tipado

type Props = {
  initialData: SchoolTable;
  onSuccess: (data: SchoolTable) => void;
};

export const UpdateSchools: React.FC<Props> = ({ initialData, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(updateSchoolsSchema as any),
    defaultValues: {
      nombre: initialData.nombre,
      descripcion: initialData.descripcion,
      codigo: initialData.codigo,
      objetivos: initialData.objetivos,
      mision: initialData.mision,
      vision: initialData.vision,
    },
  });

  const onSubmit = (data: FormData) => {
    try {
      const schoolData = updateSchool(initialData.id, data);
      console.log(data);
      onSuccess({
        ...initialData,
        ...data,
      });
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al actualizar la escuela");
    }
  };
  return (
    <section className="  p-6 bg-white rounded-lg w-[clamp(300px,calc(100vw-77px),672px)]">
      <header className="mb-4">
        <h3 className="text-lg font-semibold">Actualizar Escuela</h3>
        <p className="text-sm text-gray-600 mt-1">
          Rellena los datos de la Escuela
        </p>
      </header>

      {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}

      <form onSubmit={handleUpdateSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2 md:col-span-2 ">
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              {...registerUpdate("nombre")}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Nombre"
            />
            {errors.nombre && (
              <p className="text-sm text-red-600 mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>
          <div className="mb-2 md:col-span-2 ">
            <label className="block text-sm font-medium text-gray-700">
              Codigo
            </label>
            <input
              {...registerUpdate("codigo")}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Codigo"
            />
            {errors.codigo && (
              <p className="text-sm text-red-600 mt-1">
                {errors.codigo.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              {...registerUpdate("descripcion")}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              rows={4}
              placeholder="Descripción"
            />
            {errors && errors.descripcion && (
              <p className="text-sm text-red-600 mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mision
            </label>
            <textarea
              {...registerUpdate("mision")}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              rows={4}
              placeholder="Mision"
            />
            {errors && errors.mision && (
              <p className="text-sm text-red-600 mt-1">
                {errors.mision.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vision
            </label>
            <textarea
              {...registerUpdate("vision")}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              rows={4}
              placeholder="Descripción breve"
            />
            {errors && errors.vision && (
              <p className="text-sm text-red-600 mt-1">
                {errors.vision.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Objetivos
            </label>
            <textarea
              {...registerUpdate("objetivos")}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              rows={4}
              placeholder="Descripción breve"
            />
            {errors && errors.objetivos && (
              <p className="text-sm text-red-600 mt-1">
                {errors.objetivos.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0A5C8D] hover:scale-105  transition-transform  text-white font-medium rounded-md"
          >
            {isSubmitting ? "Actualizando..." : "actualizar Escuela"}
          </button>
        </div>
      </form>
    </section>
  );
};
