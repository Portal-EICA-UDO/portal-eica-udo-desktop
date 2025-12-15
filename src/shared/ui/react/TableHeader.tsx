// components/TableHeader.tsx

import type { FilterConfig, ActiveFilter } from "@shared/types";
import { useFilterState } from "@widgets/degreesAdminPage/hooks/useFilterState";
import { RCActiveModalButton } from "@shared/ui/react/RCModalButton";
import { useEffect } from "react";
import type { Table } from "@tanstack/react-table";
import type { TableModalContents } from "@shared/types/table";

interface TableHeaderProps {
  title: string;
  filters: FilterConfig[];
  modalContents: TableModalContents;
  selectedCount: number;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  activeFilters: ActiveFilter[];
  globalFilter: string;
  enableFilters: boolean;
  selectedItems: any[];
  // Callbacks
  onGlobalFilterChange: (value: string) => void;
  onApplyFilter?: (
    filterKey: string,
    value: any,
    type: FilterConfig["type"]
  ) => void;
  onClearFilter?: (filterKey: string) => void;
  onClearAllFilters?: () => void;
  onCreateRequest?: (newData: any) => void;
  onEditRequest?: (newData: any) => void;
  onDeleteRequest?: () => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  selectedItems,
  title,
  filters,
  modalContents,
  selectedCount,
  canCreate,
  canEdit,
  canDelete,
  activeFilters,
  globalFilter,
  enableFilters,
  onGlobalFilterChange,
  onApplyFilter,
  onClearFilter,
  onClearAllFilters,
  onCreateRequest,
  onEditRequest,
  onDeleteRequest,
}) => {
  const {
    selectedFilterKey,
    setSelectedFilterKey,
    filterValues,
    filterRanges,
    updateFilterValue,
    updateFilterRange,
    getFilterValue,
    getFilterRange,
    clearFilterValues,
    clearAllFilterValues,
  } = useFilterState(filters);

  useEffect(() => {
    console.log("activeFilters: ", activeFilters);
    if (activeFilters.length <= 0) {
      console.log("no active filters");

      //limpiar filtros
      clearAllFilterValues();
    }
  }, [activeFilters]);

  useEffect(() => {
    console.log(
      "selectedCount: ",
      selectedCount,
      "canEdit: ",
      canEdit,
      "canDelete: ",
      canDelete
    );
  }, [selectedCount, canEdit, canDelete]);

  const selectedFilter = filters.find((f) => f.key === selectedFilterKey);

  // Obtener valores específicos para el filtro seleccionado
  const getCurrentValue = () => {
    if (!selectedFilterKey) return "";
    return getFilterValue(selectedFilterKey) || "";
  };

  const getCurrentRange = () => {
    if (!selectedFilterKey) return {};
    return getFilterRange(selectedFilterKey) || {};
  };

  const handleApplyFilter = () => {
    if (!selectedFilter || !onApplyFilter) return;

    let valueToApply: any;

    if (selectedFilter.type === "range") {
      const range = getCurrentRange();
      valueToApply = range;
    } else {
      valueToApply = getCurrentValue();
    }

    onApplyFilter(selectedFilter.key, valueToApply, selectedFilter.type);
    setSelectedFilterKey(null);
  };

  const handleClearCurrentFilter = () => {
    if (!selectedFilterKey) return;
    clearFilterValues(selectedFilterKey);
    onClearFilter?.(selectedFilterKey);
  };

  const handleClearAll = () => {
    clearAllFilterValues();
    onClearAllFilters?.();
  };

  const renderFilterInput = () => {
    if (!selectedFilter) return null;

    switch (selectedFilter.type) {
      case "text":
        const currentTextValue = getCurrentValue();
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={currentTextValue}
              onChange={(e) =>
                updateFilterValue(selectedFilter.key, e.target.value)
              }
              placeholder={
                selectedFilter.placeholder ||
                `Filtrar por ${selectedFilter.label}`
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
              {currentTextValue && (
                <button
                  onClick={handleClearCurrentFilter}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        );

      case "range":
        const currentRange = getCurrentRange();
        return (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Mínimo"
                value={currentRange.min || ""}
                onChange={(e) =>
                  updateFilterRange(
                    selectedFilter.key,
                    e.target.value ? Number(e.target.value) : undefined,
                    currentRange.max
                  )
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">a</span>
              <input
                type="number"
                placeholder="Máximo"
                value={currentRange.max || ""}
                onChange={(e) =>
                  updateFilterRange(
                    selectedFilter.key,
                    currentRange.min,
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Rango
              </button>
              {(currentRange.min !== undefined ||
                currentRange.max !== undefined) && (
                <button
                  onClick={handleClearCurrentFilter}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        );

      case "select":
        const currentSelectValue = getCurrentValue();
        return (
          <div className="space-y-2">
            <select
              value={currentSelectValue}
              onChange={(e) => {
                const value = e.target.value;
                updateFilterValue(selectedFilter.key, value);
                // Aplicar inmediatamente para selects
                onApplyFilter?.(selectedFilter.key, value, "select");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {selectedFilter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {currentSelectValue && (
              <button
                onClick={handleClearCurrentFilter}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        );

      case "date":
        const currentDateValue = getCurrentValue();
        return (
          <div className="flex gap-2">
            <input
              type="date"
              value={currentDateValue}
              onChange={(e) => {
                updateFilterValue(selectedFilter.key, e.target.value);
                onApplyFilter?.(selectedFilter.key, e.target.value, "date");
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {currentDateValue && (
              <button
                onClick={handleClearCurrentFilter}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Formatear valor para mostrar en badge
  const formatFilterValue = (filter: ActiveFilter): string => {
    const { value, type } = filter;

    if (value === undefined || value === null || value === "") return "";

    switch (type) {
      case "range":
        const range = value as { min?: number; max?: number };
        const parts = [];
        if (range.min !== undefined) parts.push(`≥${range.min}`);
        if (range.max !== undefined) parts.push(`≤${range.max}`);
        return parts.join(" - ");

      case "select":
        const option = filters
          .find((f) => f.key === filter.key)
          ?.options?.find((o) => o.value === value);
        return option?.label || String(value);

      case "boolean":
        return value === true ? "Sí" : "No";

      default:
        return String(value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
      {/* Título y Botón Crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600 mt-1">Gestión de registros</p>
        </div>

        {canCreate && modalContents.create && (
          <RCActiveModalButton label="Crear Nuevo">
            {modalContents.create(onCreateRequest)}
          </RCActiveModalButton>
        )}
      </div>

      {/* Filtros */}
      {enableFilters && (
        <div className="space-y-4">
          {/* Filtros Activos */}
          {activeFilters.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">
                    Filtros aplicados:
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Limpiar todos
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <div
                    key={filter.key}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span className="font-medium">{filter.label}:</span>
                    <span>{formatFilterValue(filter)}</span>
                    <button
                      onClick={() => onClearFilter?.(filter.key)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Búsqueda Global */}
          <div className="relative">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              placeholder="Buscar en todos los campos..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {globalFilter && (
              <button
                onClick={() => onGlobalFilterChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros Avanzados */}
          {filters.length > 0 && (
            <div className="space-y-3">
              <select
                value={selectedFilterKey || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedFilterKey(value || null);
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Agregar filtro avanzado...</option>
                {filters.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}{" "}
                    {activeFilters.some((f) => f.key === filter.key)
                      ? "(aplicado)"
                      : ""}
                  </option>
                ))}
              </select>

              {selectedFilter && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">
                      {selectedFilter.label}
                    </span>
                    <button
                      onClick={() => setSelectedFilterKey(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  {renderFilterInput()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Acciones para Seleccionados */}
      {selectedCount > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                {selectedCount}
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {selectedCount} elemento{selectedCount !== 1 ? "s" : ""}{" "}
                  seleccionado{selectedCount !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-blue-700">
                  Seleccione una acción para continuar
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <RCActiveModalButton label="Editar">
                  {modalContents.edit(selectedItems[0], onEditRequest)}
                  {/* <button
                    onClick={onEditRequest}
                    className="px-4 py-1.5 bg-red-600 rounded-full flex justify-center hover:scale-105 transition-transform"
                  >
                    Editar
                  </button> */}
                </RCActiveModalButton>
              )}

              {canDelete && modalContents.delete && (
                <RCActiveModalButton
                  label={`Eliminar ${
                    selectedCount > 1 ? `(${selectedCount})` : ""
                  }`}
                >
                  {modalContents.delete(selectedItems, onDeleteRequest)}
                  {/* <button
                    onClick={onDeleteRequest}
                    className="px-4 py-1.5 bg-red-600 rounded-full flex justify-center hover:scale-105 transition-transform"
                  >
                    Eliminar
                  </button> */}
                </RCActiveModalButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableHeader;
