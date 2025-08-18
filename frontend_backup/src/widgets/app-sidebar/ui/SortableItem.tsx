import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";

import { SidebarButton } from "@/entities/sidebar";
import type { SidebarItem, SidebarItemState } from "@/entities/sidebar";

interface SortableItemProps {
  item: SidebarItem;
  isCollapsed: boolean;
  onItemClick: (item: SidebarItem) => void;
  getItemState: (item: SidebarItem) => SidebarItemState;
  isDragging?: boolean;
}

/**
 * Sortable wrapper для элементов сайдбара с drag-and-drop поддержкой
 * Выделен из AppSidebarWidget согласно FSD принципам
 * Интегрирует drag handle внутри кнопки [[cite](https://www.redblobgames.com/making-of/draggable/)]
 */
export const SortableItem: React.FC<SortableItemProps> = ({
  item,
  isCollapsed,
  onItemClick,
  getItemState,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Подготавливаем drag props для SidebarButton
  const dragProps = item.isDraggable
    ? {
        attributes,
        listeners,
        isDragging: isSortableDragging,
      }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        position: "relative",
        width: "100%",
      }}
    >
      <SidebarButton
        item={item}
        state={getItemState(item)}
        isCollapsed={isCollapsed}
        onClick={onItemClick}
        dragProps={dragProps}
      />
    </Box>
  );
};
