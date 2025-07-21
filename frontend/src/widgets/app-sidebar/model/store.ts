import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { SidebarStore } from "./types";

const DEFAULT_ITEM_ORDER: UniqueIdentifier[] = [
  "dashboard",
  "reports",
  "analytics",
  "notifications",
  "calendar",
  "team",
  "processes",
  "projects",
  "requirements",
  "releases",
];

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      // State
      isCollapsed: false,
      isMobile: false,
      isOpen: false,
      isPinned: false,
      expandedItems: [],
      activeItem: null,
      itemOrder: DEFAULT_ITEM_ORDER,
      isDragging: false,
      activeId: null,
      overId: null,

      // Actions
      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      
      resetSidebar: () => {
        localStorage.removeItem('sidebar-storage');
        set({
          isCollapsed: false,
          isMobile: false,
          isOpen: false,
          isPinned: false,
          expandedItems: [],
          activeItem: null,
          itemOrder: DEFAULT_ITEM_ORDER,
          isDragging: false,
          activeId: null,
          overId: null,
        });
      },

      toggleExpanded: (itemId: UniqueIdentifier) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(itemId)
            ? state.expandedItems.filter((id) => id !== itemId)
            : [...state.expandedItems, itemId],
        })),

      setActiveItem: (itemId: UniqueIdentifier | null) => set({ activeItem: itemId }),

      setOpen: (isOpen: boolean) => set({ isOpen }),

      setPinned: (isPinned: boolean) => set({ isPinned }),

      setMobile: (isMobile: boolean) => set({ isMobile }),

      reorderItems: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
        const { itemOrder } = get();
        const oldIndex = itemOrder.indexOf(activeId);
        const newIndex = itemOrder.indexOf(overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(itemOrder, oldIndex, newIndex);
          set({ itemOrder: newOrder });
        }
      },

      setDragging: (isDragging: boolean, activeId?: UniqueIdentifier | null) =>
        set({ isDragging, activeId: activeId || null }),

      setActiveId: (activeId: UniqueIdentifier | null) => set({ activeId }),

      setOverId: (overId: UniqueIdentifier | null) => set({ overId }),

      resetOrder: () => set({ itemOrder: DEFAULT_ITEM_ORDER }),

      saveOrder: () => {
        const { itemOrder } = get();
        localStorage.setItem("sidebar-item-order", JSON.stringify(itemOrder));
      },

      loadOrder: () => {
        const savedOrder = localStorage.getItem("sidebar-item-order");
        if (savedOrder) {
          try {
            const order: UniqueIdentifier[] = JSON.parse(savedOrder);
            // Проверяем, что порядок содержит все необходимые элементы
            const hasAllItems = DEFAULT_ITEM_ORDER.every((itemId) =>
              order.includes(itemId)
            );
            if (hasAllItems && order.length === DEFAULT_ITEM_ORDER.length) {
              set({ itemOrder: order });
            } else {
              // Если порядок неполный, используем дефолтный и сохраняем
              console.warn("Incomplete saved order, using default");
              set({ itemOrder: DEFAULT_ITEM_ORDER });
              localStorage.setItem(
                "sidebar-item-order",
                JSON.stringify(DEFAULT_ITEM_ORDER)
              );
            }
          } catch (error) {
            console.error("Failed to load sidebar order:", error);
            // При ошибке используем дефолтный порядок
            set({ itemOrder: DEFAULT_ITEM_ORDER });
          }
        }
      },

      // Принудительный сброс к дефолтному порядку
      resetToDefaultOrder: () => {
        set({ itemOrder: DEFAULT_ITEM_ORDER });
        localStorage.setItem(
          "sidebar-item-order",
          JSON.stringify(DEFAULT_ITEM_ORDER)
        );
      },
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        isPinned: state.isPinned,
        expandedItems: state.expandedItems,
        itemOrder: state.itemOrder,
      }),
    }
  )
);
