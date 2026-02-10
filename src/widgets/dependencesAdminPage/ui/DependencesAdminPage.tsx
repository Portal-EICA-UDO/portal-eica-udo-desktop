import { DynamicTable } from "@shared/ui/react/DynamicTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActiveFilter, FilterConfig } from "@shared/types";

import { useStore } from "@nanostores/react";
import { role } from "@features/auth/nanostore";
import type { DependenceTable } from "../types";
import { getDegrees, getDependences, getSchools } from "../api";
import { CreateDependences } from "./CreateDependences";
import { getStaff } from "@widgets/dependencesAdminPage/api";
import { UpdateDependences } from "./UpdateDependences";
import { DeleteDependences } from "./DeleteDependences";

export const DependencesAdminPage = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [data, setData] = useState<DependenceTable[]>([]);
  // crear el estado de degree y de schools para pasarselos como props a los formularios que usaran esos datos como selects
  const [degrees, setDegrees] = useState<{ id: string; nombre: string }[]>([]);
  const [schools, setSchools] = useState<{ id: string; nombre: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; nombre: string }[]>([]);

  const $role = useStore(role);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getDependences();
      const schools = await getSchools();
      const degrees = await getDegrees();
      const staff = await getStaff();
      setData(data);
      setDegrees(degrees);
      setSchools(schools);
      setStaff(staff);

      setFilters((prev) => {
        return prev.map((f) => {
          if (f.key === "escuela_nombre") {
            return {
              ...f,
              options: schools.map((escuela) => ({
                value: escuela.nombre,
                label: escuela.nombre,
              })),
            };
          }
          if (f.key === "carrera_nombre") {
            return {
              ...f,
              options: degrees.map((degrees) => ({
                value: degrees.nombre,
                label: degrees.nombre,
              })),
            };
          }

          return f;
        });
      });
    };
    fetchData();
  }, []);
  // Definición de filtros
  const [filters, setFilters] = useState<FilterConfig[]>([
    {
      key: "materia_nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Buscar por nombre",
    },

    {
      key: "escuela_nombre",
      label: "escuela",
      type: "select",
      options: [],
    },
    {
      key: "carrera_nombre",
      label: "Carrera",
      type: "select",
      options: [],
    },
  ]);
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
  }, []);

  const handleDeleteRequest = useCallback((items: any[]) => {
    setData((prev) => (prev as []).filter((u) => !items.includes(u)));
  }, []);

  const columns = useMemo<ColumnDef<DependenceTable, any>[]>(
    () => [
      { accessorKey: "nombre", header: "Nombre" },

      { accessorKey: "carrera", header: "Carrera" },
      { accessorKey: "coordinador", header: "Coordinador" },
      { accessorKey: "descripcion", header: "Descripción" },
      { accessorKey: "escuela", header: "Escuela" },
      { accessorKey: "mision", header: "Mision" },
      { accessorKey: "vision", header: "Vision" },
      { accessorKey: "objetivos", header: "Objetivos" },
    ],
    [],
  );

  const modalContents = {
    create: (onSuccess: (data: any) => void) => {
      return (
        <CreateDependences
          onSuccess={onSuccess}
          degrees={degrees}
          schools={schools}
          staff={staff}
        />
      );
    },
    edit: (initialData: any, onSubmitProp: any) => {
      return (
        // <UpdateSchools onSuccess={onSubmitProp} initialData={initialData} />
        <UpdateDependences
          onSuccess={onSubmitProp}
          initialData={initialData}
          degrees={degrees}
          schools={schools}
          staff={staff}
        />
      );
    },
    delete: (initialData: any, onDeleteRequest: any) => {
      return (
        <DeleteDependences data={initialData} onSuccess={onDeleteRequest} />
      );
    },
  };
  // gestionar quien entra a la pagina
  // useEffect(() => {
  //   if (!isAdminOrSuperAdmin($role)) {
  //     // navegar pero que sea despues de tres segundo y que no sea del lado del cliente
  //     setTimeout(() => {
  //       window.location.href = "/";
  //     }, 3000);
  //   }
  // }, [$role]);
  // if (!isAdminOrSuperAdmin($role)) {
  //   return (
  //     <section className="flex justify-start items-center h-full flex-col flex-1 pt-4">
  //       <div>
  //         no tiene permiso para acceder a esta pagina, sera rederijido en tres
  //         segundo
  //       </div>
  //     </section>
  //   );
  // }
  return (
    <div className="p-6">
      <DynamicTable
        //selection

        // Datos
        data={data || []}
        columns={columns}
        filters={filters}
        modalContents={modalContents}
        title="Dependencias"
        pageSize={10}
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
