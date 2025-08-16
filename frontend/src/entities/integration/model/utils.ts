import type { Integration, IntegrationCategory } from "./types";
import { INTEGRATIONS } from "./constants";
import { INTEGRATION_CATEGORIES } from "./data";

/**
 * Получить интеграцию по ID
 */
export const getIntegrationById = (id: string): Integration | undefined => {
  return INTEGRATIONS.find((integration) => integration.id === id);
};

/**
 * Получить интеграции по категории
 */
export const getIntegrationsByCategory = (
  categoryId: string
): Integration[] => {
  return INTEGRATIONS.filter(
    (integration) => integration.category === categoryId
  );
};

/**
 * Получить популярные интеграции
 */
export const getPopularIntegrations = (): Integration[] => {
  return INTEGRATIONS.filter((integration) => integration.isPopular);
};

/**
 * Получить новые интеграции
 */
export const getNewIntegrations = (): Integration[] => {
  return INTEGRATIONS.filter((integration) => integration.isNew);
};

/**
 * Получить категорию по ID
 */
export const getCategoryById = (
  id: string
): IntegrationCategory | undefined => {
  return INTEGRATION_CATEGORIES.find((category) => category.id === id);
};

/**
 * Отсортировать интеграции по порядку
 */
export const sortIntegrationsByOrder = (
  integrations: Integration[]
): Integration[] => {
  return [...integrations].sort((a, b) => a.order - b.order);
};

/**
 * Фильтровать интеграции по статусу
 */
export const filterIntegrationsByStatus = (
  integrations: Integration[],
  status: Integration["status"]
): Integration[] => {
  return integrations.filter((integration) => integration.status === status);
};

/**
 * Получить активные интеграции
 */
export const getActiveIntegrations = (): Integration[] => {
  return filterIntegrationsByStatus(INTEGRATIONS, "active");
};
