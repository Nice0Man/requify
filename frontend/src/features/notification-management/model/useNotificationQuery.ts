import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationApi,
  NotificationFilters,
  NotificationPreferences,
  CreateNotificationRequest,
} from "../api/notificationApi";
import type { Notification } from "../api/notificationApi";

// Query Keys
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (filters: NotificationFilters) =>
    [...notificationQueryKeys.lists(), filters] as const,
  details: () => [...notificationQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationQueryKeys.details(), id] as const,
  stats: () => [...notificationQueryKeys.all, "stats"] as const,
  preferences: () => [...notificationQueryKeys.all, "preferences"] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
};

// Queries
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: notificationQueryKeys.list(filters || {}),
    queryFn: () => notificationApi.getNotifications(filters),
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: notificationQueryKeys.detail(id),
    queryFn: () => notificationApi.getNotification(id),
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
    enabled: !!id,
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationQueryKeys.stats(),
    queryFn: () => notificationApi.getStats(),
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchInterval: 60 * 1000, // Обновляем каждую минуту
  });
};

export const useNotificationPreferences = (userId: string) => {
  return useQuery({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: () => notificationApi.getPreferences(userId),
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    enabled: !!userId,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: async () => {
      const stats = await notificationApi.getStats();
      return stats.unreadCount;
    },
    staleTime: 30 * 1000, // 30 секунд
    gcTime: 2 * 60 * 1000, // 2 минуты
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
};

// Mutations
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.createNotification,
    onSuccess: () => {
      // Инвалидируем все списки уведомлений
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.stats(),
      });

      // Инвалидируем счетчик непрочитанных
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
    onError: (error) => {
      console.error("Create notification error:", error);
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: (updatedNotification) => {
      // Обновляем уведомление в кэше
      queryClient.setQueryData(
        notificationQueryKeys.detail(updatedNotification.id),
        updatedNotification
      );

      // Инвалидируем списки уведомлений
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.stats(),
      });

      // Инвалидируем счетчик непрочитанных
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
    onError: (error) => {
      console.error("Mark as read error:", error);
    },
  });
};

export const useMarkAsUnread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsUnread,
    onSuccess: (updatedNotification) => {
      // Обновляем уведомление в кэше
      queryClient.setQueryData(
        notificationQueryKeys.detail(updatedNotification.id),
        updatedNotification
      );

      // Инвалидируем списки уведомлений
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.stats(),
      });

      // Инвалидируем счетчик непрочитанных
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
    onError: (error) => {
      console.error("Mark as unread error:", error);
    },
  });
};

export const useArchiveNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.archiveNotification,
    onSuccess: (archivedNotification) => {
      // Обновляем уведомление в кэше
      queryClient.setQueryData(
        notificationQueryKeys.detail(archivedNotification.id),
        archivedNotification
      );

      // Инвалидируем списки уведомлений
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.stats(),
      });
    },
    onError: (error) => {
      console.error("Archive notification error:", error);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: (_, deletedId) => {
      // Удаляем уведомление из кэша
      queryClient.removeQueries({
        queryKey: notificationQueryKeys.detail(deletedId),
      });

      // Инвалидируем списки уведомлений
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.stats(),
      });

      // Инвалидируем счетчик непрочитанных
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
    onError: (error) => {
      console.error("Delete notification error:", error);
    },
  });
};

export const useBulkMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.bulkMarkAsRead,
    onSuccess: () => {
      // Инвалидируем все связанные данные
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    onError: (error) => {
      console.error("Bulk mark as read error:", error);
    },
  });
};

export const useBulkArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.bulkArchive,
    onSuccess: () => {
      // Инвалидируем все связанные данные
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    onError: (error) => {
      console.error("Bulk archive error:", error);
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.bulkDelete,
    onSuccess: () => {
      // Инвалидируем все связанные данные
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    onError: (error) => {
      console.error("Bulk delete error:", error);
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      // Инвалидируем все связанные данные
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    onError: (error) => {
      console.error("Mark all as read error:", error);
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: NotificationPreferences;
    }) => notificationApi.updateNotificationPreferences(userId, preferences),
    onSuccess: (updatedPreferences) => {
      // Обновляем настройки в кэше
      queryClient.setQueryData(
        notificationQueryKeys.preferences(),
        updatedPreferences
      );
    },
    onError: (error) => {
      console.error("Update notification preferences error:", error);
    },
  });
};

export const useTestNotification = () => {
  return useMutation({
    mutationFn: notificationApi.testNotification,
    onError: (error) => {
      console.error("Test notification error:", error);
    },
  });
};

export const useSubscribeToWebPush = () => {
  return useMutation({
    mutationFn: notificationApi.subscribeToWebPush,
    onError: (error) => {
      console.error("Subscribe to web push error:", error);
    },
  });
};

export const useUnsubscribeFromWebPush = () => {
  return useMutation({
    mutationFn: notificationApi.unsubscribeFromWebPush,
    onError: (error) => {
      console.error("Unsubscribe from web push error:", error);
    },
  });
};

// Хук для получения уведомлений реального времени
export const useNotificationPolling = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // Опрашиваем непрочитанные уведомления каждые 30 секунд
  const { data: unreadCount } = useUnreadCount();

  // Опрашиваем последние уведомления каждые 30 секунд
  const { data: notifications } = useNotifications({
    status: "unread",
    limit: 10,
  });

  return {
    unreadCount: unreadCount || 0,
    latestNotifications: notifications || [],
    refetchNotifications: () => {
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
    },
  };
};
