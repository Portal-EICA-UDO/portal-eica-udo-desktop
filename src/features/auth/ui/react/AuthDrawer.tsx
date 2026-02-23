import { role } from "@features/auth/nanostore";
import { useStore } from "@nanostores/react";
import type { Link } from "@shared/types/drawer";
import Drawer from "@shared/ui/react/Drawer";
import {
  ShieldUser,
  User,
  LibraryBig,
  GraduationCap,
  School,
  MailQuestionMark,
  MessageSquareText,
  SquareUserRound,
} from "lucide-react";

const SUPER_ADMIN_LINKS: Link[] = [
  {
    label: "Crear Usuarios",
    href: "/privado/crear-usuarios",
    admin: true,
  },
  {
    label: "Biblioteca",
    href: "/biblioteca",
    icon: <LibraryBig />,
  },
  {
    label: "Carreras",
    href: "/carreras",
    icon: <GraduationCap />,
  },
  {
    label: "Comunicados",
    href: "/comunicados",
    icon: <MessageSquareText />,
  },
  {
    label: "Staff",
    href: "/staff",
    icon: <SquareUserRound />,
  },
  {
    label: "Escuelas",
    href: "/escuelas",
    icon: <School />,
  },
  {
    label: "Realizar una pregunta",
    href: "/preguntas",
    icon: <MailQuestionMark />,
  },
  {
    label: "Escuelas",
    href: "/privado/escuelas",
    admin: true,
  },
  {
    label: "Carreras",
    href: "/privado/carreras",
    admin: true,
  },
  {
    label: "Materias",
    href: "/privado/materias",
    admin: true,
  },
  {
    label: "Staff",
    href: "/privado/staff",
    admin: true,
  },
  {
    label: "Dependencias",
    href: "/privado/dependencias",
    admin: true,
  },
];
const ADMIN_LINKS = [
  {
    label: "Biblioteca",
    href: "/biblioteca",
    icon: <LibraryBig />,
  },
  {
    label: "Carreras",
    href: "/carreras",
    icon: <GraduationCap />,
  },
  {
    label: "Comunicados",
    href: "/comunicados",
    icon: <MessageSquareText />,
  },
  {
    label: "Staff",
    href: "/staff",
    icon: <SquareUserRound />,
  },
  {
    label: "Escuelas",
    href: "/escuelas",
    icon: <School />,
  },
  {
    label: "Realizar una pregunta",
    href: "/preguntas",
    icon: <MailQuestionMark />,
  },
  {
    label: "Escuelas",
    href: "/privado/escuelas",
    admin: true,
  },
  {
    label: "Carreras",
    href: "/privado/carreras",
    admin: true,
  },
  {
    label: "Materias",
    href: "/privado/materias",
    admin: true,
  },
  {
    label: "Staff",
    href: "/privado/staff",
    admin: true,
  },
  {
    label: "Dependencias",
    href: "/privado/dependencias",
    admin: true,
  },
];
const USER_LINKS = [
  {
    label: "Biblioteca",
    href: "/biblioteca",
    icon: <LibraryBig />,
  },
  {
    label: "Carreras",
    href: "/carreras",
    icon: <GraduationCap />,
  },
  {
    label: "Comunicados",
    href: "/comunicados",
    icon: <MessageSquareText />,
  },
  {
    label: "Staff",
    href: "/staff",
    icon: <SquareUserRound />,
  },
  {
    label: "Escuelas",
    href: "/escuelas",
    icon: <School />,
  },
  {
    label: "Realizar una pregunta",
    href: "/preguntas",
    icon: <MailQuestionMark />,
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
