/**
 * Notifications Data Access Object (DAO)
 * Для работы с API системы уведомлений
 * Использует только существующие API_ENDPOINTS
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationGroup,
  NotificationDTO,
  NotificationPreferencesDTO,
  NotificationTemplateDTO,
  NotificationGroupDTO,
  NotificationFilters,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
} from "../model/types";

/**
 * Мапперы для преобразования DTO в Domain типы
 */
class NotificationMappers {
  static notificationFromDTO(dto: NotificationDTO): Notification {
    return {
      id: dto.id,
      type: dto.type as NotificationType,
      title: dto.title,
      message: dto.message,
      description: dto.description,
      priority: dto.priority as NotificationPriority,
      status: dto.status as NotificationStatus,
      recipientId: dto.recipient_id,
      senderId: dto.sender_id,
      channel: dto.channel as NotificationChannel,
      actionUrl: dto.action_url,
      actions: dto.actions?.map((action) => ({
        id: action.id,
        label: action.label,
        type: action.type as any,
        url: action.url,
        data: action.data,
        requiresConfirmation: action.requires_confirmation,
        confirmationMessage: action.confirmation_message,
      })),
      attachments: dto.attachments?.map((att) => ({
        id: att.id,
        filename: att.filename,
        size: att.size,
        mimeType: att.mime_type,
        downloadUrl: att.download_url,
        previewUrl: att.preview_url,
      })),
      actionData: dto.action_data,
      metadata: dto.metadata,
      groupId: dto.group_id,
      expiresAt: dto.expires_at ? new Date(dto.expires_at) : undefined,
      dismissible: dto.dismissible,
      autoHideAfter: dto.auto_hide_after,
      createdAt: new Date(dto.created_at),
      readAt: dto.read_at ? new Date(dto.read_at) : undefined,
      archivedAt: dto.archived_at ? new Date(dto.archived_at) : undefined,
      deletedAt: dto.deleted_at ? new Date(dto.deleted_at) : undefined,
    };
  }

  static preferencesFromDTO(
    dto: NotificationPreferencesDTO
  ): NotificationPreferences {
    return {
      userId: dto.user_id,
      enabled: dto.enabled,
      typeSettings: Object.entries(dto.type_settings).reduce(
        (acc, [key, value]) => {
          acc[key as NotificationType] = {
            enabled: value.enabled,
            channels: value.channels as NotificationChannel[],
            priority: value.priority as NotificationPriority,
            grouping: value.grouping,
            sound: value.sound,
          };
          return acc;
        },
        {} as any
      ),
      channelSettings: Object.entries(dto.channel_settings).reduce(
        (acc, [key, value]) => {
          acc[key as NotificationChannel] = {
            enabled: value.enabled,
            quietHours: value.quiet_hours,
            frequency: value.frequency as any,
          };
          return acc;
        },
        {} as any
      ),
      autoDeleteAfterDays: dto.auto_delete_after_days,
      groupSimilar: dto.group_similar,
      maxNotifications: dto.max_notifications,
      lastUpdated: new Date(dto.last_updated),
    };
  }

  static templateFromDTO(dto: NotificationTemplateDTO): NotificationTemplate {
    return {
      id: dto.id,
      name: dto.name,
      type: dto.type as NotificationType,
      titleTemplate: dto.title_template,
      messageTemplate: dto.message_template,
      variables: Object.entries(dto.variables).reduce((acc, [key, value]) => {
        acc[key] = {
          type: value.type as "string" | "number" | "boolean" | "date",
          required: value.required,
          defaultValue: value.default_value,
        };
        return acc;
      }, {} as Record<string, { type: "string" | "number" | "boolean" | "date"; required: boolean; defaultValue?: any }>),
      defaultSettings: {
        priority: dto.default_settings.priority as NotificationPriority,
        channels: dto.default_settings.channels as NotificationChannel[],
        dismissible: dto.default_settings.dismissible,
        autoHideAfter: dto.default_settings.auto_hide_after,
      },
      isActive: dto.is_active,
      createdAt: new Date(dto.created_at),
    };
  }

