/**
 * Pricing Entity API - API для работы с планами подписки
 */

import { apiClient } from "@/shared/api/client";
import type { PricingPlan, PricingData } from "../model/types";

// =============================================================================
// API функции (для будущего использования)
// =============================================================================

export const pricingApi = {
  /**
   * Получить все доступные планы подписки
   */
  getPlans: async (): Promise<PricingPlan[]> => {
    // TODO: Заменить на реальный API endpoint когда будет готов бэкенд
    // return apiClient.get(API_ENDPOINTS.pricing.getPlans);
    
    // Пока возвращаем статические данные
    const { PRICING_PLANS } = await import("../model/data");
    return Promise.resolve(PRICING_PLANS);
  },

  /**
   * Получить конкретный план по ID
   */
  getPlan: async (planId: string): Promise<PricingPlan | null> => {
    // TODO: Заменить на реальный API endpoint когда будет готов бэкенд
    // return apiClient.get(API_ENDPOINTS.pricing.getPlan(planId));
    
    const { getPlanById } = await import("../model/data");
    return Promise.resolve(getPlanById(planId) || null);
  },

  /**
   * Получить конфигурацию ценообразования
   */
  getPricingConfig: async (): Promise<PricingData> => {
    // TODO: Заменить на реальный API endpoint когда будет готов бэкенд
    // return apiClient.get(API_ENDPOINTS.pricing.getConfig);
    
    const { PRICING_DATA } = await import("../model/data");
    return Promise.resolve(PRICING_DATA);
  },

  /**
   * Подписаться на план (будущая функциональность)
   */
  subscribeToPlan: async (planId: string, billingPeriod: 'monthly' | 'yearly') => {
    // TODO: Реализовать когда будет готов бэкенд
    // return apiClient.post(API_ENDPOINTS.pricing.subscribe, { planId, billingPeriod });
    
    console.log(`Subscribing to plan ${planId} with ${billingPeriod} billing`);
    return Promise.resolve({ success: true, planId, billingPeriod });
  },
}; 