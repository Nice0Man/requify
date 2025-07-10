import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SidebarState, SidebarItem } from "./types";

interface SidebarStore extends SidebarState {
  // Actions
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobile: (isMobile: boolean) => void;
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  togglePinned: () => void;
  setPinned: (isPinned: boolean) => void;

  // Navigation
  expandedItems: string[];
  toggleExpanded: (itemId: string) => void;
  setExpanded: (itemIds: string[]) => void;

  // Active item
  activeItem: string | null;
  setActiveItem: (itemId: string | null) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      // Initial state - полускрытое состояние по умолчанию
      isCollapsed: true,
      isMobile: false,
      isOpen: true,
      isPinned: true,
      expandedItems: [],
      activeItem: null,

      // Actions
      toggleCollapse: () =>
        set((state) => ({
          isCollapsed: !state.isCollapsed,
        })),

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      toggleMobile: () =>
        set((state) => ({
          isMobile: !state.isMobile,
          isOpen: state.isMobile ? true : state.isOpen,
        })),

      setMobile: (isMobile) =>
        set({
          isMobile,
          isOpen: true,
        }),

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      setOpen: (isOpen) => set({ isOpen }),

      togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),

      setPinned: (isPinned) => set({ isPinned }),

      // Navigation actions
      toggleExpanded: (itemId) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(itemId)
            ? state.expandedItems.filter((id) => id !== itemId)
            : [...state.expandedItems, itemId],
        })),

      setExpanded: (itemIds) => set({ expandedItems: itemIds }),

      setActiveItem: (itemId) => set({ activeItem: itemId }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        isPinned: state.isPinned,
        expandedItems: state.expandedItems,
      }),
      version: 3, // Обновляем версию для двухступенчатого режима
    }
  )
);
