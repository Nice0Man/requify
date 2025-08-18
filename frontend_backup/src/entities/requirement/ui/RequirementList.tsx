/**
 * Requirement List UI Component
 * Список требований с поддержкой различных режимов отображения
 */

import React, { memo } from "react";
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Alert,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { RequirementCard } from "./RequirementCard";
import type {
  RequirementType,
  RequirementPriority,
  RequirementStatus,
} from "../model/types";

export interface RequirementListItem {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  progress: number;
  assigneeName?: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  commentsCount?: number;
  attachmentsCount?: number;
  relationsCount?: number;
}

export interface RequirementListProps {
  items: RequirementListItem[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  viewMode?: "list" | "grid";
  compact?: boolean;
  showActions?: boolean;
  onItemClick?: (item: RequirementListItem) => void;
  onItemEdit?: (item: RequirementListItem) => void;
  onItemDelete?: (item: RequirementListItem) => void;
  onViewModeChange?: (mode: "list" | "grid") => void;
  // Фильтры
  filterByStatus?: RequirementStatus[];
  filterByPriority?: RequirementPriority[];
  filterByType?: RequirementType[];
  sortBy?: "title" | "createdAt" | "updatedAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
  className?: string;
}

const RequirementListSkeleton = memo<{
  count?: number;
  viewMode?: "list" | "grid";
}>(({ count = 5, viewMode = "list" }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} mb={2}>
        <Skeleton
          variant="rectangular"
          height={viewMode === "grid" ? 200 : 120}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    ))}
  </Box>
));

const EmptyState = memo<{ message: string }>(({ message }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={6}
    textAlign="center"
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      Требования не найдены
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
));

/**
 * Применить фильтры к списку требований
 */
const applyFilters = (
  items: RequirementListItem[],
  filters: {
    status?: RequirementStatus[];
    priority?: RequirementPriority[];
    type?: RequirementType[];
  }
): RequirementListItem[] => {
  return items.filter((item) => {
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(item.status)) return false;
    }
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(item.priority)) return false;
    }
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(item.type)) return false;
    }
    return true;
  });
};

/**
 * Применить сортировку к списку требований
 */
const applySorting = (
  items: RequirementListItem[],
  sortBy: RequirementListProps["sortBy"],
  sortOrder: RequirementListProps["sortOrder"] = "desc"
): RequirementListItem[] => {
  if (!sortBy) return items;

  const sorted = [...items].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "createdAt":
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case "updatedAt":
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      case "priority":
        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case "status":
        const statusOrder = {
          draft: 1,
          review: 2,
          approved: 3,
          in_development: 4,
          testing: 5,
          completed: 6,
          rejected: 7,
        };
        aValue = statusOrder[a.status as keyof typeof statusOrder];
        bValue = statusOrder[b.status as keyof typeof statusOrder];
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return sorted;
};

export const RequirementList = memo<RequirementListProps>(
  ({
    items,
    loading = false,
    error,
    empty = false,
    emptyMessage = "Создайте первое требование для начала работы",
    viewMode = "list",
    compact = false,
    showActions = true,
    onItemClick,
    onItemEdit,
    onItemDelete,
    filterByStatus,
    filterByPriority,
    filterByType,
    sortBy,
    sortOrder,
    className,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Применяем фильтры и сортировку
    const processedItems = React.useMemo(() => {
      let filtered = applyFilters(items, {
        status: filterByStatus,
        priority: filterByPriority,
        type: filterByType,
      });

      return applySorting(filtered, sortBy, sortOrder);
    }, [
      items,
      filterByStatus,
      filterByPriority,
      filterByType,
      sortBy,
      sortOrder,
    ]);

    // Показываем загрузку
    if (loading) {
      return (
        <Box className={className}>
          <RequirementListSkeleton count={5} viewMode={viewMode} />
        </Box>
      );
    }

    // Показываем ошибку
    if (error) {
      return (
        <Box className={className}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      );
    }

    // Показываем пустое состояние
    if (empty || processedItems.length === 0) {
      return (
        <Box className={className}>
          <EmptyState message={emptyMessage} />
        </Box>
      );
    }

    // Режим сетки
    if (viewMode === "grid") {
      return (
        <Box className={className}>
          <Grid container spacing={2}>
            {processedItems.map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={compact ? 3 : 4}
                key={item.id}
              >
                <RequirementCard
                  {...item}
                  compact={compact}
                  showActions={showActions}
                  onClick={() => onItemClick?.(item)}
                  onEdit={() => onItemEdit?.(item)}
                  onDelete={() => onItemDelete?.(item)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    // Режим списка
    return (
      <Box className={className}>
        <Stack spacing={compact ? 1 : 2}>
          {processedItems.map((item) => (
            <RequirementCard
              key={item.id}
              {...item}
              compact={compact}
              showActions={showActions}
              onClick={() => onItemClick?.(item)}
              onEdit={() => onItemEdit?.(item)}
              onDelete={() => onItemDelete?.(item)}
            />
          ))}
        </Stack>
      </Box>
    );
  }
);

RequirementList.displayName = "RequirementList";
