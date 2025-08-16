// Features layer - фичи и пользовательские сценарии

// Auth features
export * from "./auth";

// Charts features
export * from "./charts";

// Demo platform features
export * from "./demo-platform";

// Dashboard features (убираем clearError)
export * from "./dashboard/api";
export * from "./dashboard/ui";
export { 
  clearError as clearDashboardError,
  dashboardSlice 
} from "./dashboard/model/store";

// Header features (переименовываем конфликтующий useNotifications)
export { useHeaderSearch, useHeaderActions } from "./header";
export { useNotifications as useHeaderNotifications } from "./header/model/hooks";
export type { HeaderAction, NotificationItem, SearchResult } from "./header/model/types";

// Kanban features
export * from "./kanban";

// Navigation features (новая для sidebar)
export * from "./navigation";

// Notifications features (основной useNotifications, убираем clearError)
export { useNotifications, useNotificationStats, useNotificationPolling } from "./notifications";
export { 
  clearError as clearNotificationError,
  notificationManagementSlice 
} from "./notifications/model/store";
export type { 
  NotificationManagementState,
  Notification 
} from "./notifications/model/types";

// Projects features (убираем clearError)
export { useProjectManagement } from "./projects";
export { 
  clearError as clearProjectError,
  projectManagementSlice 
} from "./projects/model/store";

// Releases features (убираем clearError)
export { 
  clearError as clearReleaseError,
  releaseManagementSlice 
} from "./releases/model/store";

// Requirements features (убираем clearError) 
export { 
  clearError as clearRequirementError,
  requirementManagementSlice 
} from "./requirements/model/store";

// Testing features (убираем clearError)
export { 
  clearError as clearTestingError,
  testManagementSlice 
} from "./testing/model/store";

// Admin features (убираем clearError)
export { useAdminPanel } from "./admin";
export { 
  clearError as clearAdminError,
  adminPanelSlice 
} from "./admin/model/store";

// Actions features
export * from "./actions";

// Scroll navigation features
export * from "./scroll-navigation";

// Settings features
export * from "./user-profile-settings";
export * from "./notification-settings";
export * from "./security-settings";
export * from "./interface-settings";

// Новые features для декомпозиции sidebar
export * from "./sidebar-dnd";
export * from "./sidebar-management";
