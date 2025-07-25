import type { BaseWidgetProps } from "@/shared/types/dashboard";

/**
 * Пропы для DashboardHeader
 */
export interface DashboardHeaderProps extends BaseWidgetProps {
  /** Заголовок дашборда */
  title?: string;
  
  /** Показывать кнопку обновления */
  showRefresh?: boolean;
  
  /** Состояние обновления */
  isRefreshing?: boolean;
  
  /** Обработчик обновления */
  onRefresh?: () => void;
  
  /** Показывать уведомления */
  showNotifications?: boolean;
  
  /** Количество непрочитанных уведомлений */
  notificationCount?: number;
  
  /** Обработчик уведомлений */
  onNotificationsClick?: () => void;
  
  /** Показывать настройки */
  showSettings?: boolean;
  
  /** Обработчик настроек */
  onSettingsClick?: () => void;
  
  /** Показывать профиль пользователя */
  showUserProfile?: boolean;
  
  /** Информация о пользователе */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  
  /** Обработчик клика по профилю */
  onUserProfileClick?: () => void;
  
  /** Дополнительные действия */
  actions?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  className?: string;
  sx?: any;
} 