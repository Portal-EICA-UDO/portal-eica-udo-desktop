// pages/UsuariosPage.tsx
import { useState, useCallback, useEffect, useMemo } from "react";
import { DynamicTable } from "@shared/ui/react/DynamicTable";

import type { FilterConfig, ActiveFilter } from "@shared/types";
import { useStore } from "@nanostores/react";
import { role } from "@features/auth/nanostore";
import { getSchools } from "../api/requests";
import type { ColumnDef } from "@tanstack/react-table";
import { UpdateSchools } from "./UpdateSchools";
import { CreateSchools } from "./CreateSchools";
import { DeleteSchools } from "./deleteSchools";
import { isAdminOrSuperAdmin } from "@features/auth/lib";
import Toast from "@shared/ui/react/Toast";

export const SchoolsAdminPage = () => {
  // Estado centralizado en el padre
  const [data, setData] = useState<any[]>();

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [toast, setToast] = useState<{
    id: string;
    type: string;
    message: string;
    title: string;
    duration: number;
  } | null>(null);
  const [timerID, setTimerID] = useState<NodeJS.Timeout | null>(null);

  const $role = useStore(role);

  useEffect(() => {
    const fetchData = async () => {
      const schools = await getSchools();

      setData(schools);
    };
    fetchData();
  }, []);

  // Definición de filtros
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  // Handlers de filtros
  const handleApplyFilter = useCallback(
    (key: string, value: any, type: FilterConfig["type"]) => {
      setActiveFilters((prev) => {
        let existing = prev.filter((f) => f.key !== key);
        if (value === "" || value === null || value === undefined) {
          return existing;
        }

        const filterConfig = filters.find((f) => f.key === key);

        return [
          ...existing,
          {
            key,
            label: filterConfig?.label || key,
            value,
            type,
          },
        ];
      });
    },
    [filters],
  );

  const handleClearFilter = useCallback((key: string) => {
    setActiveFilters((prev) => {
      return prev.filter((f) => f.key !== key);
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Handlers de CRUD
  const handleCreateRequest = useCallback((data: any) => {
    setData((prev) => [...(prev as any[]), data]);
  }, []);

  const handleEditRequest = useCallback((item: any) => {
    setData((prev) => {
      return (prev as any[]).map((u) => (u.id === item.id ? item : u));
    });
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: "Escuela editada",
      message: "Escuela editada correctamente",
      duration: 5000,
    });
  }, []);

  const handleDeleteRequest = useCallback((items: any[]) => {
    setData((prev) => (prev as []).filter((u) => !items.includes(u)));
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: items.length > 1 ? "Escuelas eliminadas" : "Escuela eliminada",
      message:
        items.length > 1
          ? "Escuelas eliminadas correctamente"
          : "Escuela eliminada correctamente",
      duration: 5000,
    });
  }, []);

  // Modal contents (definidos en el padre)
  const modalContents = {
    create: (onSuccess: (data: any) => void) => {
      return <CreateSchools onSuccess={onSuccess} />;
    },
    edit: (initialData: any, onSubmitProp: any) => {
      return (
        <UpdateSchools onSuccess={onSubmitProp} initialData={initialData} />
      );
    },
    delete: (initialData: any, onDeleteRequest: any) => {
      return <DeleteSchools data={initialData} onSuccess={onDeleteRequest} />;
    },
  };
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      { accessorKey: "nombre", header: "Nombre" },

      {
        accessorFn: (row) => row.carreras[0].count,
        id: "carreras",

        header: "Cantidad de carreras",

        cell: (info) => (
          <div className="px-3 py-2 truncate max-w-xs">
            {info.getValue()?.toString() || "-"}
          </div>
        ),
      },
      {
        accessorFn: (row) => row.dependencias[0].count,
        id: "dependencias",

        header: "Cantidad de dependencias",

        cell: (info) => (
          <div className="px-3 py-2 truncate max-w-xs">
            {info.getValue()?.toString() || "-"}
          </div>
        ),
      },
    ],
    [],
  );
  // gestionar quien entra a la pagina
  useEffect(() => {
    if (!isAdminOrSuperAdmin($role)) {
      // navergar pero que sea despues de tres segundo y que no sea del lado del cliente
      const set = setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      setTimerID(set);
    } else {
      timerID && clearTimeout(timerID);
    }
  }, [$role]);
  if (!isAdminOrSuperAdmin($role)) {
    return (
      <section className="flex justify-start items-center h-full flex-col flex-1 pt-4">
        <div>
          no tiene permiso para acceder a esta pagina, sera rederijido en tres
          segundo
        </div>
      </section>
    );
  }

  return (
    <div className="p-6">
      {toast && (
        <Toast
          duration={toast.duration}
          message={toast.message}
          title={toast.title}
          type="success"
          onClose={() => {
            setToast(null);
          }}
        />
      )}
      <DynamicTable
        //selection

        // Datos
        data={data || []}
        columns={columns}
        filters={filters}
        modalContents={modalContents}
        title="Escuelas"
        pageSize={3}
        // Estado controlado
        activeFilters={activeFilters}
        globalFilter={globalFilter}
        // Callbacks
        onFiltersChange={setActiveFilters}
        onGlobalFilterChange={setGlobalFilter}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        onClearAllFilters={handleClearAllFilters}
        onEditRequest={handleEditRequest}
        onDeleteRequest={handleDeleteRequest}
        onCreateRequest={handleCreateRequest}
        enableFilters={true}
        enableRowSelection={true}
      />
    </div>
  );
};

export default SchoolsAdminPage;