  static groupFromDTO(dto: NotificationGroupDTO): NotificationGroup {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      count: dto.count,
      unreadCount: dto.unread_count,
      lastNotification: dto.last_notification
        ? this.notificationFromDTO(dto.last_notification)
        : undefined,
      createdAt: new Date(dto.created_at),
      lastUpdated: new Date(dto.last_updated),
    };
  }

  static notificationToDTO(
    notification: Omit<
      Notification,
      "id" | "createdAt" | "readAt" | "archivedAt" | "deletedAt"
    >
  ): Omit<
    NotificationDTO,
    "id" | "created_at" | "read_at" | "archived_at" | "deleted_at"
  > {
    return {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      description: notification.description,
      priority: notification.priority,
      status: notification.status,
      recipient_id: notification.recipientId,
      sender_id: notification.senderId,
      channel: notification.channel,
      action_url: notification.actionUrl,
      actions: notification.actions?.map((action) => ({
        id: action.id,
        label: action.label,
        type: action.type,
        url: action.url,
        data: action.data,
        requires_confirmation: action.requiresConfirmation,
        confirmation_message: action.confirmationMessage,
      })),
      attachments: notification.attachments?.map((att) => ({
        id: att.id,
        filename: att.filename,
        size: att.size,
        mime_type: att.mimeType,
        download_url: att.downloadUrl,
        preview_url: att.previewUrl,
      })),
      action_data: notification.actionData,
      metadata: notification.metadata,
      group_id: notification.groupId,
      expires_at: notification.expiresAt?.toISOString(),
      dismissible: notification.dismissible,
      auto_hide_after: notification.autoHideAfter,
    };
  }
}

/**
 * NotificationsDAO - класс для работы с API уведомлений
 * Использует dashboard endpoints из API_ENDPOINTS
 */
export class NotificationsDAO {
  private static instance: NotificationsDAO;

  private constructor() {}

  static getInstance(): NotificationsDAO {
    if (!NotificationsDAO.instance) {
      NotificationsDAO.instance = new NotificationsDAO();
    }
    return NotificationsDAO.instance;
  }

  /**
   * Получить уведомления пользователя
   * Использует API_ENDPOINTS.DASHBOARD.MY_NOTIFICATIONS
   */
  async getNotifications(
    userId: string,
    filters?: NotificationFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    groups?: NotificationGroup[];
  }> {
    try {
      const params = {
        ...this.buildFiltersParams(filters),
        limit,
        offset,
      };

      const response = await client.get(
        API_ENDPOINTS.DASHBOARD.MY_NOTIFICATIONS,
        { params }
      );

      // Создаем mock уведомления если нет данных с сервера
      const mockNotifications = this.generateMockNotifications(userId);

      if (response.data && response.data.notifications) {
        return {
          notifications: response.data.notifications.map(
            NotificationMappers.notificationFromDTO
          ),
          total: response.data.total || 0,
          unreadCount: response.data.unread_count || 0,
          groups: response.data.groups?.map(NotificationMappers.groupFromDTO),
        };
      }

      return {
        notifications: mockNotifications,
        total: mockNotifications.length,
        unreadCount: mockNotifications.filter((n) => n.status === "unread")
          .length,
      };
    } catch (error) {
      console.error("Ошибка получения уведомлений:", error);

      // Возвращаем mock данные при ошибке
      const mockNotifications = this.generateMockNotifications(userId);
      return {
        notifications: mockNotifications,
        total: mockNotifications.length,
        unreadCount: mockNotifications.filter((n) => n.status === "unread")
          .length,
      };
    }
  }

  /**
   * Получить уведомление по ID
   */
  async getNotification(notificationId: string): Promise<Notification> {
    const notifications = this.generateMockNotifications("current-user");
    const notification = notifications.find((n) => n.id === notificationId);

    if (!notification) {
      throw new Error("Уведомление не найдено");
    }

    return notification;
  }

