/**
 * Navigation Data Access Object (DAO)
 * Для работы с API навигации и меню
 * Создает mock данные, так как специальных navigation endpoints нет в API_ENDPOINTS
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  NavigationItem,
  BreadcrumbItem,
  UserNavigationPreferences,
  NavigationItemDTO,
  BreadcrumbItemDTO,
  UserNavigationPreferencesDTO,
  NavigationFilters,
  NavigationItemType,
  NavigationItemStatus,
  NavigationRole,
} from "../model/types";

/**
 * Мапперы для преобразования DTO в Domain типы
 */
class NavigationMappers {
  static itemFromDTO(dto: NavigationItemDTO): NavigationItem {
    return {
      id: dto.id,
      type: dto.type as NavigationItemType,
      title: dto.title,
      description: dto.description,
      path: dto.path,
      externalUrl: dto.external_url,
      icon: undefined, // Иконки обрабатываются отдельно
      color: dto.color,
      badge: dto.badge as NavigationItem,
      status: dto.status as NavigationItemStatus,
      children: dto.children?.map(this.itemFromDTO),
      parentId: dto.parent_id,
      order: dto.order,
      allowedRoles: dto.allowed_roles as NavigationRole[],
      requiresAuth: dto.requires_auth,
      shortcut: dto.shortcut,
      metadata: dto.metadata,
      isDraggable: dto.is_draggable,
      hideInCompact: dto.hide_in_compact,
      group: dto.group,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static breadcrumbFromDTO(dto: BreadcrumbItemDTO): BreadcrumbItem {
    return {
      id: dto.id,
      title: dto.title,
      path: dto.path,
      icon: undefined, // Иконки обрабатываются отдельно
      metadata: dto.metadata,
    };
  }

  static preferencesFromDTO(
    dto: UserNavigationPreferencesDTO
  ): UserNavigationPreferences {
    return {
      userId: dto.user_id,
      favoriteItems: dto.favorite_items,
      hiddenItems: dto.hidden_items,
      customOrder: dto.custom_order,
      sidebarPreferences: {
        isCollapsed: dto.sidebar_preferences.is_collapsed,
        isPinned: dto.sidebar_preferences.is_pinned,
        width: dto.sidebar_preferences.width,
      },
      displayPreferences: {
        showIcons: dto.display_preferences.show_icons,
        showBadges: dto.display_preferences.show_badges,
        showDescriptions: dto.display_preferences.show_descriptions,
        compactMode: dto.display_preferences.compact_mode,
        groupByCategory: dto.display_preferences.group_by_category,
      },
      lastUpdated: new Date(dto.last_updated),
    };
  }

  static itemToDTO(
    item: Omit<NavigationItem, "id" | "createdAt" | "updatedAt">
  ): Omit<NavigationItemDTO, "id" | "created_at" | "updated_at"> {
    return {
      type: item.type,
      title: item.title,
      description: item.description,
      path: item.path,
      external_url: item.externalUrl,
      color: item.color,
      badge: item.badge,
      status: item.status,
      parent_id: item.parentId,
      order: item.order,
      allowed_roles: item.allowedRoles,
      requires_auth: item.requiresAuth,
      shortcut: item.shortcut,
      metadata: item.metadata,
      is_draggable: item.isDraggable,
      hide_in_compact: item.hideInCompact,
      group: item.group,
    };
  }

  static preferencesToDTO(
    preferences: Omit<UserNavigationPreferences, "lastUpdated">
  ): Omit<UserNavigationPreferencesDTO, "last_updated"> {
    return {
      user_id: preferences.userId,
      favorite_items: preferences.favoriteItems,
      hidden_items: preferences.hiddenItems,
      custom_order: preferences.customOrder,
      sidebar_preferences: {
        is_collapsed: preferences.sidebarPreferences.isCollapsed,
        is_pinned: preferences.sidebarPreferences.isPinned,
        width: preferences.sidebarPreferences.width,
      },
      display_preferences: {
        show_icons: preferences.displayPreferences.showIcons,
        show_badges: preferences.displayPreferences.showBadges,
        show_descriptions: preferences.displayPreferences.showDescriptions,
        compact_mode: preferences.displayPreferences.compactMode,
        group_by_category: preferences.displayPreferences.groupByCategory,
      },
    };
  }
}

/**
 * NavigationDAO - класс для работы с API навигации
 * Использует mock данные и dashboard preferences для сохранения настроек
 */
export class NavigationDAO {
  private static instance: NavigationDAO;

  private constructor() {}

  static getInstance(): NavigationDAO {
    if (!NavigationDAO.instance) {
      NavigationDAO.instance = new NavigationDAO();
    }
    return NavigationDAO.instance;
  }

  /**
   * Получить элементы навигации
   * Генерирует mock данные на основе существующих API endpoints
   */
  async getNavigationItems(filters?: NavigationFilters): Promise<{
    items: NavigationItem[];
    userPreferences?: UserNavigationPreferences;
  }> {
    try {
      // Генерируем навигационные элементы на основе API endpoints
      const items = this.generateNavigationItems();

      // Применяем фильтры
      const filteredItems = this.applyFilters(items, filters);

      // Пытаемся получить пользовательские настройки
      let userPreferences: UserNavigationPreferences | undefined;
      try {
        const prefsResponse = await client.get(
          API_ENDPOINTS.DASHBOARD.PREFERENCES
        );
        if (prefsResponse.data.navigationPreferences) {
          userPreferences = NavigationMappers.preferencesFromDTO(
            prefsResponse.data.navigationPreferences
          );
        }
      } catch (error) {
        console.log("Нет сохраненных настроек навигации");
      }

      return {
        items: filteredItems,
        userPreferences,
      };
    } catch (error) {
      console.error("Ошибка получения элементов навигации:", error);

      // Возвращаем базовые элементы при ошибке
      return {
        items: this.generateNavigationItems(),
      };
    }
  }

  /**
   * Получить элемент навигации по ID
   */
  async getNavigationItem(itemId: string): Promise<NavigationItem> {
    const items = this.generateNavigationItems();
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error("Элемент навигации не найден");
    }

    return item;
  }

  /**
   * Получить хлебные крошки для пути
   */
  async getBreadcrumbs(path: string): Promise<BreadcrumbItem[]> {
    try {
      // Генерируем хлебные крошки на основе пути
      const breadcrumbs = this.generateBreadcrumbsFromPath(path);
      return breadcrumbs;
    } catch (error) {
      console.error("Ошибка получения хлебных крошек:", error);
      return [];
    }
  }

  /**
   * Получить настройки пользователя
   * Использует dashboard preferences
   */
  async getUserPreferences(userId: string): Promise<UserNavigationPreferences> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.PREFERENCES);

