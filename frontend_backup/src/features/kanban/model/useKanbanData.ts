import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { kanbanApi } from "@/entities/kanban/api/kanbanApi";
import type { KanbanType, KanbanFilter, KanbanCard } from "@/entities/kanban";
import { useKanbanStore } from "./kanbanStore";

interface UseKanbanDataWithApiParams {
  type: KanbanType;
  filter: KanbanFilter;
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * Хук для загрузки данных Kanban с API интеграцией
 * Используется когда нужна свежая загрузка данных с сервера
 */
export const useKanbanDataWithApi = ({
  type,
  filter,
  refetchInterval = 30000, // 30 секунд
  enabled = true,
}: UseKanbanDataWithApiParams) => {
  const { setLoading, setError, updateData, dataCache } = useKanbanStore();

  // Конвертируем фильтр в параметры API
  const apiParams = useMemo(() => {
    return {
      project_id: filter.project_id,
      requirement_id: filter.requirement_id,
      status:
        filter.status && filter.status.length > 0
          ? filter.status[0]
          : undefined,
      limit: 100,
      page: 1,
    };
  }, [filter]);

  // React Query для загрузки данных
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["kanban", type, apiParams],
    queryFn: async () => {
      try {
        setLoading(type, true);
        setError(type, null);

        const result = await kanbanApi.getKanbanItems(type, apiParams);

        // Обновляем кеш в store
        updateData(type, result);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(type, errorMessage);
        throw err;
      } finally {
        setLoading(type, false);
      }
    },
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Синхронизируем с store при изменении данных
  useEffect(() => {
    if (items.length > 0) {
      updateData(type, items);
    }
  }, [items, type, updateData]);

  // Фильтрация данных на клиенте
  const filteredItems = useMemo(() => {
    const sourceData = items.length > 0 ? items : dataCache[type] || [];

    return sourceData.filter((item: KanbanCard) => {
      // Фильтрация по статусу
      if (
        filter.status &&
        filter.status.length > 0 &&
        !filter.status.includes(item.status)
      ) {
        return false;
      }

      // Фильтрация по приоритету
      if (
        filter.priority &&
        filter.priority.length > 0 &&
        item.priority &&
        !filter.priority.includes(item.priority)
      ) {
        return false;
      }

      // Фильтрация по исполнителю
      if (
        filter.assignee &&
        filter.assignee.length > 0 &&
        item.assignee &&
        !filter.assignee.includes(item.assignee)
      ) {
        return false;
      }

      // Фильтрация по меткам
      if (filter.labels && filter.labels.length > 0) {
        const hasMatchingLabel = item.labels?.some(
          (label) => filter.labels && filter.labels.includes(label)
        );
        if (!hasMatchingLabel) {
          return false;
        }
      }

      // Поиск по тексту
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const descriptionMatch = item.description
          ?.toLowerCase()
          .includes(searchLower);
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }

      // Фильтрация по датам
      if (filter.dateRange) {
        const itemDate = new Date(item.updatedAt || item.updated_at);
        const fromDate = filter.dateRange.start;
        const toDate = filter.dateRange.end;

        if (itemDate < fromDate || itemDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [items, dataCache, type, filter]);

  // Группировка по колонкам
  const groupedData = useMemo(() => {
    const groups: Record<string, KanbanCard[]> = {};

    filteredItems.forEach((item) => {
      if (!groups[item.status]) {
        groups[item.status] = [];
      }
      groups[item.status].push(item);
    });

    return groups;
  }, [filteredItems]);

  // Статистика
  const statistics = useMemo(() => {
    return {
      total: filteredItems.length,
      byStatus: Object.entries(groupedData).reduce((acc, [status, items]) => {
        acc[status] = items.length;
        return acc;
      }, {} as Record<string, number>),
      byPriority: filteredItems.reduce((acc, item) => {
        if (item.priority) {
          acc[item.priority] = (acc[item.priority] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  }, [filteredItems, groupedData]);

  return {
    items: filteredItems,
    groupedData,
    statistics,
    isLoading,
    isRefetching,
    error,
    refetch,

    // Методы для работы с элементами
    createItem: async (data: any) => {
      const newItem = await kanbanApi.createItem(type, data);
      if (newItem) {
        await refetch();
      }
      return newItem;
    },

    updateItem: async (itemId: number, data: any) => {
      const updatedItem = await kanbanApi.updateItem(type, itemId, data);
      if (updatedItem) {
        await refetch();
      }
      return updatedItem;
    },

    deleteItem: async (itemId: number) => {
      const success = await kanbanApi.deleteItem(type, itemId);
      if (success) {
        await refetch();
      }
      return success;
    },

    updateStatus: async (itemId: number, newStatus: string) => {
      const success = await kanbanApi.updateItemStatus(type, itemId, newStatus);
      if (success) {
        await refetch();
      }
      return success;
    },
  };
};

// Default hook with empty filter
export const useKanbanDataSimple = (params: {
  type: KanbanType;
  projectId?: number;
  requirementId?: number;
}) => {
  const defaultFilter: KanbanFilter = {
    status: [],
    priority: [],
    assignee: [],
    labels: [],
    project_id: params.projectId,
    requirement_id: params.requirementId,
  };

  return useKanbanDataWithApi({
    type: params.type,
    filter: defaultFilter,
    enabled: true,
  });
};
