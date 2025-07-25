// Quick Actions Model - экспорт типов и утилит

// Types (включает re-export из entity)
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
} from "./types";

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
} from "./utils"; 