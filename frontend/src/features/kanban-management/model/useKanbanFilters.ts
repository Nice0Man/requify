import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  KanbanFilter,
  KanbanItemPriority,
} from "@/entities/kanban/model/types";

export const useKanbanFilters = (_type: string) => {
  const [searchParams] = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<KanbanFilter>(() => ({
    search: searchParams.get("search") || "",
    status: (searchParams.get("status")?.split(",") as any[]) || [],
    priority:
      (searchParams.get("priority")?.split(",") as KanbanItemPriority[]) || [],
    assignee: searchParams.get("assignee")?.split(",") || [],
    labels: searchParams.get("labels")?.split(",") || [],
    project_id: searchParams.get("project_id")
      ? Number(searchParams.get("project_id"))
      : undefined,
  }));

  const [sortBy, setSortBy] = useState<"priority" | "date" | "title">(
    "priority"
  );

  // Individual filter update functions
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setPriority = useCallback((priority: KanbanItemPriority[]) => {
    setFilters((prev) => ({ ...prev, priority }));
  }, []);

  const setAssignee = useCallback((assignee: string[]) => {
    setFilters((prev) => ({ ...prev, assignee }));
  }, []);

  const setLabels = useCallback((labels: string[]) => {
    setFilters((prev) => ({ ...prev, labels }));
  }, []);

  const setProjectFilter = useCallback((project_id?: number) => {
    setFilters((prev) => ({ ...prev, project_id }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: KanbanFilter = {
      search: "",
      status: [],
      priority: [],
      assignee: [],
      labels: [],
      project_id: undefined,
      requirement_id: undefined,
      dateRange: undefined,
    };
    setFilters(clearedFilters);
  }, []);

  // Simplified return to match what KanbanWidget expects
  return {
    filter: filters,
    setSearch,
    setPriority,
    setAssignee,
    setLabels,
    setProjectFilter,
    clearFilters,

    // Additional properties that might be expected
    filters,
    sortBy,
    filteredItems: [],
    filterOptions: {
      assignees: [],
      labels: [],
      projects: [],
    },
    hasActiveFilters: false,
    filterSummary: [],
    setSortBy,
    updateFilters: setFilters,
    togglePriority: () => {},
    toggleAssignee: () => {},
    toggleLabel: () => {},
    totalItems: 0,
    filteredCount: 0,
  };
};
