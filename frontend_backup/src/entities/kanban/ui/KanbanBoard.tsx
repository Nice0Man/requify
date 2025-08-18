import React, { useMemo } from "react";
import {
  Box,
  Typography,
  // Paper, // unused
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import type {
  KanbanCard,
  KanbanType,
  KanbanVariant,
  KanbanFilter,
} from "../model/types";
import { KANBAN_CONFIGURATIONS } from "../model/configurations";
import {
  filterKanbanItems,
  sortKanbanItems,
  groupItemsByColumn,
} from "../model/utils";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  type: KanbanType;
  items: KanbanCard[];
  isLoading?: boolean;
  error?: string | null;
  filter?: KanbanFilter;
  variant?: KanbanVariant;
  onDragEnd?: (result: DropResult) => void;
  onItemClick?: (item: KanbanCard) => void;
  onItemEdit?: (item: KanbanCard) => void;
  onItemDelete?: (item: KanbanCard) => void;
  onAddItem?: (columnId: string) => void;
  onToggleColumn?: (columnId: string) => void;
  collapsedColumns?: Record<string, boolean>;
  isDragDisabled?: boolean;
  showEmptyColumns?: boolean;
  maxHeight?: number;
  className?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  type,
  items,
  isLoading = false,
  error = null,
  filter,
  variant = "detailed",
  onDragEnd,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onAddItem,
  onToggleColumn,
  collapsedColumns = {},
  isDragDisabled = false,
  showEmptyColumns = true,
  maxHeight = 600,
  className,
}) => {
  const theme = useTheme();
  const config = KANBAN_CONFIGURATIONS[type];

  // Filter and group items
  const processedData = useMemo(() => {
    let filteredItems = items;

    // Apply filters
    if (filter) {
      filteredItems = filterKanbanItems(items, filter);
    }

    // Sort items
    filteredItems = sortKanbanItems(filteredItems, "priority");

    // Group by columns
    const groupedItems = groupItemsByColumn(filteredItems, config.columns);

    return groupedItems;
  }, [items, filter, config.columns]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isDragDisabled) {
      return;
    }

    onDragEnd?.(result);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className={className} sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 2,
            minHeight: maxHeight,
          }}
        >
          {config.columns.map((column) => (
            <Box
              key={column.id}
              sx={{
                width:
                  variant === "minimal"
                    ? 280
                    : variant === "compact"
                    ? 320
                    : 360,
                flexShrink: 0,
              }}
            >
              <Skeleton
                variant="rectangular"
                height={maxHeight}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box className={className} sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (items.length === 0 && !showEmptyColumns) {
    return (
      <Box
        className={className}
        sx={{
          p: 4,
          textAlign: "center",
          minHeight: maxHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No items found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filter?.search
            ? `No items match "${filter.search}"`
            : `No ${type} items available`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            overflowY: "hidden",
            p: 2,
            minHeight: maxHeight + 40,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: alpha(theme.palette.divider, 0.1),
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.divider, 0.3),
              borderRadius: 4,
              "&:hover": {
                backgroundColor: alpha(theme.palette.divider, 0.5),
              },
            },
          }}
        >
          {config.columns.map((column) => {
            const columnItems = processedData?.[column.status] || [];
            const isCollapsed = collapsedColumns[column.id] || false;

            // Hide empty columns if showEmptyColumns is false
            if (!showEmptyColumns && columnItems.length === 0) {
              return null;
            }

            return (
              <Fade
                key={column.id}
                in={true}
                timeout={300}
                style={{
                  transitionDelay: `${config.columns.indexOf(column) * 100}ms`,
                }}
              >
                <Box sx={{ flexShrink: 0 }}>
                  <KanbanColumn
                    column={column}
                    items={columnItems}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => onToggleColumn?.(column.id)}
                    onAddItem={() => onAddItem?.(column.id)}
                    onItemClick={onItemClick}
                    onItemEdit={onItemEdit}
                    onItemDelete={onItemDelete}
                    variant={variant}
                    isDragDisabled={isDragDisabled}
                    maxHeight={maxHeight}
                  />
                </Box>
              </Fade>
            );
          })}
        </Box>
      </DragDropContext>

      {/* Board Footer */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total: {items.length} items
          {filter?.search &&
            ` • Filtered: ${Object.values(processedData).flat().length} items`}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {config.columns.length} columns • {variant} view
        </Typography>
      </Box>
    </Box>
  );
};
