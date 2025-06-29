// Re-export types from API file to maintain consistency
export type {
  Notification,
  NotificationAction,
  NotificationSettings,
  NotificationSummary,
  CreateNotificationRequest,
  NotificationFilters,
  NotificationSearchParams,
} from '../api/notifications.api';

// Additional UI-specific types
export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
  refreshInterval?: number;
  maxNotifications?: number;
}

export interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: (actionId: string) => void;
}

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  variant?: 'standard' | 'dot';
}

export interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (notificationId: string, actionId: string) => void;
  showActions?: boolean;
  maxHeight?: number;
  emptyMessage?: string;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  onAction?: (actionId: string) => void;
  showActions?: boolean;
  compact?: boolean;
} 