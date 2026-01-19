import type z from "zod";
import { createSchoolsSchema } from "../validations/";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import type { SchoolTable } from "../types";
import { createSchool } from "../api";

type FormData = z.infer<typeof createSchoolsSchema>; // para tipado
type Props = {
  onSuccess: (data: SchoolTable) => void;
};

export const CreateSchools: React.FC<Props> = ({ onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createSchoolsSchema as any),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const schoolData = await createSchool(data.nombre);
      console.log(schoolData);
      onSuccess(schoolData);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <section className="max-w-2xl p-6 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Crear Escuela</h3>

      {errorMsg && <p className="text-red-600">{errorMsg}</p>}
      <form onSubmit={handleUpdateSubmit(onSubmit)}>
        <div>
          <label>Nombre</label>
          <input
            {...registerUpdate("nombre")}
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Nombre de la carrera"
          />
          {errors.nombre && <span>{errors.nombre.message}</span>}
        </div>
        <div className="flex mt-0.5">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-sky-700 text-white"
          >
            Crear Escuela
          </button>
        </div>
      </form>
    </section>
  );
};
