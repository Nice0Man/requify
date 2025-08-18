// Quick Actions Widget - полный экспорт по FSD архитектуре

// UI Components
export { QuickActionsWidget } from "./ui";

// Model Types and Utils
export type {
  QuickActionsDisplayConfig,
  QuickActionsWidgetProps,
  
  // Re-exported from entity
  QuickActionType,
  ActionCategory,
  ActionPriority,
  QuickAction,
  ActionGroup,
  ActionsFilters,
  ActionUsageStats,
  UserActionsConfig,
} from "./model";

// Utils
export {
  getCategoryColor,
  getActionTypeIcon,
  filterActions,
  groupActionsByCategory,
  getCategoryDisplayName,
  sortActions,
  getMostUsedActions,
  getRecentActions,
  isActionAvailable,
  formatShortcut,
  createDefaultAction,
  validateAction,
} from "./model"; 