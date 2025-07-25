export interface SearchState {
  query: string;
  focused: boolean;
  results: SearchResult[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: "project" | "requirement" | "release" | "user";
  url: string;
  description?: string;
}

export interface HeaderAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  color: string;
  disabled?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  type?: "info" | "warning" | "error" | "success";
  actionUrl?: string;
}

export interface HeaderState {
  search: SearchState;
  notifications: NotificationItem[];
  unreadCount: number;
  quickActions: HeaderAction[];
}

export interface HeaderConfig {
  showSearch: boolean;
  showNotifications: boolean;
  showQuickActions: boolean;
  showUserMenu: boolean;
  maxNotifications: number;
}
