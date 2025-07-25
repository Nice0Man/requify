import type {
  QuickAction,
  ActionGroup,
  ActionCategory,
  QuickActionType,
  ActionsFilters,
  ActionUsageStats,
} from "@/features/actions";

/**
 * Получить цвет для категории действий
 */
export const getCategoryColor = (category: ActionCategory): string => {
  const colorMap: Record<ActionCategory, string> = {
    creation: "#2563eb", // Blue
    management: "#059669", // Green
    analysis: "#7c3aed", // Purple
    integration: "#d97706", // Orange
    administration: "#dc2626", // Red
    favorites: "#0891b2", // Cyan
  };

  return colorMap[category] || "#6b7280"; // Gray default
};

/**
 * Получить иконку для типа действия
 */
export const getActionTypeIcon = (type: QuickActionType): string => {
  const iconMap: Record<QuickActionType, string> = {
    create_requirement: "assignment",
    create_project: "folder",
    create_release: "rocket_launch",
    add_user: "person_add",
    run_test: "play_arrow",
    generate_report: "assessment",
    export_data: "download",
    sync_data: "sync",
    backup: "backup",
    settings: "settings",
    custom: "extension",
  };

  return iconMap[type] || "action";
};

/**
 * Фильтровать действия по заданным критериям
 */
export const filterActions = (
  actions: QuickAction[],
  filters: ActionsFilters,
  userRoles: string[] = []
): QuickAction[] => {
  return actions.filter((action) => {
    // Проверка ролей доступа
    if (action.allowedRoles?.length && userRoles.length) {
      const hasRole = action.allowedRoles.some((role) =>
        userRoles.includes(role)
      );
      if (!hasRole) {
        return false;
      }
    }

    // Проверка активности
    if (!action.enabled) {
      return false;
    }

    // Фильтр по категориям
    if (
      filters.categories?.length &&
      !filters.categories.includes(action.category)
    ) {
      return false;
    }

    // Фильтр по типам
    if (filters.types?.length && !filters.types.includes(action.type)) {
      return false;
    }

    // Фильтр по приоритетам
    if (
      filters.priorities?.length &&
      !filters.priorities.includes(action.priority)
    ) {
      return false;
    }

    // Поиск по тексту
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [action.title, action.description, action.shortcut]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Группировать действия по категориям
 */
export const groupActionsByCategory = (
  actions: QuickAction[]
): ActionGroup[] => {
  const grouped = actions.reduce((acc, action) => {
    const category = action.category;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(action);
    return acc;
  }, {} as Record<ActionCategory, QuickAction[]>);

  return Object.entries(grouped).map(([category, categoryActions], index) => ({
    id: category,
    name: getCategoryDisplayName(category as ActionCategory),
    actions: categoryActions,
    order: index,
    collapsible: true,
    defaultCollapsed: false,
  }));
};

/**
 * Получить отображаемое название категории
 */
export const getCategoryDisplayName = (category: ActionCategory): string => {
  const nameMap: Record<ActionCategory, string> = {
    creation: "Создание",
    management: "Управление",
    analysis: "Анализ",
    integration: "Интеграция", 
    administration: "Администрирование",
    favorites: "Избранное",
  };

  return nameMap[category] || category;
};

/**
 * Сортировать действия по приоритету и популярности
 */
export const sortActions = (
  actions: QuickAction[],
  usageStats: ActionUsageStats[] = []
): QuickAction[] => {
  const priorityOrder: Record<string, number> = {
    featured: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const statsMap = usageStats.reduce((acc, stat) => {
    acc[stat.actionId] = stat;
    return acc;
  }, {} as Record<string, ActionUsageStats>);

  return [...actions].sort((a, b) => {
    // Сначала по приоритету
    const priorityDiff =
      (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;

    // Затем по популярности (usageCount из entity)
    const aUsage = a.usageCount || 0;
    const bUsage = b.usageCount || 0;
    
    if (aUsage !== bUsage) {
      return bUsage - aUsage;
    }

    // Если есть статистика, используем её
    const aStats = statsMap[a.id];
    const bStats = statsMap[b.id];

    if (aStats && bStats) {
      return bStats.totalUsage - aStats.totalUsage;
    }

    if (aStats) return -1;
    if (bStats) return 1;

    // В конце по алфавиту
    return a.title.localeCompare(b.title);
  });
};

/**
 * Получить самые используемые действия
 */
export const getMostUsedActions = (
  actions: QuickAction[],
  usageStats: ActionUsageStats[] = [],
  limit: number = 5
): QuickAction[] => {
  const sortedActions = sortActions(actions, usageStats);
  return sortedActions.slice(0, limit);
};

/**
 * Получить недавно использованные действия
 */
export const getRecentActions = (
  actions: QuickAction[],
  usageStats: ActionUsageStats[],
  limit: number = 5,
  withinHours: number = 24
): QuickAction[] => {
  const cutoffTime = new Date(Date.now() - withinHours * 60 * 60 * 1000);

  const statsMap = usageStats.reduce((acc, stat) => {
    acc[stat.actionId] = stat;
    return acc;
  }, {} as Record<string, ActionUsageStats>);

  return actions
    .filter((action) => {
      // Проверяем lastUsedAt из entity или статистику
      if (action.lastUsedAt && action.lastUsedAt > cutoffTime) {
        return true;
      }
      
      const stats = statsMap[action.id];
      return stats && stats.lastUsed && stats.lastUsed > cutoffTime;
    })
    .sort((a, b) => {
      const aLastUsed = a.lastUsedAt?.getTime() || 
                       statsMap[a.id]?.lastUsed?.getTime() || 0;
      const bLastUsed = b.lastUsedAt?.getTime() || 
                       statsMap[b.id]?.lastUsed?.getTime() || 0;
      return bLastUsed - aLastUsed;
    })
    .slice(0, limit);
};

/**
 * Проверить доступность действия для пользователя
 */
export const isActionAvailable = (
  action: QuickAction,
  userRoles: string[] = []
): boolean => {
  // Проверка на отключенность
  if (!action.enabled) {
    return false;
  }

  // Проверка ролей доступа
  if (action.allowedRoles?.length && userRoles.length) {
    return action.allowedRoles.some((role) =>
      userRoles.includes(role)
    );
  }

  // Если ролей не указано, действие доступно всем
  return true;
};

/**
 * Форматировать горячие клавиши
 */
export const formatShortcut = (shortcut: string): string => {
  return shortcut
    .replace(/ctrl/gi, "Ctrl")
    .replace(/alt/gi, "Alt")
    .replace(/shift/gi, "Shift")
    .replace(/cmd/gi, "⌘")
    .replace(/\+/g, " + ");
};

/**
 * Создать действие по умолчанию
 */
export const createDefaultAction = (
  type: QuickActionType,
  title: string
): Omit<QuickAction, "id" | "createdAt" | "lastUsedAt" | "usageCount"> => {
  return {
    type,
    title,
    category: "creation",
    priority: "medium",
    enabled: true,
    metadata: {},
  };
};

/**
 * Валидировать действие
 */
export const validateAction = (action: Partial<QuickAction>): boolean => {
  return !!(
    action.type &&
    action.title &&
    action.category &&
    action.priority
  );
};
