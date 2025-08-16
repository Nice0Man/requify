/**
 * Notifications Entity Types
 * Система уведомлений для FSD архитектуры
 */

/**
 * Тип уведомления
 */
export type NotificationType = 
  | "info"
  | "success" 
  | "warning"
  | "error"
  | "system"
  | "user"
  | "project"
  | "requirement"
  | "release"
  | "test"
  | "comment"
  | "mention"
  | "deadline"
  | "approval";

/**
 * Приоритет уведомления
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Статус уведомления
 */
export type NotificationStatus = "unread" | "read" | "archived" | "deleted";

/**
 * Канал доставки уведомления
 */
export type NotificationChannel = "in_app" | "email" | "sms" | "push" | "webhook";

/**
 * Уведомление
 */
export interface Notification {
  /** Уникальный идентификатор */
  id: string;
  
  /** Тип уведомления */
  type: NotificationType;
  
  /** Заголовок */
  title: string;
  
  /** Содержание сообщения */
  message: string;
  
  /** Описание (дополнительная информация) */
  description?: string;
  
  /** Приоритет */
  priority: NotificationPriority;
  
  /** Статус */
  status: NotificationStatus;
  
  /** Получатель */
  recipientId: string;
  
  /** Отправитель */
  senderId?: string;
  
  /** Канал доставки */
  channel: NotificationChannel;
  
  /** Иконка */
  icon?: React.ReactNode;
  
  /** Цвет */
  color?: string;
  
  /** Действие при клике */
  actionUrl?: string;
  
  /** Кнопки действий */
  actions?: NotificationAction[];
  
  /** Вложения */
  attachments?: NotificationAttachment[];
  
  /** Данные для действий */
  actionData?: Record<string, any>;
  
  /** Метаданные */
  metadata?: Record<string, any>;
  
  /** Группировка */
  groupId?: string;
  
  /** Истекает ли */
  expiresAt?: Date;
  
  /** Можно ли отклонить */
  dismissible: boolean;
  
  /** Автоматически скрывать через (секунды) */
  autoHideAfter?: number;
  
  /** Дата создания */
  createdAt: Date;
  
  /** Дата прочтения */
  readAt?: Date;
  
  /** Дата архивирования */
  archivedAt?: Date;
  
  /** Дата удаления */
  deletedAt?: Date;
}

/**
 * Действие в уведомлении
 */
export interface NotificationAction {
  /** Идентификатор действия */
  id: string;
  
  /** Текст кнопки */
  label: string;
  
  /** Тип действия */
  type: "primary" | "secondary" | "danger" | "success";
  
  /** URL для перехода */
  url?: string;
  
  /** Callback функция */
  handler?: () => void | Promise<void>;
  
  /** Данные для действия */
  data?: Record<string, any>;
  
  /** Подтверждение перед выполнением */
  requiresConfirmation?: boolean;
  
  /** Сообщение подтверждения */
  confirmationMessage?: string;
}

/**
 * Вложение уведомления
 */
export interface NotificationAttachment {
  /** Идентификатор */
  id: string;
  
  /** Имя файла */
  filename: string;
  
  /** Размер файла */
  size: number;
  
  /** MIME тип */
  mimeType: string;
  
  /** URL для скачивания */
  downloadUrl: string;
  
  /** URL для превью */
  previewUrl?: string;
}

/**
 * Настройки уведомлений пользователя
 */
export interface NotificationPreferences {
  /** ID пользователя */
  userId: string;
  
  /** Общие настройки */
  enabled: boolean;
  
  /** Настройки по типам уведомлений */
  typeSettings: Record<NotificationType, {
    enabled: boolean;
    channels: NotificationChannel[];
    priority: NotificationPriority;
    grouping: boolean;
    sound: boolean;
  }>;
  
  /** Настройки каналов доставки */
  channelSettings: Record<NotificationChannel, {
    enabled: boolean;
    quietHours?: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
    frequency?: "immediate" | "hourly" | "daily" | "weekly";
  }>;
  
  /** Автоматическое удаление */
  autoDeleteAfterDays?: number;
  
  /** Группировка уведомлений */
  groupSimilar: boolean;
  
  /** Максимальное количество уведомлений */
  maxNotifications: number;
  
  /** Последнее обновление */
  lastUpdated: Date;
}

/**
 * Шаблон уведомления
 */
export interface NotificationTemplate {
  /** Идентификатор шаблона */
  id: string;
  
