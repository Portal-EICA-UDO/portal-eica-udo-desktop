import type z from "zod";
import { createStaffSchema } from "../validations/";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect, useState, useRef } from "react";
import type { MateriaMultiSelect, StaffTable } from "../types";
import { MultiSelect } from "@shared/ui/react/MultiSelect";
import { createStaff, uploadStaffImage } from "../api";

type FormData = z.infer<typeof createStaffSchema>; // para tipado
type Props = {
  onSuccess: (data: StaffTable) => void;
  materias: MateriaMultiSelect[];
};

export const CreateStaffs: React.FC<Props> = ({ onSuccess, materias }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(createStaffSchema as any),
    defaultValues: {
      materiasAsociadas: [], // Inicializa como array vacío
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

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onSubmit = async (data: FormData) => {
    try {
      const staffData = await createStaff({
        ...data,
        imagen_url: data.imagen_url.name,
      });

      uploadStaffImage(imageFile!);
      onSuccess({
        id: staffData.id,
        ...data,
        imagen_url: data.imagen_url.name,
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

      setSuccessMsg("Staff creado correctamente");
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al crear el staff");
    }
  };
  return (
    <section className="max-w-2xl p-6 bg-white rounded-lg ">
      <header className="mb-4">
        <h3 className="text-lg font-semibold">Crear Staff</h3>
        <p className="text-sm text-gray-600 mt-1">
          Rellena los datos del personal
        </p>
      </header>

      {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}
      {successMsg && <p className="text-green-600 mb-3">{successMsg}</p>}
      <form onSubmit={handleRegisterSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre
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
              Apellido
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
              Email
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
              Posición
            </label>
            <input
              {...registerRegister("posicion")}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="Ej. Profesor, Asistente"
            />
            {errors.posicion && (
              <p className="text-sm text-red-600 mt-1">
                {errors.posicion.message}
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
            Imagen
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
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-white rounded-full px-2 py-0.5 text-sm shadow"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 px-2">
                  <p>Arrastra o selecciona una imagen</p>
                  <p className="mt-2 text-xs text-gray-400">
                    JPG, PNG 
                  </p>
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
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
                  >
                    Eliminar
                  </button>
                )}
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
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md"
          >
            Crear
          </button>
        </div>
      </form>
    </section>
  );
};
