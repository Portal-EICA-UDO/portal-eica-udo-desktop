import React, { useRef } from "react";
import { X } from "lucide-react";

interface ReactActiveModalButtonProps {
  label: string;
  icon?: React.ReactNode; // Prop para el ícono
  content?: React.ReactNode;
}

const ReactActiveModalButton: React.FC<ReactActiveModalButtonProps> = ({
  label,
  icon,
  content,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.showModal();
      document.body.style.overflow = "hidden"; // Evitar scroll
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
      document.body.style.overflow = "auto"; // Restaurar scroll
    }
  };

  return (
    <>
      <button
        className="active-modal-button px-4 py-1.5 bg-[#0A5C8D] rounded-full w-[80%] flex justify-center hover:scale-105 transition-transform"
        onClick={openModal}
      >
        <div className="flex items-center gap-2 justify-center text-white">
          {icon && <div className="icon">{icon}</div>}{" "}
          {/* Renderiza el ícono si se proporciona */}
          {label && <div>{label}</div>}
        </div>
      </button>

      <dialog
        ref={modalRef}
        aria-labelledby="dialog-title"
        className="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
      >
        <div className="fixed inset-0 bg-gray-500/75 transition-opacity"></div>

        <div className="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lvh">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">{content}</div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                onClick={closeModal}
                className="rotate absolute top-3 right-3 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="close"
              >
                <X />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default ReactActiveModalButton;
