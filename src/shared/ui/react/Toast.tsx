import React, { useState, useEffect, type FC } from "react";

// 1. Configuración de variantes (Iconos y Colores para Tailwind)
// Definimos los colores de fondo (bg-...) y los SVGs para cada tipo.
const toastConfig = {
  success: {
    bgColor: "bg-green-500",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  error: {
    bgColor: "bg-red-500",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  },
  warning: {
    bgColor: "bg-yellow-500",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  info: {
    bgColor: "bg-blue-500",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

type Props = {
  type?: keyof typeof toastConfig;
  title?: string;
  message?: string;
  linkText?: string;
  linkUrl?: string;
  duration?: number;
  onClose?: () => void;
};

export const Toast: FC<Props> = ({
  type = "info", // 'success', 'error', 'warning', 'info'. Default: info
  title,
  message,
  linkText,
  linkUrl = "#",
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Seleccionamos la configuración basada en la prop 'type'
  const config = toastConfig[type] || toastConfig.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 500); // Debe coincidir con la duración de la transición de Tailwind (duration-500)
  };

  if (!isVisible) return null;

  // Clases para la animación de entrada/salida usando transiciones de Tailwind
  const animationClasses = isExiting
    ? "translate-x-[120%] opacity-0" // Estado de salida
    : "translate-x-0 opacity-100"; // Estado de entrada

  return (
    <>
      {/* Inyectamos una keyframe animation simple solo para la barra de progreso, 
          ya que Tailwind no tiene una utilidad nativa para "encoger horizontalmente" */}
      <style>{`
        @keyframes shrink-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>

      {/* Contenedor Principal */}
      <div
        className={`fixed bottom-5 right-5 w-[350px] bg-white rounded-xl shadow-2xl overflow-hidden z-9999 
                   transition-all duration-500 ease-in-out transform ${animationClasses}`}
        role="alert"
      >
        <div className="flex p-5 items-start gap-4 relative">
          {/* Contenedor del Ícono (Color dinámico) */}
          <div
            className={`${config.bgColor} rounded-full p-2 flex items-center justify-center shrink-0`}
          >
            {config.icon}
          </div>

          {/* Textos */}
          <div className="flex-1 space-y-1">
            {title && (
              <h4 className="font-bold text-gray-900 text-base leading-tight">
                {title}
              </h4>
            )}
            <p className="text-sm text-gray-600 leading-snug">{message}</p>
            {linkText && (
              <a
                href={linkUrl}
                className="text-sm font-semibold text-gray-900 underline hover:text-gray-700 block mt-2"
              >
                {linkText}
              </a>
            )}
          </div>

          {/* Botón Cerrar (X) */}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-800 transition-colors p-1 absolute top-3 right-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Barra de Progreso (Color dinámico y animación inline) */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100">
          <div
            className={`h-full ${config.bgColor} origin-left`}
            style={{
              animation: `shrink-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Toast;
