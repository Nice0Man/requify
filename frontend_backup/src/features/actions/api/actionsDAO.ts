/**
 * Actions Data Access Object (DAO)
 * Для работы с API быстрых действий
 * Использует только существующие API_ENDPOINTS
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  QuickAction,
  ActionGroup,
  ActionUsageStats,
  UserActionsConfig,
  QuickActionDTO,
  ActionGroupDTO,
  ActionUsageStatsDTO,
  UserActionsConfigDTO,
  ActionsFilters,
  ActionsResponse,
  ActionStatsResponse,
  UserConfigResponse,
  QuickActionType,
  ActionCategory,
  ActionPriority,
} from "../model/types";

/**
 * Мапперы для преобразования DTO в Domain типы
 */
class ActionsMappers {
  static actionFromDTO(dto: QuickActionDTO): QuickAction {
    return {
      id: dto.id,
      type: dto.type as QuickActionType,
      title: dto.title,
      description: dto.description,
      category: dto.category as ActionCategory,
      priority: dto.priority as ActionPriority,
      enabled: dto.enabled,
      allowedRoles: dto.allowed_roles,
      url: dto.url,
      shortcut: dto.shortcut,
      color: dto.color,
      order: dto.order,
      metadata: dto.metadata,
      createdAt: new Date(dto.created_at),
      lastUsedAt: dto.last_used_at ? new Date(dto.last_used_at) : undefined,
      usageCount: dto.usage_count,
    };
  }

  static groupFromDTO(dto: ActionGroupDTO): ActionGroup {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      actions: dto.actions.map(this.actionFromDTO),
      color: dto.color,
      order: dto.order,
      collapsible: dto.collapsible,
      defaultCollapsed: dto.default_collapsed,
    };
  }

  static statsFromDTO(dto: ActionUsageStatsDTO): ActionUsageStats {
    return {
      actionId: dto.action_id,
      totalUsage: dto.total_usage,
      dailyUsage: dto.daily_usage,
      weeklyUsage: dto.weekly_usage,
      monthlyUsage: dto.monthly_usage,
      lastUsed: dto.last_used ? new Date(dto.last_used) : undefined,
      averageFrequency: dto.average_frequency,
      trend: dto.trend as any,
    };
  }

  static configFromDTO(dto: UserActionsConfigDTO): UserActionsConfig {
    return {
      userId: dto.user_id,
      favoriteActions: dto.favorite_actions,
      hiddenActions: dto.hidden_actions,
      customOrder: dto.custom_order,
      customGroups: dto.custom_groups?.map(this.groupFromDTO),
      displaySettings: {
        showIcons: dto.display_settings.show_icons,
        showDescriptions: dto.display_settings.show_descriptions,
        showShortcuts: dto.display_settings.show_shortcuts,
        compactMode: dto.display_settings.compact_mode,
        groupByCategory: dto.display_settings.group_by_category,
      },
      lastUpdated: new Date(dto.last_updated),
    };
  }

  static actionToDTO(action: Omit<QuickAction, "id" | "createdAt" | "lastUsedAt" | "usageCount">): Omit<QuickActionDTO, "id" | "created_at" | "last_used_at" | "usage_count"> {
    return {
      type: action.type,
      title: action.title,
      description: action.description,
      category: action.category,
      priority: action.priority,
      enabled: action.enabled,
      allowed_roles: action.allowedRoles,
      url: action.url,
      shortcut: action.shortcut,
      color: action.color,
      order: action.order,
      metadata: action.metadata,
    };
  }
}

/**
 * ActionsDAO - класс для работы с API действий
 * Использует dashboard endpoints из API_ENDPOINTS
 */
export class ActionsDAO {
  private static instance: ActionsDAO;

  private constructor() {}

  static getInstance(): ActionsDAO {
    if (!ActionsDAO.instance) {
      ActionsDAO.instance = new ActionsDAO();
    }
    return ActionsDAO.instance;
  }

  /**
   * Получить все доступные действия
   * Создает mock данные на основе существующих endpoints
   */
  async getActions(filters?: ActionsFilters): Promise<{
    actions: QuickAction[];
    groups: ActionGroup[];
  }> {
    try {
      // Генерируем действия на основе существующих API endpoints
      const actions = this.generateActionsFromEndpoints();
      
      // Группируем по категориям
      const groups = this.groupActionsByCategory(actions);

      // Применяем фильтры
      const filteredActions = this.applyFilters(actions, filters);

      return {
        actions: filteredActions,
        groups,
      };
    } catch (error) {
      console.error("Ошибка получения действий:", error);
      throw new Error("Не удалось получить действия");
    }
  }

