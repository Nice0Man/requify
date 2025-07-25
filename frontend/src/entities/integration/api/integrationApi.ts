import type { Integration, IntegrationCategory } from "../model/types";

export const integrationApi = {
  // Получить все интеграции
  getIntegrations: async (): Promise<Integration[]> => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 100);
    });
  },

  // Получить интеграцию по ID
  getIntegration: async (id: string): Promise<Integration | null> => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 100);
    });
  },

  // Получить категории интеграций
  getCategories: async (): Promise<IntegrationCategory[]> => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 100);
    });
  },

  // Получить популярные интеграции
  getPopularIntegrations: async (): Promise<Integration[]> => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 100);
    });
  },

  // Подключить интеграцию
  connectIntegration: async (
    integrationId: string,
    config: Record<string, any>
  ) => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          connectionId: `conn_${integrationId}_${Date.now()}`,
        });
      }, 1000);
    });
  },

  // Отключить интеграцию
  disconnectIntegration: async (connectionId: string) => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  // Получить статус подключения
  getConnectionStatus: async (integrationId: string) => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          connected: false,
          lastSync: null,
          status: "disconnected" as const,
        });
      }, 200);
    });
  },

  // Синхронизировать данные
  syncIntegration: async (connectionId: string) => {
    // TODO: Заменить на реальный API вызов
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          syncedAt: new Date().toISOString(),
          recordsCount: 0,
        });
      }, 2000);
    });
  },
};
