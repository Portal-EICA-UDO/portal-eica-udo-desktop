import type { ReactNode } from "react";

export type Link = {
  label: string;
  href: string;
  admin?: boolean;
  icon?: ReactNode;
};
