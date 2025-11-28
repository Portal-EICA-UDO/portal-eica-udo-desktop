import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerSchema } from "../validations";
import type z from "zod";
import { use, useEffect, useState } from "react";
import { supabase } from "@shared/api";
import { useStore } from "@nanostores/react";
import { role } from "@features/auth/nanostore";

type RegisterForm = z.infer<typeof registerSchema>;
export const CreateAdminUsers = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const $role = useStore(role);
  console.log("role desde create admin", $role);
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema as any) });

  const onRegister = async (data: RegisterForm) => {
    setErrorMsg(null);
    setLoading(true);
    console.log(data);
    try {
      const { data: signupData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      } as any);
      if (error) throw error;
      console.log("signupData: ", signupData);
      //actualizar el role_name del usuario en la tabla roles siempre y cuando asi lo haya creado
      if (signupData.user !== null && data.role === "admin") {
        const user_id = signupData.user.id;
        const { error } = await supabase
          .from("roles")
          .update({ role_name: "admin" })
          .eq("user_id", user_id);
        if (error) throw error;
      }

      // Se pudo crear cuenta (puede requerir confirmación por email)
      setSuccessMsg(
        "Cuenta creada correctamente, Habra llegado un correo al correo ingresado"
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if ($role !== "superAdmin") {
      // navergar pero que sea despues de tres segundo y que no sea del lado del cliente
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  }, [$role]);
  if ($role !== "superAdmin") {
    return (
      <section className="flex justify-start items-center h-full flex-col flex-1 pt-4">
        <div>
          no tiene permiso para acceder a esta pagina, sera rederijido en tres
          segundo
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-start items-center h-full flex-col flex-1 pt-4">
      {/* un elemeento para mostrar mensajes de exito o error */}
      <div>
        {errorMsg && <p className="text-sm text-red-600 mt-1">{errorMsg}</p>}
        {successMsg && (
          <p className="text-sm text-green-600 mt-1">{successMsg}</p>
        )}
      </div>

      <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Correo
          </label>
          <input
            type="email"
            {...registerRegister("email")}
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-sky-500"
          />
          {registerErrors.email && (
            <p className="text-sm text-red-600 mt-1">
              {registerErrors.email.message}
            </p>
          )}
        </div>
        {/* select para el rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            {...registerRegister("role")}
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-sky-500"
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          {registerErrors.role && (
            <p className="text-sm text-red-600 mt-1">
              {registerErrors.role.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            {...registerRegister("password")}
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-sky-500"
          />
          {registerErrors.password && (
            <p className="text-sm text-red-600 mt-1">
              {registerErrors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Repetir contraseña
          </label>
          <input
            type="password"
            {...registerRegister("confirmPassword")}
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-sky-500"
          />
          {registerErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {registerErrors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-full bg-[#0A5C8D] text-white hover:bg-[#084a6b] transition disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
      </form>
    </section>
  );
};
