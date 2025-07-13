import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SidebarStore } from "./types";

const DEFAULT_ITEM_ORDER = [
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
      dragItemId: null,

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
          dragItemId: null,
        });
      },

      toggleExpanded: (itemId: string) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(itemId)
            ? state.expandedItems.filter((id) => id !== itemId)
            : [...state.expandedItems, itemId],
        })),

      setActiveItem: (itemId: string | null) => set({ activeItem: itemId }),

      setOpen: (isOpen: boolean) => set({ isOpen }),

      setPinned: (isPinned: boolean) => set({ isPinned }),

      setMobile: (isMobile: boolean) => set({ isMobile }),

      reorderItems: (dragIndex: number, hoverIndex: number) => {
        const { itemOrder } = get();
        const newOrder = [...itemOrder];
        const draggedItem = newOrder[dragIndex];

        newOrder.splice(dragIndex, 1);
        newOrder.splice(hoverIndex, 0, draggedItem);

        set({ itemOrder: newOrder });
      },

      setDragging: (isDragging: boolean, dragItemId?: string) =>
        set({ isDragging, dragItemId: dragItemId || null }),

      resetOrder: () => set({ itemOrder: DEFAULT_ITEM_ORDER }),

      saveOrder: () => {
        const { itemOrder } = get();
        localStorage.setItem("sidebar-item-order", JSON.stringify(itemOrder));
      },

      loadOrder: () => {
        const savedOrder = localStorage.getItem("sidebar-item-order");
        if (savedOrder) {
          try {
            const order = JSON.parse(savedOrder);
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