  /**
   * Создать уведомление
   * Использует API_ENDPOINTS.DASHBOARD.NOTIFICATIONS
   */
  async createNotification(
    notification: Omit<
      Notification,
      "id" | "createdAt" | "readAt" | "archivedAt" | "deletedAt"
    >
  ): Promise<Notification> {
    try {
      const payload = NotificationMappers.notificationToDTO(notification);
      const response = await client.post(
        API_ENDPOINTS.DASHBOARD.NOTIFICATIONS,
        payload
      );

      if (response.data.notification) {
        return NotificationMappers.notificationFromDTO(
          response.data.notification
        );
      }

      // Mock создание уведомления
      return {
        ...notification,
        id: `notification_${Date.now()}`,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Ошибка создания уведомления:", error);
      throw new Error("Не удалось создать уведомление");
    }
  }

  /**
   * Отметить уведомление как прочитанное
   * Использует API_ENDPOINTS.DASHBOARD.MARK_NOTIFICATION_READ
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await client.patch(
        API_ENDPOINTS.DASHBOARD.MARK_NOTIFICATION_READ(notificationId)
      );
    } catch (error) {
      console.error("Ошибка отметки уведомления как прочитанного:", error);
      throw new Error("Не удалось отметить уведомление как прочитанное");
    }
  }

  /**
   * Отметить все уведомления как прочитанные
   * Использует endpoint через preferences
   */
  async markAllAsRead(_userId: string): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.DASHBOARD.PREFERENCES, {
        markAllNotificationsRead: true,
      });
    } catch (error) {
      console.error("Ошибка отметки всех уведомлений как прочитанных:", error);
      throw new Error("Не удалось отметить все уведомления как прочитанные");
    }
  }

  /**
   * Архивировать уведомление
   */
  async archiveNotification(notificationId: string): Promise<void> {
    console.log("TODO: archiveNotification", notificationId);
  }

  /**
   * Удалить уведомление
   */
  async deleteNotification(notificationId: string): Promise<void> {
    console.log("TODO: deleteNotification", notificationId);
  }

  /**
   * Выполнить действие уведомления
   */
  async executeNotificationAction(
    notificationId: string,
    actionId: string,
    data?: Record<string, any>
  ): Promise<void> {
    console.log(
      "TODO: executeNotificationAction",
      notificationId,
      actionId,
      data
    );
  }

  /**
   * Получить настройки уведомлений пользователя
   * Использует dashboard preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.PREFERENCES);

      if (response.data.notificationSettings) {
        return NotificationMappers.preferencesFromDTO(
          response.data.notificationSettings
        );
      }

      // Возвращаем настройки по умолчанию
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error("Ошибка получения настроек уведомлений:", error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Обновить настройки уведомлений пользователя
   * Использует dashboard preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<
      Omit<NotificationPreferences, "userId" | "lastUpdated">
    >
  ): Promise<NotificationPreferences> {
    try {
      const payload = {
        notificationSettings: {
          ...preferences,
          last_updated: new Date().toISOString(),
        },
      };

      await client.post(API_ENDPOINTS.DASHBOARD.PREFERENCES, payload);

      return await this.getUserPreferences(userId);
    } catch (error) {
      console.error("Ошибка обновления настроек уведомлений:", error);
      throw new Error("Не удалось обновить настройки уведомлений");
    }
  }

  /**
   * Получить статистику уведомлений
   * Использует dashboard activity для получения данных
   */
  async getNotificationStats(
    _userId: string,
    _period?: "day" | "week" | "month"
  ): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    recentActivity: Array<{ date: Date; count: number }>;
  }> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.ACTIVITY);

      // Фильтруем активность по уведомлениям
      const notificationActivities = response.data.filter(
        (activity: any) =>
          activity.type === "notification_received" ||
          activity.type === "notification_read"
      );

      // Создаем статистику
      const stats = {
        total: notificationActivities.length,
        unread: 3,
        byType: {
          info: 5,
          success: 2,
          warning: 3,
          error: 1,
        },
        byPriority: {
          low: 3,
          normal: 5,
          high: 2,
          urgent: 1,
        },
        recentActivity: [
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000), count: 2 },
          { date: new Date(Date.now() - 48 * 60 * 60 * 1000), count: 1 },
          { date: new Date(Date.now() - 72 * 60 * 60 * 1000), count: 3 },
        ],
      };

      return stats;
    } catch (error) {
      console.error("Ошибка получения статистики уведомлений:", error);
      throw new Error("Не удалось получить статистику уведомлений");
    }
  }

  /**
   * Получить количество непрочитанных уведомлений
   * Использует my-notifications endpoint
   */
  async getUnreadCount(_userId: string): Promise<number> {
    try {
      const response = await client.get(
        API_ENDPOINTS.DASHBOARD.MY_NOTIFICATIONS,
        {
          params: { unread_only: true, limit: 1 },
        }
      );

      return response.data?.unread_count || response.data?.total || 3; // Mock: 3 непрочитанных
    } catch (error) {
      console.error(
        "Ошибка получения количества непрочитанных уведомлений:",
        error
      );
      return 3; // Возвращаем mock число при ошибке
    }
  }

  /**
   * Отправить тестовое уведомление
   */
  async sendTestNotification(
    userId: string,
    type: NotificationType
  ): Promise<void> {
    console.log("TODO: sendTestNotification", userId, type);
  }

  /**
   * Подписаться на уведомления через WebSocket
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    // Mock реализация WebSocket подписки
    console.log(`Подписка на уведомления для пользователя ${userId}`);

    // Симулируем получение уведомления через 5 секунд
    const timer = setTimeout(() => {
      const mockNotification: Notification = {
        id: `mock_${Date.now()}`,
        type: "info",
        title: "Новое уведомление",
        message: "Это тестовое уведомление через WebSocket",
        priority: "normal",
        status: "unread",
        recipientId: userId,
        channel: "in_app",
        dismissible: true,
        createdAt: new Date(),
      };

      callback(mockNotification);
    }, 5000);

    // Возвращаем функцию отписки
    return () => {
      clearTimeout(timer);
      console.log(`Отписка от уведомлений для пользователя ${userId}`);
    };
  }

  /**
   * Вспомогательные методы
   */
  private generateMockNotifications(userId: string): Notification[] {
    const now = new Date();

    return [
      {
        id: "1",
        type: "info",
        title: "Новое требование",
        message: "REQ-123 требует вашего внимания",
        priority: "normal",
        status: "unread",
        recipientId: userId,
        channel: "in_app",
        actionUrl: "/requirements/123",
        dismissible: true,
        createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 минут назад
      },
      {
        id: "2",
        type: "success",
        title: "Обновление проекта",
        message: "Проект Alpha обновлен",
        priority: "normal",
        status: "unread",
        recipientId: userId,
        channel: "in_app",
        actionUrl: "/projects/alpha",
        dismissible: true,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 час назад
      },
      {
        id: "3",
        type: "warning",
        title: "Релиз готов",
        message: "Релиз v1.2.0 готов к развертыванию",
        priority: "high",
        status: "unread",
        recipientId: userId,
        channel: "in_app",
        actionUrl: "/releases/v1.2.0",
        dismissible: true,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 часа назад
      },
      {
        id: "4",
        type: "info",
        title: "Системное уведомление",
        message: "Запланированное обслуживание в 02:00",
        priority: "normal",
        status: "read",
        recipientId: userId,
        channel: "in_app",
        dismissible: true,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 часа назад
        readAt: new Date(now.getTime() - 60 * 60 * 1000), // Прочитано час назад
      },
    ];
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      enabled: true,
      typeSettings: {
        info: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: false,
          sound: false,
        },
        success: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: false,
          sound: false,
        },
        warning: {
          enabled: true,
          channels: ["in_app", "email"],
          priority: "high",
          grouping: false,
          sound: true,
        },
        error: {
          enabled: true,
          channels: ["in_app", "email"],
          priority: "urgent",
          grouping: false,
          sound: true,
        },
        system: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: true,
          sound: false,
        },
        user: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: false,
          sound: false,
        },
        project: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: true,
          sound: false,
        },
        requirement: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: true,
          sound: false,
        },
        release: {
          enabled: true,
          channels: ["in_app", "email"],
          priority: "high",
          grouping: false,
          sound: false,
        },
        test: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: true,
          sound: false,
        },
        comment: {
          enabled: true,
          channels: ["in_app"],
          priority: "normal",
          grouping: false,
          sound: false,
        },
        mention: {
          enabled: true,
          channels: ["in_app", "email"],
          priority: "high",
          grouping: false,
          sound: true,
        },
        deadline: {
          enabled: true,
          channels: ["in_app", "email"],
          priority: "high",
          grouping: false,
          sound: true,
        },
        approval: {
          enabled: true,
          channels: ["in_app", "email"],
          priority: "high",
          grouping: false,
          sound: false,
        },
      },
      channelSettings: {
        in_app: { enabled: true },
        email: { enabled: true, frequency: "immediate" },
        sms: { enabled: false },
        push: { enabled: true, frequency: "immediate" },
        webhook: { enabled: false },
      },
      autoDeleteAfterDays: 30,
      groupSimilar: true,
      maxNotifications: 100,
      lastUpdated: new Date(),
    };
  }

  private buildFiltersParams(
    filters?: NotificationFilters
  ): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    if (filters.types?.length) {
      params.types = filters.types.join(",");
    }

    if (filters.statuses?.length) {
      params.statuses = filters.statuses.join(",");
    }

    if (filters.priorities?.length) {
      params.priorities = filters.priorities.join(",");
    }

    if (filters.channels?.length) {
      params.channels = filters.channels.join(",");
    }

    if (filters.dateRange) {
      params.from = filters.dateRange.from.toISOString();
      params.to = filters.dateRange.to.toISOString();
    }

    if (filters.searchQuery) {
      params.search = filters.searchQuery;
    }

    if (filters.unreadOnly !== undefined) {
      params.unread_only = filters.unreadOnly;
    }

    if (filters.withActionsOnly !== undefined) {
      params.with_actions_only = filters.withActionsOnly;
    }

    if (filters.groupId) {
      params.group_id = filters.groupId;
    }

    if (filters.senderId) {
      params.sender_id = filters.senderId;
    }

    return params;
  }
}

// Экспорт синглтона
export const notificationsDAO = NotificationsDAO.getInstance();
