import type React from "react";

// types/table.types.ts
export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "number" | "date" | "range" | "boolean";
  options?: { label: string; value: any }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: any;
  type: FilterConfig["type"];
}

export interface TableModalContents {
  create: (onSuccess: any) => React.ReactNode;
  edit: (initialData: any, onSubmitProp: any) => React.ReactNode;
  delete: (data: any, onSuccess: any) => React.ReactNode;
}

export interface TableProps<T = any> {
  // Datos
  data: T[];

  // Configuración
  columns: any[];
  filters?: FilterConfig[];
  modalContents: TableModalContents;
  title?: string;
  pageSize?: number;
  enableRowSelection?: boolean;
  enableFilters?: boolean;

  // Estado controlado desde el padre
  activeFilters?: ActiveFilter[];
  globalFilter?: string;

  // Callbacks
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  onGlobalFilterChange: (value: string) => void;
  onApplyFilter?: (
    filterKey: string,
    value: any,
    type: FilterConfig["type"]
  ) => void;
  onClearFilter?: (filterKey: string) => void;
  onClearAllFilters?: () => void;
  onEditRequest?: (item: T) => void;
  onDeleteRequest?: (items: T[]) => void;
  onCreateRequest?: (item: T) => void;

  // UI
  className?: string;
}