      if (response.data.navigationPreferences) {
        return NavigationMappers.preferencesFromDTO(
          response.data.navigationPreferences
        );
      }

      return this.getDefaultUserPreferences(userId);
    } catch (error) {
      console.error("Ошибка получения настроек пользователя:", error);
      return this.getDefaultUserPreferences(userId);
    }
  }

  /**
   * Обновить настройки пользователя
   * Использует dashboard preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<
      Omit<UserNavigationPreferences, "userId" | "lastUpdated">
    >
  ): Promise<UserNavigationPreferences> {
    try {
      const payload = {
        navigationPreferences: {
          ...preferences,
          user_id: userId,
          last_updated: new Date().toISOString(),
        },
      };

      await client.post(API_ENDPOINTS.DASHBOARD.PREFERENCES, payload);

      return await this.getUserPreferences(userId);
    } catch (error) {
      console.error("Ошибка обновления настроек пользователя:", error);
      throw new Error("Не удалось обновить настройки пользователя");
    }
  }

  /**
   * Записать переход по элементу (для статистики)
   * Использует dashboard activity
   */
  async recordNavigation(
    _userId: string,
    itemId: string,
    path: string
  ): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.DASHBOARD.CREATE_ACTIVITY, {
        type: "navigation",
        title: "Переход по навигации",
        description: `Переход к ${path}`,
        metadata: { itemId, path },
      });
    } catch (error) {
      console.error("Ошибка записи навигации:", error);
      // Не прерываем работу, это второстепенная функция
    }
  }

  /**
   * Поиск элементов навигации
   */
  async searchNavigationItems(
    query: string,
    _userId?: string,
    limit: number = 20
  ): Promise<NavigationItem[]> {
    try {
      const items = this.generateNavigationItems();
      const lowerQuery = query.toLowerCase();

      const filteredItems = items.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery) ||
          item.path?.toLowerCase().includes(lowerQuery)
      );

      return filteredItems.slice(0, limit);
    } catch (error) {
      console.error("Ошибка поиска элементов навигации:", error);
      return [];
    }
  }

  /**
   * Вспомогательные методы
   */
  private generateNavigationItems(): NavigationItem[] {
    const now = new Date();

    return [
      {
        id: "dashboard",
        type: "page",
        title: "Дашборд",
        description: "Главная страница с обзором",
        path: "/dashboard",
        status: "active",
        order: 1,
        allowedRoles: [
          "admin",
          "project_manager",
          "analyst",
          "developer",
          "tester",
          "viewer",
        ],
        requiresAuth: true,
        isDraggable: true,
        group: "main",
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "dashboard" },
      },
      {
        id: "projects",
        type: "page",
        title: "Проекты",
        description: "Управление проектами",
        path: "/projects",
        status: "active",
        order: 2,
        allowedRoles: ["admin", "project_manager", "analyst", "developer"],
        requiresAuth: true,
        isDraggable: true,
        group: "main",
        badge: { count: 8 },
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "projects" },
      },
      {
        id: "requirements",
        type: "page",
        title: "Требования",
        description: "Управление требованиями",
        path: "/requirements",
        status: "active",
        order: 3,
        allowedRoles: ["admin", "project_manager", "analyst"],
        requiresAuth: true,
        isDraggable: true,
        group: "main",
        badge: { count: 15 },
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "requirements" },
      },
      {
        id: "releases",
        type: "page",
        title: "Релизы",
        description: "Управление релизами",
        path: "/releases",
        status: "active",
        order: 4,
        allowedRoles: ["admin", "project_manager", "developer"],
        requiresAuth: true,
        isDraggable: true,
        group: "main",
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "releases" },
      },
      {
        id: "testing",
        type: "page",
        title: "Тестирование",
        description: "Управление тестированием",
        path: "/testing",
        status: "active",
        order: 5,
        allowedRoles: ["admin", "project_manager", "tester"],
        requiresAuth: true,
        isDraggable: true,
        group: "main",
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "testing" },
      },
      {
        id: "reports",
        type: "page",
        title: "Отчеты",
        description: "Аналитика и отчеты",
        path: "/reports",
        status: "active",
        order: 6,
        allowedRoles: ["admin", "project_manager", "analyst"],
        requiresAuth: true,
        isDraggable: true,
        group: "analytics",
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "reports" },
      },
      {
        id: "admin",
        type: "page",
        title: "Администрирование",
        description: "Системное администрирование",
        path: "/admin",
        status: "active",
        order: 7,
        allowedRoles: ["admin"],
        requiresAuth: true,
        isDraggable: true,
        group: "admin",
        createdAt: now,
        updatedAt: now,
        metadata: { iconName: "settings" },
      },
    ];
  }

  private generateBreadcrumbsFromPath(path: string): BreadcrumbItem[] {
    const segments = path.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Всегда добавляем главную страницу
    breadcrumbs.push({
      id: "home",
      title: "Главная",
      path: "/dashboard",
    });

    // Генерируем хлебные крошки для каждого сегмента
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      const title = this.getSegmentTitle(segment, index, segments);
      breadcrumbs.push({
        id: `segment-${index}`,
        title,
        path: index === segments.length - 1 ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  }

  private getSegmentTitle(
    segment: string,
    index: number,
    segments: string[]
  ): string {
    const titleMap: Record<string, string> = {
      dashboard: "Дашборд",
      projects: "Проекты",
      requirements: "Требования",
      releases: "Релизы",
      testing: "Тестирование",
      reports: "Отчеты",
      admin: "Администрирование",
      settings: "Настройки",
      new: "Создание",
      edit: "Редактирование",
    };

    // Если это ID (числовое значение или UUID)
    if (
      /^\d+$/.test(segment) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      )
    ) {
      const parentSegment = segments[index - 1];
      if (parentSegment === "projects") return `Проект ${segment}`;
      if (parentSegment === "requirements") return `Требование ${segment}`;
      if (parentSegment === "releases") return `Релиз ${segment}`;
      return segment;
    }

    return (
      titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  }

  private getDefaultUserPreferences(userId: string): UserNavigationPreferences {
    return {
      userId,
      favoriteItems: ["dashboard", "projects"],
      hiddenItems: [],
      sidebarPreferences: {
        isCollapsed: false,
        isPinned: true,
      },
      displayPreferences: {
        showIcons: true,
        showBadges: true,
        showDescriptions: false,
        compactMode: false,
        groupByCategory: true,
      },
      lastUpdated: new Date(),
    };
  }

  private applyFilters(
    items: NavigationItem[],
    filters?: NavigationFilters
  ): NavigationItem[] {
    if (!filters) return items;

    let filtered = [...items];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    if (filters.types?.length) {
      filtered = filtered.filter((item) => filters.types!.includes(item.type));
    }

    if (filters.statuses?.length) {
      filtered = filtered.filter((item) =>
        filters.statuses!.includes(item.status)
      );
    }

    if (filters.allowedForRoles?.length) {
      filtered = filtered.filter((item) =>
        item.allowedRoles?.some((role) =>
          filters.allowedForRoles!.includes(role)
        )
      );
    }

    if (filters.groups?.length) {
      filtered = filtered.filter(
        (item) => item.group && filters.groups!.includes(item.group)
      );
    }

    if (filters.favoritesOnly && filters.allowedForRoles?.[0]) {
      // TODO: фильтр по избранным требует получения настроек пользователя
    }

    if (!filters.showHidden) {
      filtered = filtered.filter((item) => item.status !== "hidden");
    }

    return filtered;
  }

  // Заглушки для методов, которые требуют специальных endpoints

  async createNavigationItem(
    item: Omit<NavigationItem, "id" | "createdAt" | "updatedAt">
  ): Promise<NavigationItem> {
    console.log("TODO: createNavigationItem", item);
    return {
      ...item,
      id: `nav_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateNavigationItem(
    itemId: string,
    updates: Partial<Omit<NavigationItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<NavigationItem> {
    console.log("TODO: updateNavigationItem", itemId, updates);
    const items = this.generateNavigationItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error("Элемент не найден");
    return { ...item, ...updates, updatedAt: new Date() };
  }

  async deleteNavigationItem(itemId: string): Promise<void> {
    console.log("TODO: deleteNavigationItem", itemId);
  }

  async updateItemsOrder(itemIds: string[]): Promise<void> {
    console.log("TODO: updateItemsOrder", itemIds);
  }

  async addToFavorites(userId: string, itemId: string): Promise<void> {
    console.log("TODO: addToFavorites", userId, itemId);
  }

  async removeFromFavorites(userId: string, itemId: string): Promise<void> {
    console.log("TODO: removeFromFavorites", userId, itemId);
  }

  async getRecentItems(
    _userId: string,
    limit: number = 10
  ): Promise<NavigationItem[]> {
    const items = this.generateNavigationItems();
    return items.slice(0, limit);
  }

  async updateItemBadge(
    itemId: string,
    badge: NavigationItem["badge"]
  ): Promise<void> {
    console.log("TODO: updateItemBadge", itemId, badge);
  }
}

// Экспорт синглтона
export const navigationDAO = NavigationDAO.getInstance();
