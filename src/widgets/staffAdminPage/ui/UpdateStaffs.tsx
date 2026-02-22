import type z from "zod";
import { updateStaffSchema } from "../validations/";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect, useState, useRef } from "react";
import type { MateriaMultiSelect, StaffTable } from "../types";
import { MultiSelect } from "@shared/ui/react/MultiSelect";
import { identityCardExists, updateStaff, updateStaffImage } from "../api";
import { getImageUrl } from "@shared/lib";
import { CONDITION_TYPES, STAFF_TYPES } from "@features/staff/const";

type FormData = z.infer<typeof updateStaffSchema>; // para tipado
type Props = {
  onSuccess: (data: StaffTable) => void;
  materias: MateriaMultiSelect[];
  initialData: StaffTable;
};

export const UpdateStaffs: React.FC<Props> = ({
  onSuccess,
  materias,
  initialData,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    clearErrors,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(updateStaffSchema as any),
    defaultValues: {
      ...initialData,
      imagen_url: undefined,
      materiasAsociadas: initialData.materiasAsociadas?.map(
        (materia) => materia.id,
      ),
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
  const imageRegister = registerRegister("imagen_url");

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
      setImagePreview(getImageUrl("staff-imagenes", initialData.imagen_url));
    } else {
      setImagePreview(null);
    }

    return undefined;
  }, [imageFile]);

  const onSubmit = async (data: FormData) => {
    let staffData = null;
    try {
      clearErrors("cedula");
      const existsIdentityCard = await identityCardExists(
        data.cedula,
        initialData.id,
      );
      if (existsIdentityCard) {
        setError("cedula", {
          type: "manual",
          message: "Ya existe un staff con esa cédula",
        });
        return;
      }
      if (data.materiasAsociadas) {
        staffData = await updateStaff(
          initialData.id,
          {
            ...data,
            imagen_url: data.imagen_url
              ? data.imagen_url.name
              : initialData.imagen_url,
          },
          initialData.materiasAsociadas?.map((materia) => materia.id) ?? [],
          data.materiasAsociadas,
        );
      } else {
        staffData = await updateStaff(
          initialData.id,
          {
            ...data,
            imagen_url: data.imagen_url
              ? data.imagen_url.name
              : initialData.imagen_url,
          },
          [],
          [],
        );
      }

      if (data.imagen_url) {
        updateStaffImage(imageFile!);
      }
      onSuccess({
        id: staffData.id,
        ...data,
        imagen_url: data.imagen_url
          ? data.imagen_url.name
          : initialData.imagen_url,
        materiasAsociadas: data.materiasAsociadas?.map((materia) => ({
          id: materia,
          carrera: materias.find((m) => m.id === materia)!.carrera as string,
          nombre: materias.find((m) => m.id === materia)!.nombre as string,
          id_carrera: materias.find((m) => m.id === materia)!
            .id_carrera as string,
        })),
      });

      reset();
      setImageFile(null);
      setImagePreview(null);
      URL.revokeObjectURL(imagePreview!);

      setSuccessMsg("Staff actualizado correctamente");
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al actualizar el staff");
    }
  };
  return (
    <section className="max-w-2xl p-6 bg-white rounded-lg ">
      <header className="mb-4">
        <h3 className="text-lg font-semibold">Actualizar Staff</h3>
        <p className="text-sm text-gray-600 mt-1">
          Rellena los datos del personal
        </p>
      </header>

      {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}
      {successMsg && <p className="text-green-600 mb-3">{successMsg}</p>}
      <form
        onSubmit={handleRegisterSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Cédula{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              {...registerRegister("cedula")}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Cedula"
            />
            {errors.cedula && (
              <p className="text-sm text-red-600 mt-1">
                {errors.cedula.message}
              </p>
            )}
          </div>
          <div className="mb-2">
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

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Apellido{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              {...registerRegister("apellido")}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Apellido"
            />
            {errors.apellido && (
              <p className="text-sm text-red-600 mt-1">
                {errors.apellido.message}
              </p>
            )}
          </div>

          <div className="mb-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Email{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              {...registerRegister("email")}
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Posición{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <select
              {...registerRegister("posicion")}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">-- Seleccionar --</option>
              {Object.values(STAFF_TYPES).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.posicion && (
              <p className="text-sm text-red-600 mt-1">
                {errors.posicion.message}
              </p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Condición{" "}
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <select
              {...registerRegister("condicion")}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">-- Seleccionar --</option>
              {Object.values(CONDITION_TYPES).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.condicion && (
              <p className="text-sm text-red-600 mt-1">
                {errors.condicion.message}
              </p>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              {...registerRegister("telefono")}
              type="tel"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="+54 9 11 1234 5678"
            />
            {errors.telefono && (
              <p className="text-sm text-red-600 mt-1">
                {errors.telefono.message}
              </p>
            )}
          </div>
          <div className="mb-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Síntesis curricular
            </label>
            <textarea
              {...registerRegister("sistesis_curricular")}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Breve síntesis curricular (opcional)"
            />
            {errors.sistesis_curricular && (
              <p className="text-sm text-red-600 mt-1">
                {(errors as any).sistesis_curricular?.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 z-10">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materias Asociadas
          </label>
          <MultiSelect
            control={control}
            name="materiasAsociadas"
            options={materias}
            placeholder="Buscar materias..."
          />
          {errors.materiasAsociadas && (
            <p className="text-sm text-red-600 mt-1">
              {(errors.materiasAsociadas as any)?.message}
            </p>
          )}
        </div>

        {/* Input para imagen con vista previa */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen{" "}
            <span className="text-red-600 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
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
                  <p className="mt-2 text-xs text-gray-400">JPG, PNG</p>
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0A5C8D] hover:scale-105  transition-transform  text-white font-medium rounded-md"
          >
            {isSubmitting ? "Actualizando..." : "Actualizar staff"}
          </button>
        </div>
      </form>
    </section>
  );
};
