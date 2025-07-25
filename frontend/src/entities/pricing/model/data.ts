/**
 * Pricing Entity Data - Данные планов подписки
 */

import {
  Star as StarIcon,
  Business as EnterpriseIcon,
  Person as PersonIcon,
  Settings as CustomIcon,
} from "@mui/icons-material";
import type { PricingPlan, PricingData } from "./types";

// =============================================================================
// Планы подписки
// =============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "personal",
    icon: PersonIcon,
    titleKey: "landing.pricing.personal.title",
    defaultTitle: "Personal",
    subtitleKey: "landing.pricing.personal.subtitle",
    defaultSubtitle: "Perfect for individuals",
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    color: "#6366f1",
    features: [
      {
        textKey: "landing.pricing.personal.feature1",
        defaultText: "Up to 5 projects",
        included: true,
      },
      {
        textKey: "landing.pricing.personal.feature2",
        defaultText: "Basic requirements tracking",
        included: true,
      },
      {
        textKey: "landing.pricing.personal.feature3",
        defaultText: "Email support",
        included: true,
      },
      {
        textKey: "landing.pricing.personal.feature4",
        defaultText: "5GB storage",
        included: true,
      },
      {
        textKey: "landing.pricing.personal.feature5",
        defaultText: "Advanced analytics",
        included: false,
      },
      {
        textKey: "landing.pricing.personal.feature6",
        defaultText: "Team collaboration",
        included: false,
      },
    ],
  },
  {
    id: "pro",
    icon: StarIcon,
    titleKey: "landing.pricing.pro.title",
    defaultTitle: "Professional",
    subtitleKey: "landing.pricing.pro.subtitle",
    defaultSubtitle: "For growing teams",
    monthlyPrice: 29,
    yearlyPrice: 290,
    popular: true,
    color: "#10b981",
    features: [
      {
        textKey: "landing.pricing.pro.feature1",
        defaultText: "Unlimited projects",
        included: true,
      },
      {
        textKey: "landing.pricing.pro.feature2",
        defaultText: "Advanced workflow automation",
        included: true,
      },
      {
        textKey: "landing.pricing.pro.feature3",
        defaultText: "Priority support",
        included: true,
      },
      {
        textKey: "landing.pricing.pro.feature4",
        defaultText: "100GB storage",
        included: true,
      },
      {
        textKey: "landing.pricing.pro.feature5",
        defaultText: "Advanced analytics",
        included: true,
      },
      {
        textKey: "landing.pricing.pro.feature6",
        defaultText: "Team collaboration",
        included: true,
      },
    ],
  },
  {
    id: "enterprise",
    icon: EnterpriseIcon,
    titleKey: "landing.pricing.enterprise.title",
    defaultTitle: "Enterprise",
    subtitleKey: "landing.pricing.enterprise.subtitle",
    defaultSubtitle: "For large organizations",
    monthlyPrice: 99,
    yearlyPrice: 990,
    popular: false,
    color: "#8b5cf6",
    features: [
      {
        textKey: "landing.pricing.enterprise.feature1",
        defaultText: "Everything in Professional",
        included: true,
      },
      {
        textKey: "landing.pricing.enterprise.feature2",
        defaultText: "Custom integrations",
        included: true,
      },
      {
        textKey: "landing.pricing.enterprise.feature3",
        defaultText: "24/7 phone support",
        included: true,
      },
      {
        textKey: "landing.pricing.enterprise.feature4",
        defaultText: "Unlimited storage",
        included: true,
      },
      {
        textKey: "landing.pricing.enterprise.feature5",
        defaultText: "Advanced security & compliance",
        included: true,
      },
      {
        textKey: "landing.pricing.enterprise.feature6",
        defaultText: "Dedicated success manager",
        included: true,
      },
    ],
  },  
];

// =============================================================================
// Основные данные ценообразования
// =============================================================================

export const PRICING_DATA: PricingData = {
  plans: PRICING_PLANS,
  defaultBillingPeriod: 'monthly',
  yearlyDiscountPercentage: 20,
};

// =============================================================================
// Утилиты для работы с планами
// =============================================================================

export const getPlanById = (planId: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === planId);
};

export const getPopularPlan = (): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.popular);
};

export const getFreePlan = (): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.monthlyPrice === 0);
};

export const calculatePrice = (plan: PricingPlan, isYearly: boolean): number => {
  return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
};

export const calculateYearlyDiscount = (monthlyPrice: number, yearlyPrice: number): number => {
  if (monthlyPrice === 0 || yearlyPrice === 0) return 0;
  const monthlyTotal = monthlyPrice * 12;
  return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
}; 