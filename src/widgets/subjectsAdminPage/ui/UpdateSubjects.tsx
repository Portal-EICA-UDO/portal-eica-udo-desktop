import { useEffect, useMemo, useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSubjectsSchema } from "../validations/index";
import type z from "zod";
import { updateSubject } from "../api";
import type { Degree, DegreesBySchool, SubjectTable } from "../types";

type FormData = z.infer<ReturnType<typeof updateSubjectsSchema>>;

type Props = {
  onSuccess: (data: any) => void;
  degreesBySchool: DegreesBySchool;
  initialData: SubjectTable;
};

export const UpdateSubjects: FC<Props> = ({
  onSuccess,
  degreesBySchool,
  initialData,
}) => {
  const [degreeOptions, setDegreeOptions] = useState<Degree[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const degrees = Object.values(degreesBySchool).flat();
        setDegreeOptions(degrees);
      } catch (err) {
        console.error(err);
        setDegreeOptions([]);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [degreesBySchool]);

  const schema = useMemo(
    () => updateSubjectsSchema(degreeOptions),
    [degreeOptions]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      nombre: initialData.materia_nombre,
      id_carrera: initialData.id_carrera,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateSubject({
        nombre: data.nombre,
        id_carrera: data.id_carrera,
        id: initialData.id_materia,
      });

      const carrera = degreeOptions.find(
        (option) => option.id === data.id_carrera
      );
      if (!carrera) return;

      onSuccess({
        id_materia: updated.id,
        materia_nombre: updated.nombre,
        id_carrera: carrera.id,
        carrera_nombre: carrera.nombre,
        id_escuela: carrera.id_escuela,
        escuela_nombre: carrera.escuela_nombre,
      } as SubjectTable);

      setSuccessMsg("Materia actualizada correctamente");
      setErrorMsg(null);
      reset();
    } catch (err) {
      console.error(err);
      setSuccessMsg(null);
      setErrorMsg("Error al actualizar la materia");
    }
  };

  if (loadingOptions) return <div>Cargando opciones...</div>;

  return (
    <section className="max-w-2xl p-6 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Actualizar Materia</h3>
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
            placeholder="Nombre de la materia"
          />
          {errors.nombre && (
            <p className="text-sm text-red-600 mt-1">
              {(errors as any).nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Carrera
          </label>
          <select
            {...register("id_carrera")}
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="">-- Seleccionar --</option>
            {degreeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nombre}
              </option>
            ))}
          </select>
          {errors && (errors as any).id_carrera && (
            <p className="text-sm text-red-600 mt-1">
              {errors.id_carrera?.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-sky-700 text-white"
          >
            actualizar materia
          </button>
        </div>
      </form>
    </section>
  );
};
