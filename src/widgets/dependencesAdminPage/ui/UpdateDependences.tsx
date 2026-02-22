import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { updateDependencesSchema } from "../validations/";
import type { DependenceTable } from "../types";
import {
  dependenceCodeExists,
  dependenceNameExists,
  updateDependence,
} from "../api";

type FormData = z.infer<typeof updateDependencesSchema>; // para tipado
type Props = {
  initialData: DependenceTable;
  onSuccess: (data: DependenceTable) => void;
  schools: { id: string; nombre: string }[]; // cambiar esto  por un tipo propio
  degrees: { id: string; nombre: string }[]; // cambiar esto  por un tipo propio
  staff: { id: string; nombre: string }[]; // cambiar esto  por un tipo propio
};

export const UpdateDependences: React.FC<Props> = ({
  onSuccess,
  schools,
  degrees,
  staff,
  initialData,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(updateDependencesSchema as any),
    defaultValues: {
      nombre: initialData.nombre,
      vision: initialData.vision,
      mision: initialData.mision,
      objetivos: initialData.objetivos,
      descripcion: initialData.descripcion,
      coordinador: initialData.id_coordinador,
      carrera: initialData.id_carrera,
      escuela: initialData.id_escuela,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // verificar unicidad del codigo en el submit
      if (data.codigo) {
        clearErrors("codigo");

        const existsCode = await dependenceCodeExists(
          data.codigo,
          initialData.id,
        );
        if (existsCode) {
          setError("codigo", {
            type: "manual",
            message: "Ya existe una dependencia con ese codigo",
          });
          return;
        }
      }
      // verificar unicidad del nombre en el submit

      clearErrors("nombre");

      const existsCode = await dependenceNameExists(
        data.nombre,
        initialData.id,
      );
      if (existsCode) {
        setError("nombre", {
          type: "manual",
          message: "Ya existe una dependencia con ese nombre",
        });
        return;
      }
      const dependenceData = await updateDependence(
        {
          codigo: data.codigo,
          nombre: data.nombre,
          vision: data.vision,
          mision: data.mision,
          objetivos: data.objetivos,
          descripcion: data.descripcion,
          id_coordinador: data.coordinador,
          id_carrera: data.carrera ? data.carrera : null,
          id_escuela: data.escuela ? data.escuela : null,
        },
        initialData.id,
      );

      onSuccess({
        codigo: dependenceData.codigo,
        carrera: degrees.find((item) => item.id === data.carrera)?.nombre || "",
        coordinador:
          staff.find((item) => item.id === data.coordinador)?.nombre || "",
        descripcion: data.descripcion,
        escuela: schools.find((item) => item.id === data.escuela)?.nombre || "",
        id: dependenceData.id,
        id_carrera: data.carrera,
        id_coordinador: data.coordinador,
        id_escuela: data.escuela,
        mision: data.mision,
        nombre: data.nombre,
        objetivos: data.objetivos,
        vision: data.vision,
      });

      setSuccessMsg("Dependencia actualizada correctamente");
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al actualizar la dependencia");
    }
  };
  return (
    <section className="  p-6 bg-white rounded-lg w-[clamp(300px,calc(100vw-77px),672px)]">
      <header className="mb-4">
        <h3 className="text-lg font-semibold">Actualizar Dependencia</h3>
        <p className="text-sm text-gray-600 mt-1">
          Rellena los datos de la Dependencia
        </p>
      </header>

      {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}
      {successMsg && <p className="text-green-600 mb-3">{successMsg}</p>}
      <form
        onSubmit={handleRegisterSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2 md:col-span-2 ">
            <label className="block text-sm font-medium text-gray-700">
              Código
            </label>
            <input
              {...registerRegister("codigo")}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Código"
            />
            {errors.codigo && (
              <p className="text-sm text-red-600 mt-1">
                {errors.codigo.message}
              </p>
            )}
          </div>

          <div className="mb-2 md:col-span-2 ">
            <label className="block text-sm font-medium text-gray-700">
              Nombre{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              {...registerRegister("nombre")}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <textarea
              {...registerRegister("descripcion")}
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
              Mision{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <textarea
              {...registerRegister("mision")}
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
              Vision{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <textarea
              {...registerRegister("vision")}
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
              Objetivos{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <textarea
              {...registerRegister("objetivos")}
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Escuela
          </label>
          <select
            {...registerRegister("escuela")}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">--Seleccionar escuela asociada--</option>
            {schools.map((opt) => (
              <option key={opt.nombre} value={opt.id}>
                {opt.nombre}
              </option>
            ))}
          </select>
          {errors && errors.escuela && (
            <p className="text-sm text-red-600 mt-1">
              {errors.escuela.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Carrera
          </label>
          <select
            {...registerRegister("carrera")}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">--Seleccionar carrera asociada--</option>
            {degrees.map((opt) => (
              <option key={opt.nombre} value={opt.id}>
                {opt.nombre}
              </option>
            ))}
          </select>
          {errors && errors.carrera && (
            <p className="text-sm text-red-600 mt-1">
              {errors.carrera.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Encargado{" "}
            <span className="text-red-600 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </label>
          <select
            {...registerRegister("coordinador")}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">--Seleccionar encargado asociado--</option>
            {staff.map((opt, index) => (
              <option key={index} value={opt.id}>
                {opt.nombre}
              </option>
            ))}
          </select>
          {errors && errors.coordinador && (
            <p className="text-sm text-red-600 mt-1">
              {errors.coordinador.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0A5C8D] hover:scale-105 text-white font-medium rounded-md transition-transform"
          >
            {isSubmitting ? "Cargando..." : "Actualizar Dependencia"}
          </button>
        </div>
      </form>
    </section>
  );
};
