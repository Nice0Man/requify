import { useState, useCallback } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { SidebarItem } from "@/entities/sidebar";

export interface DndState {
  activeId: string | null;
  sidebarItems: SidebarItem[];
  sensors: ReturnType<typeof useSensors>;
}

export interface DndActions {
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  setSidebarItems: React.Dispatch<React.SetStateAction<SidebarItem[]>>;
  getActiveItem: () => SidebarItem | undefined;
}

export interface UseSidebarDndReturn {
  state: DndState;
  actions: DndActions;
}

/**
 * Хук для управления drag-and-drop в сайдбаре
 * Выделен из AppSidebarWidget согласно FSD принципам [[cite](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da)]
 */
export const useSidebarDnd = (
  initialItems: SidebarItem[],
  onItemsChange?: (items: SidebarItem[]) => void
): UseSidebarDndReturn => {
  // DnD состояние
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(initialItems);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Обработчик начала перетаскивания
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Обработчик окончания перетаскивания
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setSidebarItems((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          const newItems = arrayMove(items, oldIndex, newIndex);
          onItemsChange?.(newItems);
          return newItems;
        });
      }

      setActiveId(null);
    },
    [onItemsChange]
  );

  // Получение активного элемента для DragOverlay
  const getActiveItem = useCallback(() => {
    return sidebarItems.find((item) => item.id === activeId);
  }, [sidebarItems, activeId]);

  // Оборачиваем setSidebarItems для уведомления о изменениях
  const setSidebarItemsWithCallback = useCallback(
    (action: React.SetStateAction<SidebarItem[]>) => {
      setSidebarItems((prevItems) => {
        const newItems =
          typeof action === "function" ? action(prevItems) : action;
        onItemsChange?.(newItems);
        return newItems;
      });
    },
    [onItemsChange]
  );

  return {
    state: {
      activeId,
      sidebarItems,
      sensors,
    },
    actions: {
      handleDragStart,
      handleDragEnd,
      setSidebarItems: setSidebarItemsWithCallback,
      getActiveItem,
    },
  };
};
