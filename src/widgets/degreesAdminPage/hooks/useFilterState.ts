// hooks/useFilterState.ts
import { useState, useCallback, useEffect } from "react";
import type { FilterConfig } from "@shared/types";
import { fi } from "zod/locales";

export const useFilterState = (initialFilters: FilterConfig[] = []) => {
  const [selectedFilterKey, setSelectedFilterKey] = useState<string | null>(
    null
  );

  // Estado para valores de cada filtro individual
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [filterRanges, setFilterRanges] = useState<
    Record<string, { min?: number; max?: number }>
  >({});

  // Actualizar valor específico de un filtro
  const updateFilterValue = useCallback((key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Actualizar rango específico de un filtro
  const updateFilterRange = useCallback(
    (key: string, min?: number, max?: number) => {
      setFilterRanges((prev) => ({
        ...prev,
        [key]: { min, max },
      }));
    },
    []
  );

  // Obtener valor actual de un filtro
  const getFilterValue = useCallback(
    (key: string) => {
      return filterValues[key];
    },
    [filterValues]
  );

  // Obtener rango actual de un filtro
  const getFilterRange = useCallback(
    (key: string) => {
      return filterRanges[key] || {};
    },
    [filterRanges]
  );

  // Limpiar valores de un filtro específico
  const clearFilterValues = useCallback((key: string) => {
    setFilterValues((prev) => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });

    setFilterRanges((prev) => {
      const newRanges = { ...prev };
      delete newRanges[key];
      return newRanges;
    });
  }, []);

  useEffect(() => {
    console.log("filterValues: ", filterValues);
  }, [filterValues]);

  // Limpiar todos los valores
  const clearAllFilterValues = useCallback(() => {
    setFilterValues({});
    setFilterRanges({});
  }, []);

  return {
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
  };
};
