/**
 * Pricing Entity Types - Типы сущности ценообразования
 * Соответствуют структуре планов подписки
 */

// =============================================================================
// Основные типы планов подписки
// =============================================================================

export interface PricingPlanFeature {
  textKey: string;
  defaultText: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  icon: React.ComponentType<any>;
  titleKey: string;
  defaultTitle: string;
  subtitleKey: string;
  defaultSubtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  color: string;
  features: PricingPlanFeature[];
  custom?: boolean;
}

// =============================================================================
// Billing типы
// =============================================================================

export type BillingPeriod = "monthly" | "yearly";

export interface BillingInfo {
  period: BillingPeriod;
  discountPercentage?: number;
}

// =============================================================================
// Pricing данные и константы
// =============================================================================

export interface PricingData {
  plans: PricingPlan[];
  defaultBillingPeriod: BillingPeriod;
  yearlyDiscountPercentage: number;
}

// =============================================================================
// UI Props типы
// =============================================================================

export interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  isPopular?: boolean;
  onSelectPlan?: (planId: string) => void;
}

export interface BillingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
  discountPercentage?: number;
}

export interface PricingHeaderProps {
  title: string;
  subtitle: string;
  highlightText?: string;
}
