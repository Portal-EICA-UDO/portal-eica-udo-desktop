import { useEffect, useMemo, useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSubjectsSchema } from "../validations/index";
import type z from "zod";
import { updateSubject, subjectCodeExists } from "../api";
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
    [degreeOptions],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      nombre: initialData.materia_nombre,
      codigo: initialData.materia_codigo,
      id_carrera: initialData.id_carrera,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (data.codigo) {
        const exists = await subjectCodeExists(
          data.codigo,
          initialData.id_materia,
        );
        if (exists) {
          setError("codigo", {
            type: "manual",
            message: "Ya existe una materia con ese código",
          } as any);
          return;
        }
      }
      const updated = await updateSubject({
        nombre: data.nombre,
        id_carrera: data.id_carrera,
        id: initialData.id_materia,
        codigo: data.codigo,
      });

      const carrera = degreeOptions.find(
        (option) => option.id === data.id_carrera,
      );
      if (!carrera) return;

      onSuccess({
        id_materia: updated.id,
        materia_nombre: updated.nombre,
        materia_codigo: updated.codigo,
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
    <section className="max-w-2xl p-6 bg-white rounded shadow w-[clamp(300px,calc(100vw-77px),672px)]">
      <h3 className="text-lg font-semibold mb-4">Actualizar Materia</h3>
      {successMsg && <p className="text-green-600">{successMsg}</p>}
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código
            <span className="text-red-600 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </label>
          <input
            {...register("codigo")}
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            placeholder="Código de la materia"
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
            <span className="text-red-600 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </label>
          <input
            {...register("nombre")}
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
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
            <span className="text-red-600 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </label>
          <select
            {...register("id_carrera")}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
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
            {isSubmitting ? "Actualizando..." : "Actualizar materia"}
          </button>
        </div>
      </form>
    </section>
  );
};
