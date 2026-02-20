// pages/UsuariosPage.tsx
import { useState, useCallback, useEffect } from "react";
import { DynamicTable } from "@shared/ui/react/DynamicTable";

import type { FilterConfig, ActiveFilter } from "@shared/types";
import { getDegreesBySchool, getSchools, getSubjects } from "../api";
import type { School } from "../types";
import { CreateSubjects } from "./CreateSubjects";
import { UpdateSubjects } from "./UpdateSubjects";
import { DeleteSubjects } from "./DeleteSubjects";
import { useStore } from "@nanostores/react";
import { role } from "@features/auth/nanostore";
import { isAdminOrSuperAdmin } from "@features/auth/lib";
import Toast from "@shared/ui/react/Toast";
import { set } from "zod";

export const SubjectsAdminPage = () => {
  // Estado centralizado en el padre
  const [data, setData] = useState<any[]>();
  const [degrees, setDegrees] = useState<any>([]);
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
      const subjects = await getSubjects();
      const degrees = await getDegreesBySchool();
      setData(subjects);
      setDegrees(degrees);

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

        // Validar rango
        if (type === "range") {
          const range = value as { min?: number; max?: number };
          if (range.min === undefined && range.max === undefined) {
            return existing;
          }
        }

        // Validar si es select y si es escuela, para que se muestren en el select de carreras las carreras de esa escuela
        if (type === "select") {
          if (key === "escuela_nombre") {
            existing = existing.filter((f) => f.key !== "carrera_nombre");
            const carrerasFiltradas: { id: string; nombre: string }[] =
              degrees[value as "EICA" | "UDO"];
            setFilters((prev) => {
              return prev.map((f) => {
                if (f.key === "carrera_nombre") {
                  return {
                    ...f,
                    options: carrerasFiltradas.map((carrera) => ({
                      value: carrera.nombre,
                      label: carrera.nombre,
                    })),
                  };
                }
                return f;
              });
            });
          }
        }

        const filterConfig = filters.find((f) => f.key === key);
        // en caso de modificar el select de escuela, se debe limpiar el select de carreras

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
      if (key === "escuela_nombre") {
        return prev.filter(
          (f) => f.key !== "carrera_nombre" && f.key !== "escuela_nombre",
        );
      }
      return prev.filter((f) => f.key !== key);
    });
    // Limpiar el select de carreras si se limpia el select de escuela

    if (key === "escuela_nombre") {
      setFilters((prev) => {
        return prev.map((f) => {
          if (f.key === "carrera_nombre") {
            return {
              ...f,
              options: [],
            };
          }
          return f;
        });
      });
    }
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
      return (prev as any[]).map((u) =>
        u.id_materia === item.id_materia ? item : u,
      );
    });
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: "Materia editada",
      message: "Materia editada correctamente",
      duration: 5000,
    });
  }, []);

  const handleDeleteRequest = useCallback((items: any[]) => {
    setData((prev) => (prev as []).filter((u) => !items.includes(u)));
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: items.length > 1 ? "Materias eliminadas" : "Materia eliminada",
      message:
        items.length > 1
          ? "Materias eliminadas correctamente"
          : "Materia eliminada correctamente",
      duration: 5000,
    });
  }, []);

  // Modal contents (definidos en el padre)
  const modalContents = {
    create: (onSuccess: (data: any) => void) => {
      return <CreateSubjects onSuccess={onSuccess} degreesBySchool={degrees} />;
    },
    edit: (initialData: any, onSubmitProp: any) => {
      return (
        <UpdateSubjects
          initialData={initialData}
          onSuccess={onSubmitProp}
          degreesBySchool={degrees}
        />
      );
    },
    delete: (initialData: any, onDeleteRequest: any) => {
      return <DeleteSubjects data={initialData} onSuccess={onDeleteRequest} />;
    },
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
        //selection

        // Datos
        data={data || []}
        columns={[
          { accessorKey: "materia_nombre", header: "Nombre" },

          {
            accessorKey: "escuela_nombre",
            header: "Escuela",
            // cell: ({ getValue }: any) => (
            //   <span className={`px-2 py-1 text-xs font-medium rounded-full `}>
            //     {opciones.find((o) => o.id === getValue())?.nombre}
            //   </span>
            // ),
          },
          { accessorKey: "carrera_nombre", header: "Carrera" },
        ]}
        filters={filters}
        modalContents={modalContents}
        title="Materias"
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

export default SubjectsAdminPage;