  /**
   * Выполнить действие
   * Симулирует выполнение на основе типа действия
   */
  async executeAction(actionId: string, context?: Record<string, any>): Promise<void> {
    try {
      // Записываем использование действия
      await this.recordActionUsage(actionId);
      
      // В реальном приложении здесь была бы логика выполнения конкретных действий
      console.log(`Выполнение действия ${actionId}`, context);
    } catch (error) {
      console.error("Ошибка выполнения действия:", error);
      throw new Error("Не удалось выполнить действие");
    }
  }

  /**
   * Записать использование действия
   * Использует dashboard activity endpoint
   */
  async recordActionUsage(actionId: string): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.DASHBOARD.CREATE_ACTIVITY, {
        type: "action_executed",
        title: "Выполнено быстрое действие",
        description: `Действие ${actionId} было выполнено`,
        metadata: { actionId },
      });
    } catch (error) {
      console.error("Ошибка записи использования действия:", error);
      // Не прерываем выполнение, так как это второстепенная функция
    }
  }

  /**
   * Получить статистику использования действий
   * Использует dashboard activity для получения данных
   */
  async getActionStats(
    userId?: string,
    timeRange?: { from: Date; to: Date }
  ): Promise<ActionUsageStats[]> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.ACTIVITY);
      
      // Фильтруем активность по действиям
      const actionActivities = response.data.filter((activity: any) => 
        activity.type === "action_executed"
      );

      // Группируем по действиям и создаем статистику
      const statsMap: Record<string, ActionUsageStats> = {};
      
      actionActivities.forEach((activity: any) => {
        const actionId = activity.metadata?.actionId;
        if (!actionId) return;

        if (!statsMap[actionId]) {
          statsMap[actionId] = {
            actionId,
            totalUsage: 0,
            dailyUsage: 0,
            weeklyUsage: 0,
            monthlyUsage: 0,
            averageFrequency: 0,
            trend: "stable",
          };
        }

        statsMap[actionId].totalUsage++;
        
        const activityDate = new Date(activity.created_at);
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        if (activityDate > dayAgo) statsMap[actionId].dailyUsage++;
        if (activityDate > weekAgo) statsMap[actionId].weeklyUsage++;
        if (activityDate > monthAgo) statsMap[actionId].monthlyUsage++;
      });

      return Object.values(statsMap);
    } catch (error) {
      console.error("Ошибка получения статистики действий:", error);
      return [];
    }
  }

  /**
   * Получить настройки пользователя
   * Использует dashboard preferences
   */
  async getUserConfig(userId: string): Promise<UserActionsConfig> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.PREFERENCES);
      
      // Создаем конфигурацию по умолчанию если нет сохраненной
      const defaultConfig: UserActionsConfig = {
        userId,
        favoriteActions: [],
        hiddenActions: [],
        displaySettings: {
          showIcons: true,
          showDescriptions: true,
          showShortcuts: true,
          compactMode: false,
          groupByCategory: true,
        },
        lastUpdated: new Date(),
      };

      if (response.data.actionsConfig) {
        return ActionsMappers.configFromDTO(response.data.actionsConfig);
      }

      return defaultConfig;
    } catch (error) {
      console.error("Ошибка получения конфигурации пользователя:", error);
      throw new Error("Не удалось получить конфигурацию пользователя");
    }
  }

  /**
   * Обновить настройки пользователя
   * Использует dashboard preferences
   */
  async updateUserConfig(
    userId: string,
    config: Partial<Omit<UserActionsConfig, "userId" | "lastUpdated">>
  ): Promise<UserActionsConfig> {
    try {
      const payload = {
        actionsConfig: {
          ...config,
          last_updated: new Date().toISOString(),
        },
      };

      await client.post(API_ENDPOINTS.DASHBOARD.PREFERENCES, payload);
      
      // Возвращаем обновленную конфигурацию
      return await this.getUserConfig(userId);
    } catch (error) {
      console.error("Ошибка обновления конфигурации пользователя:", error);
      throw new Error("Не удалось обновить конфигурацию пользователя");
    }
  }

  /**
   * Генерация действий на основе API endpoints
   */
  private generateActionsFromEndpoints(): QuickAction[] {
    const now = new Date();
    
    return [
      {
        id: "create_project",
        type: "create_project",
        title: "Создать проект",
        description: "Создать новый проект",
        category: "creation",
        priority: "high",
        enabled: true,
        url: "/projects/new",
        color: "#2563eb",
        order: 1,
        createdAt: now,
        usageCount: 0,
        metadata: { endpoint: API_ENDPOINTS.PROJECTS.CREATE },
      },
      {
        id: "create_requirement",
        type: "create_requirement",
        title: "Добавить требование",
        description: "Создать новое требование",
        category: "creation",
        priority: "high",
        enabled: true,
        url: "/requirements/new",
        color: "#059669",
        order: 2,
        createdAt: now,
        usageCount: 0,
        metadata: { endpoint: API_ENDPOINTS.REQUIREMENTS.CREATE },
      },
      {
        id: "create_release",
        type: "create_release",
        title: "Создать релиз",
        description: "Создать новый релиз",
        category: "creation",
        priority: "medium",
        enabled: true,
        url: "/releases/new",
        color: "#7c3aed",
        order: 3,
        createdAt: now,
        usageCount: 0,
        metadata: { endpoint: API_ENDPOINTS.RELEASES.CREATE },
      },
      {
        id: "add_user",
        type: "add_user",
        title: "Добавить пользователя",
        description: "Добавить нового пользователя",
        category: "management",
        priority: "medium",
        enabled: true,
        url: "/users/new",
        color: "#d97706",
        order: 4,
        createdAt: now,
        usageCount: 0,
        metadata: { endpoint: API_ENDPOINTS.USERS.CREATE },
      },
      {
        id: "view_dashboard",
        type: "custom",
        title: "Дашборд",
        description: "Перейти к дашборду",
        category: "management",
        priority: "featured",
        enabled: true,
        url: "/dashboard",
        color: "#0891b2",
        order: 0,
        createdAt: now,
        usageCount: 0,
        metadata: { endpoint: API_ENDPOINTS.DASHBOARD.ROOT },
      },
    ];
  }

  /**
   * Группировка действий по категориям
   */
  private groupActionsByCategory(actions: QuickAction[]): ActionGroup[] {
    const groups: Record<ActionCategory, QuickAction[]> = {
      creation: [],
      management: [],
      analysis: [],
      integration: [],
      administration: [],
      favorites: [],
    };

    actions.forEach(action => {
      if (groups[action.category]) {
        groups[action.category].push(action);
      }
    });

    return Object.entries(groups)
      .filter(([_, actions]) => actions.length > 0)
      .map(([category, actions], index) => ({
        id: category,
        name: this.getCategoryName(category as ActionCategory),
        actions,
        order: index,
        collapsible: true,
        defaultCollapsed: false,
      }));
  }

  /**
   * Получение названия категории
   */
  private getCategoryName(category: ActionCategory): string {
    const names: Record<ActionCategory, string> = {
      creation: "Создание",
      management: "Управление",
      analysis: "Анализ",
      integration: "Интеграция",
      administration: "Администрирование",
      favorites: "Избранное",
    };
    return names[category];
  }

  /**
   * Применение фильтров
   */
  private applyFilters(actions: QuickAction[], filters?: ActionsFilters): QuickAction[] {
    if (!filters) return actions;

    let filtered = [...actions];

    if (filters.categories?.length) {
      filtered = filtered.filter(action => filters.categories!.includes(action.category));
    }

    if (filters.types?.length) {
      filtered = filtered.filter(action => filters.types!.includes(action.type));
    }

    if (filters.priorities?.length) {
      filtered = filtered.filter(action => filters.priorities!.includes(action.priority));
    }

    if (filters.enabledOnly) {
      filtered = filtered.filter(action => action.enabled);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(query) ||
        action.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Заглушки для совместимости с интерфейсом

  async addToFavorites(userId: string, actionId: string): Promise<void> {
    console.log("TODO: addToFavorites", userId, actionId);
  }

  async removeFromFavorites(userId: string, actionId: string): Promise<void> {
    console.log("TODO: removeFromFavorites", userId, actionId);
  }

  async getPopularActions(limit: number = 10): Promise<QuickAction[]> {
    const actions = await this.getActions();
    return actions.actions.slice(0, limit);
  }

  async getRecentActions(userId: string, limit: number = 10): Promise<QuickAction[]> {
    const actions = await this.getActions();
    return actions.actions.slice(0, limit);
  }

  async createCustomAction(
    action: Omit<QuickAction, "id" | "createdAt" | "lastUsedAt" | "usageCount">
  ): Promise<QuickAction> {
    console.log("TODO: createCustomAction", action);
    return {
      ...action,
      id: `custom_${Date.now()}`,
      createdAt: new Date(),
      usageCount: 0,
    };
  }
}

// Экспорт синглтона
export const actionsDAO = ActionsDAO.getInstance(); 