  /** Название шаблона */
  name: string;
  
  /** Тип уведомления */
  type: NotificationType;
  
  /** Шаблон заголовка */
  titleTemplate: string;
  
  /** Шаблон сообщения */
  messageTemplate: string;
  
  /** Переменные для подстановки */
  variables: Record<string, {
    type: "string" | "number" | "date" | "boolean";
    required: boolean;
    defaultValue?: any;
  }>;
  
  /** Настройки по умолчанию */
  defaultSettings: {
    priority: NotificationPriority;
    channels: NotificationChannel[];
    dismissible: boolean;
    autoHideAfter?: number;
  };
  
  /** Активен ли шаблон */
  isActive: boolean;
  
  /** Дата создания */
  createdAt: Date;
}

/**
 * Группа уведомлений
 */
export interface NotificationGroup {
  /** Идентификатор группы */
  id: string;
  
  /** Название группы */
  title: string;
  
  /** Описание */
  description?: string;
  
  /** Количество уведомлений */
  count: number;
  
  /** Количество непрочитанных */
  unreadCount: number;
  
  /** Последнее уведомление */
  lastNotification?: Notification;
  
  /** Дата создания группы */
  createdAt: Date;
  
  /** Дата последнего обновления */
  lastUpdated: Date;
}

/**
 * Фильтры уведомлений
 */
export interface NotificationFilters {
  /** Типы уведомлений */
  types?: NotificationType[];
  
  /** Статусы */
  statuses?: NotificationStatus[];
  
  /** Приоритеты */
  priorities?: NotificationPriority[];
  
  /** Каналы */
  channels?: NotificationChannel[];
  
  /** Временной диапазон */
  dateRange?: {
    from: Date;
    to: Date;
  };
  
  /** Поиск по тексту */
  searchQuery?: string;
  
  /** Только непрочитанные */
  unreadOnly?: boolean;
  
  /** Только с действиями */
  withActionsOnly?: boolean;
  
  /** Группа */
  groupId?: string;
  
  /** Отправитель */
  senderId?: string;
}

/**
 * DTO типы для API
 */
export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  description?: string;
  priority: string;
  status: string;
  recipient_id: string;
  sender_id?: string;
  channel: string;
  action_url?: string;
  actions?: Array<{
    id: string;
    label: string;
    type: string;
    url?: string;
    data?: Record<string, any>;
    requires_confirmation?: boolean;
    confirmation_message?: string;
  }>;
  attachments?: Array<{
    id: string;
    filename: string;
    size: number;
    mime_type: string;
    download_url: string;
    preview_url?: string;
  }>;
  action_data?: Record<string, any>;
  metadata?: Record<string, any>;
  group_id?: string;
  expires_at?: string;
  dismissible: boolean;
  auto_hide_after?: number;
  created_at: string;
  read_at?: string;
  archived_at?: string;
  deleted_at?: string;
}

export interface NotificationPreferencesDTO {
  user_id: string;
  enabled: boolean;
  type_settings: Record<string, {
    enabled: boolean;
    channels: string[];
    priority: string;
    grouping: boolean;
    sound: boolean;
  }>;
  channel_settings: Record<string, {
    enabled: boolean;
    quiet_hours?: {
      start: string;
      end: string;
    };
    frequency?: string;
  }>;
  auto_delete_after_days?: number;
  group_similar: boolean;
  max_notifications: number;
  last_updated: string;
}

export interface NotificationTemplateDTO {
  id: string;
  name: string;
  type: string;
  title_template: string;
  message_template: string;
  variables: Record<string, {
    type: string;
    required: boolean;
    default_value?: any;
  }>;
  default_settings: {
    priority: string;
    channels: string[];
    dismissible: boolean;
    auto_hide_after?: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface NotificationGroupDTO {
  id: string;
  title: string;
  description?: string;
  count: number;
  unread_count: number;
  last_notification?: NotificationDTO;
  created_at: string;
  last_updated: string;
}

/**
 * Ответы API
 */
export interface NotificationsResponse {
  notifications: NotificationDTO[];
  total: number;
  unread_count: number;
  groups?: NotificationGroupDTO[];
}

export interface NotificationResponse {
  notification: NotificationDTO;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreferencesDTO;
}

export interface NotificationTemplatesResponse {
  templates: NotificationTemplateDTO[];
  total: number;
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
} 