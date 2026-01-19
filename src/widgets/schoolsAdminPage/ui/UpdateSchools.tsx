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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updateSchoolsSchema as any),
    defaultValues: {
      nombre: initialData.nombre,
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
    <section className="max-w-2xl p-6 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Actualizar Escuela</h3>

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
            Actualizar Escuela
          </button>
        </div>
      </form>
    </section>
  );
};
