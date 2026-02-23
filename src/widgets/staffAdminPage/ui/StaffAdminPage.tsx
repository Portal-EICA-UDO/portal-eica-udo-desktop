import { DynamicTable } from "@shared/ui/react/DynamicTable";
import { getStaff, getSubjects } from "../api";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MateriaMultiSelect,
  MateriasAsociadas,
  StaffTable,
} from "../types/types";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActiveFilter, FilterConfig } from "@shared/types";
import { RCActiveModalButton } from "@shared/ui/react/RCModalButton";
import { CreateStaffs } from "./CreateStaffs";
import { UpdateStaffs } from "./UpdateStaffs";
import { DeleteStaffs } from "./DeleteStaffs";
import { isAdminOrSuperAdmin } from "@features/auth/lib";
import { useStore } from "@nanostores/react";
import { role } from "@features/auth/nanostore";
import Toast from "@shared/ui/react/Toast";

export const StaffAdminPage = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [data, setData] = useState<StaffTable[]>([]);
  const [materias, setMaterias] = useState<MateriaMultiSelect[]>([]);
  const [toast, setToast] = useState<{
    id: string;
    type: string;
    message: string;
    title: string;
    duration: number;
  } | null>(null);
  const [timerID, setTimerID] = useState<NodeJS.Timeout | null>(null);
  // Definición de filtros
  const [filters, setFilters] = useState<FilterConfig[]>([
    {
      key: "materias",
      label: "Materias o Carreras asociadas",
      type: "text",
    },
  ]);
  const $role = useStore(role);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getStaff();
      const materias = await getSubjects();
      setMaterias(materias);
      setData(data);
    };
    fetchData();
  }, []);

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
      title: "Staff editado",
      message: "Staff editado correctamente",
      duration: 5000,
    });
  }, []);

  const handleDeleteRequest = useCallback((items: any[]) => {
    setData((prev) => (prev as []).filter((u) => !items.includes(u)));
    setToast({
      id: Date.now().toString(),
      type: "success",
      title: items.length > 1 ? "Staff's eliminados" : "Staff eliminado",
      message:
        items.length > 1
          ? "Staff's eliminados correctamente"
          : "Staff eliminado correctamente",
      duration: 5000,
    });
  }, []);

  const columns = useMemo<ColumnDef<StaffTable, any>[]>(
    () => [
      { accessorKey: "cedula", header: "Cedula" },
      { accessorKey: "nombre", header: "Nombre" },
      { accessorKey: "apellido", header: "Apellido" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "telefono", header: "Telefono" },
      { accessorKey: "posicion", header: "Posicion" },
      { accessorKey: "condicion", header: "Condicion" },

      {
        accessorFn: (row) => row.materiasAsociadas as MateriasAsociadas[],
        id: "materias",

        header: "Cantidad de carreras",
        filterFn: (row, id, value) => {
          //quiero que se le pase un nombre de carrera o materia y que en base a eso me retorne aquellos que tengan la carrera o la materia en comun
          return (
            row.original.materiasAsociadas?.some((materia) => {
              //revisar si tiene la materia o la carrera pero que no sea case sensitive
              return (
                materia.carrera.toLowerCase().includes(value.toLowerCase()) ||
                materia.nombre.toLowerCase().includes(value.toLowerCase())
              );
            }) ?? false
          );
        },
        cell: (info) => (
          <RCActiveModalButton label="Ver materias">
            <div className="px-3 py-2 truncate max-w-xs">
              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Materias que imparte:
                </h4>
                <ul className="space-y-2">
                  {(info.getValue() as MateriasAsociadas[]).length > 0 &&
                    (info.getValue() as MateriasAsociadas[]).map((materia) => (
                      <li className="flex items-start gap-2" key={materia.id}>
                        <svg
                          className="w-5 h-5 text-[#0A5C8D] shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <span className="text-gray-700 whitespace-normal wrap-break-word">
                            {materia.nombre}
                            {materia.carrera ? (
                              <span className="text-gray-600">
                                {" "}
                                de la carrera{" "}
                                <span className="font-medium">
                                  {materia.carrera}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-500 italic ">
                                (sin carrera asignada)
                              </span>
                            )}
                          </span>
                        </div>
                      </li>
                    ))}
                  {(info.getValue() as MateriasAsociadas[]).length === 0 && (
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#0A5C8D] shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <span className="text-gray-700">
                          No tiene materias asociadas
                        </span>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </RCActiveModalButton>
        ),
      },
    ],
    [],
  );

  const modalContents = {
    create: (onSuccess: (data: any) => void) => {
      return <CreateStaffs onSuccess={onSuccess} materias={materias} />;
    },
    edit: (initialData: any, onSubmitProp: any) => {
      return (
        // <UpdateSchools onSuccess={onSubmitProp} initialData={initialData} />
        <UpdateStaffs
          onSuccess={onSubmitProp}
          initialData={initialData}
          materias={materias}
        />
      );
    },
    delete: (initialData: any, onDeleteRequest: any) => {
      return (
        // <UpdateSchools onSuccess={onSubmitProp} initialData={initialData} />
        <DeleteStaffs data={initialData} onSuccess={onDeleteRequest} />
      );
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
        columns={columns}
        filters={filters}
        modalContents={modalContents}
        title="Staff"
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
