import React, { memo, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Box, ListItem } from "@mui/material";
import type { SidebarItem, SidebarItemState } from "@/entities/sidebar";
import { SidebarButton, SidebarGroup } from "@/entities/sidebar";

interface VirtualizedSidebarListProps {
  items: SidebarItem[];
  isCollapsed: boolean;
  getItemState: (item: SidebarItem) => SidebarItemState;
  onItemClick: (item: SidebarItem) => void;
  height: number;
  itemHeight?: number;
}

interface VirtualListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: SidebarItem[];
    isCollapsed: boolean;
    getItemState: (item: SidebarItem) => SidebarItemState;
    onItemClick: (item: SidebarItem) => void;
  };
}

/**
 * Виртуализированный элемент списка для оптимизации производительности
 * [[cite](https://dev.to/amaresh_adak/react-performance-optimization-from-slow-to-lightning-fast-complete-guide-2025-19hl)]
 */
const VirtualListItem: React.FC<VirtualListItemProps> = memo(
  ({ index, style, data }) => {
    const { items, isCollapsed, getItemState, onItemClick } = data;
    const item = items[index];

    if (!item) return null;

    return (
      <Box style={style}>
        <ListItem
          disablePadding
          sx={{
            px: isCollapsed ? 0 : 1,
            width: "100%",
            display: "flex",
            justifyContent: isCollapsed ? "center" : "stretch",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          {item.isGroup ? (
            <SidebarGroup
              group={item}
              isCollapsed={isCollapsed}
              isExpanded={false} // В виртуализированном списке группы всегда свёрнуты для упрощения
              onToggleExpand={() => {}} // Заглушка для виртуализации
              onItemClick={onItemClick}
              getItemState={getItemState}
            />
          ) : (
            <SidebarButton
              item={item}
              state={getItemState(item)}
              isCollapsed={isCollapsed}
              onClick={onItemClick}
            />
          )}
        </ListItem>
      </Box>
    );
  }
);

VirtualListItem.displayName = "VirtualListItem";

/**
 * Виртуализированный список sidebar для больших наборов данных
 * Используется только когда элементов навигации больше 20
 * Предотвращает проблемы производительности при больших списках
 */
export const VirtualizedSidebarList: React.FC<VirtualizedSidebarListProps> =
  memo(
    ({
      items,
      isCollapsed,
      getItemState,
      onItemClick,
      height,
      itemHeight = 48,
    }) => {
      // Мемоизированные данные для react-window
      const itemData = useMemo(
        () => ({
          items,
          isCollapsed,
          getItemState,
          onItemClick,
        }),
        [items, isCollapsed, getItemState, onItemClick]
      );

      // Мемоизированная функция рендера элемента
      const renderItem = useCallback(
        (props: VirtualListItemProps) => (
          <VirtualListItem {...props} data={itemData} />
        ),
        [itemData]
      );

      return (
        <List
          height={height}
          itemCount={items.length}
          itemSize={itemHeight}
          itemData={itemData}
          width="100%"
          overscanCount={5} // Рендерим 5 дополнительных элементов для плавности скролла
        >
          {renderItem}
        </List>
      );
    }
  );

VirtualizedSidebarList.displayName = "VirtualizedSidebarList";
