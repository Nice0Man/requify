import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { handleApiError } from "@/shared/api/utils";
import type { Integration, IntegrationCategory } from "../model/types";

export const integrationApi = {
  /**
   * Получить все доступные интеграции
   */
  getIntegrations: async (): Promise<Integration[]> => {
    try {
      const response = await client.get(API_ENDPOINTS.INTEGRATIONS.LIST);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Получить интеграцию по ID
   */
  getIntegration: async (id: string): Promise<Integration> => {
    try {
      const response = await client.get(API_ENDPOINTS.INTEGRATIONS.GET(id));
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Получить категории интеграций
   */
  getCategories: async (): Promise<IntegrationCategory[]> => {
    try {
      const response = await client.get(API_ENDPOINTS.INTEGRATIONS.CATEGORIES);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Получить популярные интеграции
   */
  getPopularIntegrations: async (): Promise<Integration[]> => {
    try {
      const response = await client.get(API_ENDPOINTS.INTEGRATIONS.POPULAR);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Подключить интеграцию
   */
  connectIntegration: async (
    integrationId: string,
    config: Record<string, any>
  ): Promise<{ success: boolean; connectionId: string }> => {
    try {
      const response = await client.post(API_ENDPOINTS.INTEGRATIONS.CONNECT, {
        integrationId,
        config,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Отключить интеграцию
   */
  disconnectIntegration: async (
    connectionId: string
  ): Promise<{ success: boolean }> => {
    try {
      const response = await client.delete(
        API_ENDPOINTS.INTEGRATIONS.DISCONNECT(connectionId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Получить статус подключения
   */
  getConnectionStatus: async (integrationId: string): Promise<{
    connected: boolean;
    lastSync: string | null;
    status: "connected" | "disconnected" | "error";
  }> => {
    try {
      const response = await client.get(
        API_ENDPOINTS.INTEGRATIONS.CONNECTION_STATUS(integrationId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Синхронизировать данные интеграции
   */
  syncIntegration: async (connectionId: string): Promise<{
    success: boolean;
    syncedAt: string;
    recordsCount: number;
  }> => {
    try {
      const response = await client.post(
        API_ENDPOINTS.INTEGRATIONS.SYNC(connectionId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Получить все подключения пользователя
   */
  getConnections: async (): Promise<any[]> => {
    try {
      const response = await client.get(API_ENDPOINTS.INTEGRATIONS.CONNECTIONS);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },
};
