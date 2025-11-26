import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninWithGoogle } from "./SigninWithGoogle";
import { supabase } from "@shared/api";
import { loginSchema, registerSchema } from "../../validations";
import z, { set } from "zod";

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export const AuthModal: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema as any) });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema as any) });

  const onLogin = async (data: LoginForm) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error, data: resp } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      } as any);
      if (error) throw error;
      // login correcto → cerrar modal o manejar estado global

      console.log(resp);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      } as any);
      if (error) throw error;
      // Se pudo crear cuenta (puede requerir confirmación por email)
      setSuccessMsg("Cuenta creada correctamente, revise su correo");
      setMode("login");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    // panel
    <div className="relative z-10 w-full max-w-xl rounded-lg  overflow-hidden">
      <div className="p-6">
        {/* Google */}
        <div className="mb-4 flex justify-center">
          <SigninWithGoogle loginLabel="Continuar con Google" />
        </div>

        <div className="text-center text-sm text-gray-500 mb-4">
          o usa tu correo
        </div>

        {errorMsg && (
          <div className="mb-3 text-sm text-red-600">{errorMsg}</div>
        )}

        {successMsg && (
          <div className="mb-3 text-sm text-green-600">{successMsg}</div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo
              </label>
              <input
                type="email"
                {...registerLogin("email")}
                className="mt-1 block w-full border rounded px-3 py-2 focus:ring-sky-500"
              />
              {loginErrors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                {...registerLogin("password")}
                className="mt-1 block w-full border rounded px-3 py-2 focus:ring-sky-500"
              />
              {loginErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {loginErrors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-full bg-[#0A5C8D] text-white hover:bg-[#084a6b] transition disabled:opacity-60"
              >
                {loading ? "Iniciando..." : "Iniciar sesión"}
              </button>

              <button
                type="button"
                className="text-sm text-sky-700 underline"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                }}
              >
                ¿No tienes cuenta? Crear cuenta
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit(onRegister)}
            className="space-y-4"
          >
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

              <button
                type="button"
                className="text-sm text-sky-700 underline"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                }}
              >
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
