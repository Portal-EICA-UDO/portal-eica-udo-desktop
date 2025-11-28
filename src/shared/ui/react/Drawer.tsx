// ...existing code...
import { email, name, role } from "@features/auth/nanostore";
import { useStore } from "@nanostores/react";
import { ShieldUser } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";

type DrawerProps = {
  position?: "right" | "left";
  width?: string; // ejemplo: "w-80", "w-96"
  className?: string;
  closeOnOverlayClick?: boolean;
  links?: { label: string; href?: string }[];
};

export const Drawer: React.FC<DrawerProps> = ({
  position = "right",
  width = "w-80",
  className = "",
  closeOnOverlayClick = true,
  links,
}) => {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const $email = useStore(email);
  const $name = useStore(name);
  const $role = useStore(role);

  useEffect(() => {
    // bloquear scroll del body cuando el drawer está abierto
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // cerrar al clicar en overlay
  const onOverlayClick = (e: React.MouseEvent) => {
    if (!closeOnOverlayClick) return;
    if (e.target === e.currentTarget) setOpen(false);
  };

  // clases para animación según posición
  const translateClass =
    position === "right" ? "translate-x-0" : "-translate-x-0";
  const offscreenClass =
    position === "right" ? "translate-x-full" : "-translate-x-full";
  const sidePosition = position === "right" ? "right-0" : "left-0";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className=" text-center hover:bg-transparent px-4 py-1 text-(length:--font-default) font-medium rounded-full border border-sky-700 text-sky-700 hover:scale-105 transition"
        aria-expanded={open}
        aria-controls="site-drawer"
      >
        <ShieldUser />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onOverlayClick}
          aria-hidden={!open}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          {/* Drawer panel */}
          <div
            id="site-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            className={`fixed top-0 ${sidePosition} h-full z-50 ${width} bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              open ? translateClass : offscreenClass
            } ${className}`}
            // evitar que el click en el panel propague al overlay
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold">
                <span className="text-sky-700">{$name}</span>
                <br />
                <span className="text-sky-700">{$email}</span>
                <br />
                <span className="text-sky-700">{$role}</span>
              </div>
              <button
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto h-full">
              {links?.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    navigate(link.href || "/");
                  }}
                  className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100  focus:bg-gray-100 transition-colors duration-75 "
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Drawer;
