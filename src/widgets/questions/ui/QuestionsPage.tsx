import { useForm } from "react-hook-form";
import { createQuestionSchema } from "../validations/createQuestionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import emailjs from "@emailjs/browser"; // Importación necesaria
import { useState } from "react";
import Toast from "@shared/ui/react/Toast";

type FormData = z.infer<typeof createQuestionSchema>;

export const QuestionsPage = () => {
  const [toast, setToast] = useState<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createQuestionSchema as any),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Tu lógica de envío aquí

      await emailjs.send(
        "service_t1r1dvn",
        "template_egf6neh",
        {
          ...data,
          time: new Date().toLocaleString(),
        },
        {
          publicKey: "6VXiuzMko4JHhssPS",
        },
      );
      // Ejemplo rápido de integración con EmailJS usando el objeto 'data'
      // await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', data as any, 'PUBLIC_KEY');

      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Mensaje enviado",
        message: "Tu mensaje ha sido enviado con exito",
      });

      reset();
    } catch (error) {
      console.error(error);
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Error al enviar el mensaje",
        message: "Hubo un error al enviar el mensaje",
      });
    }
  };

  return (
    <div className="flex items-center flex-col  w-full min-h-screen ">
      <div className="max-w-7xl w-full flex items-center flex-col gap-4 ">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200  w-full ">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Preguntas</h2>
              <p className="text-gray-600 mt-1">
                Envíanos tus preguntas y nos pondremos en contacto contigo lo
                antes posible
              </p>
            </div>
          </div>
        </div>
        <section className="max-w-[900px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 w-full">
          {/* Cabecera estilo ventana de correo */}
          <div className="bg-sky-700 px-6 py-3 flex justify-between items-center">
            <h2 className="text-white font-medium">Nuevo Mensaje</h2>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
              <div className="w-3 h-3 bg-sky-300 rounded-full"></div>
            </div>
          </div>

          <form onSubmit={handleUpdateSubmit(onSubmit)} className="p-0">
            {/* Campo: Para (Email del remitente) */}
            <div className="flex items-center px-6 py-3 border-b border-gray-100 group">
              <label className="text-gray-400 w-16 text-sm font-medium">
                De:
              </label>
              <div className="flex-1 px-2">
                <input
                  {...registerUpdate("user_email")}
                  type="email"
                  className="w-full focus:outline-none text-gray-700 bg-transparent"
                  placeholder="tu-correo@ejemplo.com"
                />
                {errors.user_email && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.user_email.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Campo: Nombre */}
            <div className="flex items-center px-6 py-3 border-b border-gray-100">
              <label className="text-gray-400 w-16 text-sm font-medium">
                Nombre:
              </label>
              <div className="flex-1 px-2">
                <input
                  {...registerUpdate("name")}
                  type="text"
                  className="w-full focus:outline-none text-gray-700"
                  placeholder="¿Quién envía el mensaje?"
                />
                {errors.name && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Campo: Título/Asunto */}
            <div className="flex items-center px-6 py-3 border-b border-gray-100">
              <label className="text-gray-400 w-16 text-sm font-medium">
                Asunto:
              </label>
              <div className="flex-1 px-2">
                <input
                  {...registerUpdate("title")}
                  type="text"
                  className="w-full focus:outline-none text-gray-700 font-semibold"
                  placeholder="Título del mensaje"
                />
                {errors.title && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.title.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Campo: Mensaje (Cuerpo del correo) */}
            <div className="px-6 py-4">
              <textarea
                {...registerUpdate("message")}
                rows={8}
                className="w-full focus:outline-none text-gray-700 resize-none placeholder-gray-300"
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.message.message as string}
                </p>
              )}
            </div>

            {/* Footer de acciones */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end border-t border-gray-100">
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#0A5C8D] rounded-full text-white hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-2">
                  {" "}
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </div>
              </button>

              {/* <span className="text-xs text-gray-400 italic">
              Configurado vía EmailJS
            </span> */}
            </div>
          </form>
        </section>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
