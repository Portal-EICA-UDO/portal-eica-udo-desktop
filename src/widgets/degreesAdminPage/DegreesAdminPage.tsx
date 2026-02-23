// pages/UsuariosPage.tsx
import { useState, useCallback, useEffect, use } from "react";
import { DynamicTable } from "@shared/ui/react/DynamicTable";

import type { FilterConfig, ActiveFilter } from "@shared/types";
import { CreateDegrees } from "./ui/CreateDegrees";
import { getDegress } from "./api";
import { supabase } from "@shared/api";
import { UpdateDegrees } from "./ui/UpdateDegrees";
import { DeleteDegrees } from "./ui/DeleteDegrees";
import type { DegreeTable } from "./types";
import { role } from "@features/auth/nanostore";
import { useStore } from "@nanostores/react";
import { isAdminOrSuperAdmin } from "@features/auth/lib";
import Toast from "@shared/ui/react/Toast";

type Escuela = {
  id: string;
  nombre: string;
};

const UsuariosPage = () => {
  const $role = useStore(role);

  // Estado centralizado en el padre
  const [data, setData] = useState<any[]>();
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [opciones, setOpciones] = useState<Escuela[]>([]);
  const [toast, setToast] = useState<{
    id: string;
    type: string;
    message: string;
    title: string;
    duration: number;
  } | null>(null);
  const [timerID, setTimerID] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDegress();
      setData(data);
      const respEsc = await supabase.from("escuelas").select("nombre, id");
      if (respEsc.error) {
        setOpciones([]);
      } else {
        setOpciones(respEsc.data || []);
      }
    };
    fetchData();
  }, []);

  // Definición de filtros
  const filters: FilterConfig[] = [
    {
      key: "nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Buscar por nombre",
    },
    {
      key: "descripcion",
      label: "Descripción",
      type: "text",
      placeholder: "Buscar por descripción",
    },
    {
      key: "escuela",
      label: "Escuela",
      type: "select",
      options: opciones.map((escuela) => ({
        label: escuela.nombre,
        value: escuela.nombre,
      })),
    },
  ];

  // Handlers de filtros
  const handleApplyFilter = useCallback(
    (key: string, value: any, type: FilterConfig["type"]) => {
      setActiveFilters((prev) => {
        const existing = prev.filter((f) => f.key !== key);
        if (value === "" || value === null || value === undefined) {
          return existing;
        }

        // Validar rango
        if (type === "range") {
          const range = value as { min?: number; max?: number };
          if (range.min === undefined && range.max === undefined) {
            return existing;
          }
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
    setActiveFilters((prev) => prev.filter((f) => f.key !== key));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setGlobalFilter("");
  }, []);

  // Handlers de CRUD
  const handleCreateRequest = useCallback((item: any) => {
    setData((prev) => [...(prev as any[]), item]);
  }, []);

  const handleEditRequest = useCallback((item: any) => {
    setData((prev) =>
      (prev as any[]).map((u) => (u.id === item.id ? item : u)),
    );
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: "Carrera editada",
      message: "Carrera editada correctamente",
      duration: 5000,
    });
  }, []);

  const handleDeleteRequest = useCallback((items: any[]) => {
    setData((prev) => (prev as []).filter((u) => !items.includes(u)));
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: items.length > 1 ? "Carreras eliminadas" : "Carrera eliminada",
      message:
        items.length > 1
          ? "Carreras eliminadas correctamente"
          : "Carrera eliminada correctamente",
      duration: 5000,
    });
  }, []);

  // Modal contents (definidos en el padre)
  const modalContents = {
    create: (onSuccess: (data: any) => void) => (
      <CreateDegrees onSuccess={onSuccess} />
    ),
    edit: (initialData: DegreeTable, onSubmitProp: any) => (
      <UpdateDegrees
        initialData={initialData}
        onSubmitProp={onSubmitProp}
        schools={opciones}
      />
    ),
    delete: (initialData: any, onDeleteRequest: any) => (
      <DeleteDegrees data={initialData} onSuccess={onDeleteRequest} />
    ),
  };

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
        // Datos
        data={data || []}
        columns={[
          { accessorKey: "codigo", header: "Código" },
          { accessorKey: "nombre", header: "Nombre" },
          { accessorKey: "descripcion", header: "Descripcion" },
          {
            accessorKey: "escuela",
            header: "Escuela",
            // cell: ({ getValue }: any) => (
            //   <span className={`px-2 py-1 text-xs font-medium rounded-full `}>
            //     {opciones.find((o) => o.id === getValue())?.nombre}
            //   </span>
            // ),
          },
        ]}
        filters={filters}
        modalContents={modalContents}
        title="Carreras"
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

export default UsuariosPage;
