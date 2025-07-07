export interface NotificationManagementState {
  notifications: any[];
  unreadCount: number;
  isPending: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}
