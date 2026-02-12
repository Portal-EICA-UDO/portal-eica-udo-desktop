import React, { useRef } from "react";
import { X } from "lucide-react";

interface ReactActiveModalButtonProps {
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  color?: string;
  iconPosition?: "left" | "right";
}

export const RCActiveModalButton: React.FC<ReactActiveModalButtonProps> = ({
  label,
  icon,
  children,
  color = "bg-[#0A5C8D]",
  iconPosition = "left",
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const openModal = () => {
    if (modalRef.current) {
      setIsOpen(true); // Primero permitimos que se renderice
      modalRef.current.showModal();
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    modalRef.current?.close();
    setIsOpen(false); // Al cerrar, desmontamos los hijos
    document.body.style.overflow = "auto";
  };

  const handleNativeClose = (e: React.SyntheticEvent) => {
    // ESTA ES LA PARTE VITAL:
    // e.target es quien disparó el cierre. 
    // modalRef.current es el diálogo de este componente específico.
    if (e.target === modalRef.current) {
      setIsOpen(false);
      
      // Solo devolvemos el scroll si no hay más modales abiertos en el DOM
      const dialogsOpen = document.querySelectorAll('dialog[open]');
      if (dialogsOpen.length === 0) {
        document.body.style.overflow = "auto";
      }
    } else {
      // Si el evento viene de un hijo, detenemos la propagación aquí
      // para que no siga subiendo a otros posibles abuelos.
      e.stopPropagation();
    }
  };

  return (
    <>
      <button
        className={`px-4 py-2 ${color} rounded-full cursor-pointer flex items-center gap-2 text-white hover:scale-105 transition-transform font-light`}
        onClick={openModal}
      >
        {icon && iconPosition === "left" && <span>{icon}</span>}
        {label && <span className="w-max">{label}</span>}
        {icon && iconPosition === "right" && <span>{icon}</span>}
      </button>

      <dialog
        ref={modalRef}
        className="m-auto rounded-lg shadow-xl p-0 backdrop:bg-gray-900/50 backdrop:backdrop-blur-sm open:flex open:flex-col"
        onClose={handleNativeClose}
      >
        <div className="relative bg-white p-6 min-w-[300px]">
          {/* Botón de cerrar */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Contenido */}
          {/* Solo renderiza children si isOpen es true */}
          <div className="mt-2">{isOpen && children}</div>
        </div>
      </dialog>
    </>
  );
};
