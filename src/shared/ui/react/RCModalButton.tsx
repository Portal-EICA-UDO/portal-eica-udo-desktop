import React, { useRef } from "react";
import { X } from "lucide-react";

interface ReactActiveModalButtonProps {
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  color?: string;
}

export const RCActiveModalButton: React.FC<ReactActiveModalButtonProps> = ({
  label,
  icon,
  children,
  color = "bg-[#0A5C8D]",
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

  return (
    <>
      <button
        className={`px-4 py-1.5 ${color} rounded-full flex items-center gap-2 text-white hover:scale-105 transition-transform`}
        onClick={openModal}
      >
        {icon && <span>{icon}</span>}
        {label && <span className="w-max">{label}</span>}
      </button>

      <dialog
        ref={modalRef}
        className="m-auto rounded-lg shadow-xl p-0 backdrop:bg-gray-900/50 backdrop:backdrop-blur-sm open:flex open:flex-col"
        onClose={() => {
          document.body.style.overflow = "auto";
          setIsOpen(false);
        }} // Importante: manejar el cierre por tecla ESC
      >
        <div className="relative bg-white p-6 min-w-[300px]">
          {/* Botón de cerrar */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
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
