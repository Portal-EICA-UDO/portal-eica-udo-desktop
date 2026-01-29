import { role } from "@features/auth/nanostore";
import { useStore } from "@nanostores/react";
import Drawer from "@shared/ui/react/Drawer";
import { ShieldUser, User } from "lucide-react";

const SUPER_ADMIN_LINKS = [
  {
    label: "Crear Usuarios",
    href: "/privado/crear-usuarios",
  },
  {
    label: "Carreras",
    href: "/carreras",
  },
  {
    label: "Gestionar Carreras",
    href: "/privado/carreras",
  },
  {
    label: "Gestionar materias",
    href: "/privado/materias",
  },
  {
    label: "Gestionar  Escuelas",
    href: "/privado/escuelas",
  },
  {
    label: "Gestionar  staff",
    href: "/privado/staff",
  },
];
const ADMIN_LINKS = [
  {
    label: "Carreras",
    href: "/carreras",
  },
  {
    label: "Gestionar Carreras",
    href: "/privado/carreras",
  },
  {
    label: "Gestionar materias",
    href: "/privado/materias",
  },
  {
    label: "Gestionar  Escuelas",
    href: "/privado/escuelas",
  },
  {
    label: "Gestionar  staff",
    href: "/privado/staff",
  },
];
const USER_LINKS = [
  {
    label: "Biblioteca",
    href: "/biblioteca",
  },
  {
    label: "Carreras",
    href: "/carreras",
  },
  {
    label: "Comunicados",
    href: "/comunicados",
  },
  {
    label: "Staff",
    href: "/staff",
  },
];
export const AuthDrawer = () => {
  const $role = useStore(role);
  return (
    <Drawer
      position="left"
      width="md:w-96"
      links={
        $role === "superAdmin"
          ? SUPER_ADMIN_LINKS
          : $role === "admin"
            ? ADMIN_LINKS
            : USER_LINKS
      }
      icon={
        $role === "superAdmin" ? (
          <ShieldUser />
        ) : $role === "admin" ? (
          <ShieldUser />
        ) : (
          <User />
        )
      }
    ></Drawer>
  );
};
