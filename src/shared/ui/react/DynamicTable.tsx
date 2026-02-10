// components/DynamicTable.tsx
import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import TableHeader from "./TableHeader";
import type { TableProps } from "@shared/types/table";
import { fi } from "zod/locales";

export const DynamicTable = <T extends { id: string | number }>({
  data,
  columns,
  filters = [],
  modalContents,
  title = "Tabla de Datos",
  pageSize = 10,
  enableRowSelection = true,
  enableFilters = true,
  className = "",

  // Estado controlado
  activeFilters = [],
  globalFilter = "",

  // Callbacks
  onFiltersChange,
  onGlobalFilterChange,
  onApplyFilter,
  onClearFilter,
  onClearAllFilters,
  onEditRequest,
  onDeleteRequest,
  onCreateRequest,
}: TableProps<T>) => {
  // Estado interno para selección y sorting
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  // Convertir activeFilters a formato TanStack
  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      activeFilters.map((filter) => ({
        id: filter.key,
        value: filter.value,
      })),
    [activeFilters],
  );

  // Configurar columnas
  const tableColumns = useMemo(() => {
    const cols = columns.map((col) => ({
      accessorKey: col.accessorKey,
      header: col.header,
      cell:
        col.cell ||
        (({ getValue }: any) => (
          <div className="px-3 py-2 truncate max-w-xs">
            {getValue()?.toString() || "-"}
          </div>
        )),
      enableSorting: col.enableSorting ?? true,
      ...col,
    }));

    if (enableRowSelection) {
      cols.unshift({
        id: "select",
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
      } as any);
    }

    return cols;
  }, [columns, enableRowSelection]);

  // Configurar TanStack Table
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (value) => onGlobalFilterChange?.(value as string),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    enableRowSelection,
  });

  // Obtener elementos seleccionados
  const selectedItems = useMemo(() => {
    const selectedIds = Object.keys(rowSelection);
    return data.filter((_, index) => selectedIds.includes(index.toString()));
  }, [rowSelection, data]);

  // Handlers para acciones
  const handleEdit = (newData: T) => {
    if (selectedItems.length === 1) {
      onEditRequest?.(newData);
      // Limpiar selección luego de editar
      setRowSelection({});
      // Limpiar filtro luego de editar
      onClearAllFilters?.();
    }
  };

  const handleCreate = (newData: T) => {
    onCreateRequest?.(newData);
    // Limpiar selección luego de crear
    setRowSelection({});
    // Limpiar filtro luego de crear
    onClearAllFilters?.();
  };

  const handleDelete = () => {
    if (selectedItems.length > 0) {
      onDeleteRequest?.(selectedItems);
      // Limpiar selección luego de eliminar
      setRowSelection({});
      // Limpiar filtro luego de eliminar
      onClearAllFilters?.();
    }
  };

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* Header */}
      <TableHeader
        title={title}
        filters={filters}
        modalContents={modalContents}
        selectedItems={selectedItems}
        selectedCount={selectedItems.length}
        canCreate={!!modalContents.create}
        canEdit={selectedItems.length === 1 && !!modalContents.edit}
        canDelete={selectedItems.length > 0 && !!modalContents.delete}
        activeFilters={activeFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={onGlobalFilterChange}
        onApplyFilter={onApplyFilter}
        onClearFilter={onClearFilter}
        onClearAllFilters={onClearAllFilters}
        onCreateRequest={handleCreate}
        onEditRequest={handleEdit}
        onDeleteRequest={handleDelete}
        enableFilters={enableFilters}
      />

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  row.getIsSelected() ? "bg-blue-50" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Estado vacío */}
        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              No se encontraron registros
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFilters.length > 0 || globalFilter
                ? "Intenta con otros filtros de búsqueda"
                : "No hay datos disponibles"}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}

      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        {table.getPageCount() > 1 && (
          <div className="text-sm text-gray-700">
            Página{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            de <span className="font-medium">{table.getPageCount()}</span>
            {" • "}
            <span className="font-medium">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            resultado(s) total
          </div>
        )}

        {/* seccion para cambiar la cantidad de filas */}
        <div className="flex items-center gap-1">
          <label className="text-sm text-gray-700">Filas por página:</label>
          <select
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination({
                pageIndex: 0,
                pageSize: Number(e.target.value),
              });
              console.log({
                pageIndex: 0,
                pageSize: Number(e.target.value),
              });
            }}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 "
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        {table.getPageCount() > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex space-x-1">
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  let pageIndex;
                  if (table.getPageCount() <= 5) {
                    pageIndex = i;
                  } else if (table.getState().pagination.pageIndex <= 2) {
                    pageIndex = i;
                  } else if (
                    table.getState().pagination.pageIndex >=
                    table.getPageCount() - 3
                  ) {
                    pageIndex = table.getPageCount() - 5 + i;
                  } else {
                    pageIndex = table.getState().pagination.pageIndex - 2 + i;
                  }

                  return (
                    <button
                      key={pageIndex}
                      onClick={() => table.setPageIndex(pageIndex)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        table.getState().pagination.pageIndex === pageIndex
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  );
                },
              )}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
