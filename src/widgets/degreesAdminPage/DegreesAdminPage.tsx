// pages/UsuariosPage.tsx
import { useState, useCallback, useEffect, use } from "react";
import { DynamicTable } from "@shared/ui/react/DynamicTable";

import type { FilterConfig, ActiveFilter } from "@shared/types";
import { CreateDegrees } from "./ui/CreateDegrees";
import { getDegress } from "./api";
import { supabase } from "@shared/api";
import { UpdateDegrees } from "./ui/UpdateDegrees";
import { DeleteDegrees } from "./ui/DeleteDegrees";
import type { Data } from "./types";

type Escuela = {
  id: string;
  nombre: string;
};

const UsuariosPage = () => {
  // const initialData = [
  //   { id: 1, name: "John Doe", age: 25, city: "New York" },
  //   { id: 2, name: "Jane Smith", age: 30, city: "London" },
  //   { id: 3, name: "Bob Johnson", age: 35, city: "Paris" },
  //   { id: 4, name: "Alice Williams", age: 40, city: "Tokyo" },
  //   { id: 5, name: "Charlie Brown", age: 45, city: "Sydney" },
  //   { id: 6, name: "Eve Green", age: 50, city: "Beijing" },
  //   { id: 7, name: "Frank White", age: 55, city: "Tokyo" },
  //   { id: 8, name: "Grace Black", age: 60, city: "Paris" },
  //   { id: 9, name: "Harry Green", age: 65, city: "New York" },
  //   { id: 10, name: "Ivy Blue", age: 70, city: "London" },
  // ];
  // Estado centralizado en el padre
  const [data, setData] = useState<any[]>();
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [opciones, setOpciones] = useState<Escuela[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDegress();
      setData(data);
      const respEsc = await supabase.from("escuelas").select("nombre, id");
      if (respEsc.error) {
        console.error("Error fetching escuelas:", respEsc.error);
        setOpciones([]);
      } else {
        setOpciones(respEsc.data || []);
      }
    };
    fetchData();
  }, []);

  // // Definición de filtros
  // const filters: FilterConfig[] = [
  //   {
  //     key: "name",
  //     label: "Nombre",
  //     type: "text",
  //     placeholder: "Buscar por nombre",
  //   },
  //   {
  //     key: "city",
  //     label: "Ciudad",
  //     type: "select",
  //     options: [
  //       { label: "New York", value: "New York" },
  //       { label: "London", value: "London" },
  //       { label: "Paris", value: "Paris" },
  //       { label: "Tokyo", value: "Tokyo" },
  //       { label: "Sydney", value: "Sydney" },
  //       { label: "Beijing", value: "Beijing" },
  //     ],
  //   },
  //   { key: "age", label: "Edad", type: "range", min: 18, max: 100 },
  // ];

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
      label: "Ciudad",
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
      console.log("estoy en handleApplyFilter");
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
    [filters]
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
    // Abrir modal de crear (si usas estado para controlarlo)
    console.log("handleCreateRequest");
    setData((prev) => [...(prev as any[]), item]);
  }, []);

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  const handleEditRequest = useCallback((item: any) => {
    console.log("item in handleEdit: ", item);
    console.log("data in handleEdit: ", data);
    setData((prev) =>
      (prev as any[]).map((u) => (u.id === item.id ? item : u))
    );
  }, []);

  const handleDeleteRequest = useCallback((items: any[]) => {
    console.log("delete items: ", items);
    setData((prev) => (prev as []).filter((u) => !items.includes(u)));
  }, []);

  // Modal contents (definidos en el padre)
  const modalContents = {
    create: (onSuccess: (data: any) => void) => (
      <CreateDegrees onSuccess={onSuccess} />
    ),
    edit: (initialData: Data, onSubmitProp: any) => (
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

  return (
    // <div className="p-6">
    //   <DynamicTable
    //     //selection

    //     // Datos
    //     data={data}
    //     columns={[
    //       { accessorKey: "name", header: "Nombre" },
    //       { accessorKey: "email", header: "Email" },
    //       { accessorKey: "city", header: "Ciudad" },
    //       { accessorKey: "age", header: "Edad" },
    //     ]}
    //     filters={filters}
    //     modalContents={modalContents}
    //     title="Usuarios"
    //     pageSize={3}
    //     // Estado controlado
    //     activeFilters={activeFilters}
    //     globalFilter={globalFilter}
    //     // Callbacks
    //     onFiltersChange={setActiveFilters}
    //     onGlobalFilterChange={setGlobalFilter}
    //     onApplyFilter={handleApplyFilter}
    //     onClearFilter={handleClearFilter}
    //     onClearAllFilters={handleClearAllFilters}
    //     onEditRequest={handleEditRequest}
    //     onDeleteRequest={handleDeleteRequest}
    //     onCreateRequest={handleCreateRequest}
    //     enableFilters={true}
    //     enableRowSelection={true}
    //   />
    // </div>
    <div className="p-6">
      <DynamicTable
        //selection

        // Datos
        data={data || []}
        columns={[
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
