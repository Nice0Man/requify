import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  KanbanType,
  KanbanFilter,
  KanbanCard,
  KanbanVariant,
} from "@/entities/kanban";

interface KanbanState {
  // Active kanban type
  activeType: KanbanType;

  // Active variant for display
  activeVariant: KanbanVariant;

  // Filters for each kanban type
  filters: Record<KanbanType, KanbanFilter>;

  // Loading states
  loadingStates: Record<KanbanType, boolean>;

  // Error states
  errorStates: Record<KanbanType, string | null>;

  // Data cache
  dataCache: Record<KanbanType, KanbanCard[]>;

  // UI state
  isFullscreen: boolean;
  showFilters: boolean;
  collapsedColumns: Record<string, boolean>;

  // Selected items
  selectedItems: Record<KanbanType, number[]>;

  // Actions
  setActiveType: (type: KanbanType) => void;
  setActiveVariant: (variant: KanbanVariant) => void;
  updateFilter: (type: KanbanType, filter: Partial<KanbanFilter>) => void;
  clearFilter: (type: KanbanType) => void;
  setLoading: (type: KanbanType, loading: boolean) => void;
  setError: (type: KanbanType, error: string | null) => void;
  updateData: (type: KanbanType, data: KanbanCard[]) => void;
  clearData: (type: KanbanType) => void;
  toggleFullscreen: () => void;
  toggleFilters: () => void;
  toggleColumn: (columnId: string) => void;
  selectItem: (type: KanbanType, itemId: number) => void;
  deselectItem: (type: KanbanType, itemId: number) => void;
  clearSelection: (type: KanbanType) => void;
  reset: () => void;
}

// Initial state
const initialState = {
  activeType: "requirements" as KanbanType,
  activeVariant: "detailed" as KanbanVariant,

  filters: {
    projects: {
      search: "",
      status: [],
      priority: [],
      assignee: [],
      labels: [],
    },
    requirements: {
      search: "",
      status: [],
      priority: [],
      assignee: [],
      labels: [],
    },
    releases: {
      search: "",
      status: [],
      priority: [],
      assignee: [],
      labels: [],
    },
    tests: {
      search: "",
      status: [],
      priority: [],
      assignee: [],
      labels: [],
    },
  } as Record<KanbanType, KanbanFilter>,

  loadingStates: {
    projects: false,
    requirements: false,
    releases: false,
    tests: false,
  } as Record<KanbanType, boolean>,

  errorStates: {
    projects: null,
    requirements: null,
    releases: null,
    tests: null,
  } as Record<KanbanType, string | null>,

  dataCache: {
    projects: [],
    requirements: [],
    releases: [],
    tests: [],
  } as Record<KanbanType, KanbanCard[]>,

  isFullscreen: false,
  showFilters: true,
  collapsedColumns: {},

  selectedItems: {
    projects: [],
    requirements: [],
    releases: [],
    tests: [],
  } as Record<KanbanType, number[]>,
};

export const useKanbanStore = create<KanbanState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // Type management
    setActiveType: (type: KanbanType) => set({ activeType: type }),

    setActiveVariant: (variant: KanbanVariant) =>
      set({ activeVariant: variant }),

    // Filter management
    updateFilter: (type: KanbanType, filter: Partial<KanbanFilter>) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [type]: { ...state.filters[type], ...filter },
        },
      })),

    clearFilter: (type: KanbanType) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [type]: initialState.filters[type],
        },
      })),

    // Loading state management
    setLoading: (type: KanbanType, loading: boolean) =>
      set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [type]: loading,
        },
      })),

    // Error state management
    setError: (type: KanbanType, error: string | null) =>
      set((state) => ({
        errorStates: {
          ...state.errorStates,
          [type]: error,
        },
      })),

    // Data cache management
    updateData: (type: KanbanType, data: KanbanCard[]) =>
      set((state) => ({
        dataCache: {
          ...state.dataCache,
          [type]: data,
        },
      })),

    clearData: (type: KanbanType) =>
      set((state) => ({
        dataCache: {
          ...state.dataCache,
          [type]: [],
        },
      })),

    // UI state management
    toggleFullscreen: () =>
      set((state) => ({ isFullscreen: !state.isFullscreen })),

    toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

    toggleColumn: (columnId: string) =>
      set((state) => ({
        collapsedColumns: {
          ...state.collapsedColumns,
          [columnId]: !state.collapsedColumns[columnId],
        },
      })),

    // Selection management
    selectItem: (type: KanbanType, itemId: number) =>
      set((state) => ({
        selectedItems: {
          ...state.selectedItems,
          [type]: [...state.selectedItems[type], itemId],
        },
      })),

    deselectItem: (type: KanbanType, itemId: number) =>
      set((state) => ({
        selectedItems: {
          ...state.selectedItems,
          [type]: state.selectedItems[type].filter((id) => id !== itemId),
        },
      })),

    clearSelection: (type: KanbanType) =>
      set((state) => ({
        selectedItems: {
          ...state.selectedItems,
          [type]: [],
        },
      })),

    // Reset to initial state
    reset: () => set(initialState),
  }))
);

// Selector hooks for better performance
export const useActiveKanbanType = () =>
  useKanbanStore((state) => state.activeType);
export const useActiveKanbanVariant = () =>
  useKanbanStore((state) => state.activeVariant);
export const useKanbanFilter = (type: KanbanType) =>
  useKanbanStore((state) => state.filters[type]);
export const useKanbanData = (type: KanbanType) =>
  useKanbanStore((state) => state.dataCache[type]);
export const useKanbanLoading = (type: KanbanType) =>
  useKanbanStore((state) => state.loadingStates[type]);
export const useKanbanError = (type: KanbanType) =>
  useKanbanStore((state) => state.errorStates[type]);
export const useKanbanSelectedItems = (type: KanbanType) =>
  useKanbanStore((state) => state.selectedItems[type]);
