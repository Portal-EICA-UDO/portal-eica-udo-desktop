import { role } from "@features/auth/nanostore";
import { useStore } from "@nanostores/react";
import Drawer from "@shared/ui/react/Drawer";
import { ShieldUser, User } from "lucide-react";

const SUPER_ADMIN_LINKS = [
  {
    label: "Crear usuarios",
    href: "/privado/crear-usuarios",
  },
  {
    label: "Carreras",
    href: "/carreras",
  },
];
const ADMIN_LINKS = [
  {
    label: "Carreras",
    href: "/carreras",
  },
];
const USER_LINKS = [
  {
    label: "Carreras",
    href: "/carreras",
  },
];
export const AuthDrawer = () => {
  const $role = useStore(role);
  return (
    <Drawer
      position="left"
      width="w-96"
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
