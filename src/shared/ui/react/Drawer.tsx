import { email, fullName, name, role } from "@features/auth/nanostore";
import { useStore } from "@nanostores/react";
import React, { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
//lucide icons
import { FolderPen, Mail, UserStar } from "lucide-react";
import { isAdminOrSuperAdmin } from "@features/auth/lib";
import type { Link } from "@shared/types/drawer";

type DrawerProps = {
  position?: "right" | "left";
  width?: string; // ejemplo: "w-80", "w-96"
  className?: string;
  closeOnOverlayClick?: boolean;
  icon?: React.ReactNode;
  links?: Link[];
};

export const Drawer: React.FC<DrawerProps> = ({
  position = "right",
  width = "w-80",
  className = "",
  closeOnOverlayClick = true,
  links,
  icon,
}) => {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const $email = useStore(email);
  const $name = useStore(name);
  const $role = useStore(role);
  const $fullname = useStore(fullName);

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
        className=" text-center hover:bg-transparent px-4 py-1 md:text-(length:--font-default) font-medium rounded-full border border-sky-700 text-[#0A5C8D] hover:scale-105 transition "
        aria-expanded={open}
        aria-controls="site-drawer"
      >
        {icon}
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
            className={`fixed top-0 ${sidePosition} h-full z-50 ${width} w-full  bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              open ? translateClass : offscreenClass
            } ${className} flex flex-col`}
            // evitar que el click en el panel propague al overlay
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="text-lg font-semibold flex md:flex-row flex-col gap-1.5">
                <a href="/" className="">
                  <img
                    src={"/images/logoUDO.png"}
                    alt="Logo"
                    className="top-4 w-20 h-20 rounded-full shadow-md object-cover"
                  />
                </a>
                {$role !== "unauthenticated" && $role && (
                  <div>
                    <div className=" flex gap-1.5 items-center">
                      <FolderPen className="w-4 h-4 text-gray-600" />
                      <div className="text-gray-600">{$fullname}</div>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <div className="text-gray-600">{$email}</div>
                    </div>

                    {$role !== "user" && (
                      <div className=" flex gap-1.5 items-center">
                        <UserStar className="w-4 h-4 text-gray-600" />
                        <div className="text-gray-600">{$role}</div>
                      </div>
                    )}
                  </div>
                )}
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
              {/* separar links públicos y links de admin */}
              {links &&
                (() => {
                  const normalLinks = links.filter((l) => !l.admin);
                  const adminLinks = links.filter((l) => l.admin);
                  return (
                    <div>
                      <div className="space-y-1">
                        {normalLinks.map((link) => (
                          <button
                            key={link.label}
                            onClick={() => {
                              navigate(link.href || "/");
                              setOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              {link.icon && (
                                <span className="w-5 h-5 flex items-center justify-center text-gray-500">
                                  {link.icon}
                                </span>
                              )}
                              <span>{link.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* sección de administración, sólo visible para admins/superAdmin */}
                      {adminLinks.length > 0 && isAdminOrSuperAdmin($role) && (
                        <div className="mt-4">
                          <div className="rounded-lg border border-sky-100 bg-linear-to-b from-white to-sky-50 shadow-sm p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="bg-sky-100 p-1.5 rounded-md">
                                  <UserStar className="w-4 h-4 text-[#0A5C8D]" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-[#0A5C8D]">
                                    Administración
                                  </div>
                                  <div className="text-xs text-[#0A5C8D]">
                                    Opciones para gestionar el sitio
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs bg-sky-100 text-[#0a5d8dbd] px-2 py-0.5 rounded-full">
                                Admin
                              </span>
                            </div>

                            <div className="space-y-2">
                              {adminLinks.map((link) => (
                                <button
                                  key={link.label}
                                  onClick={() => {
                                    navigate(link.href || "/");
                                    setOpen(false);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm leading-5 text-sky-800 hover:bg-sky-100 focus:bg-sky-100  rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    {link.icon && (
                                      <span className="w-5 h-5 flex items-center justify-center text-[#0A5C8D]">
                                        {link.icon}
                                      </span>
                                    )}
                                    <span>{link.label}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Drawer;
