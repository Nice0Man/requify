/**
 * Company Entity Types - Типы сущности компаний
 * Соответствуют backend API schemas (backend/app/schemas/company.py)
 */

// =============================================================================
// Enums (соответствуют backend схемам)
// =============================================================================

export const COMPANY_TYPES = [
  "startup",
  "small_business", 
  "medium_business",
  "enterprise",
  "non_profit",
  "government", 
  "educational",
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number];

export const COMPANY_STATUSES = [
  "active",
  "suspended",
  "inactive", 
  "trial",
  "archived",
] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

// =============================================================================
// Основные типы компаний (соответствуют backend/app/schemas/company.py)
// =============================================================================

export interface CompanyBase {
  name: string;
  slug?: string;
  legal_name?: string;
  description?: string;
  type: CompanyType;
  industry?: string;
  size_category?: string;
  employee_count?: number;
  status: CompanyStatus;
  is_active: boolean;
}

export interface CompanyCreate extends CompanyBase {
  name: string;
}

export interface CompanyUpdate {
  name?: string;
  slug?: string;
  legal_name?: string;
  description?: string;
  type?: CompanyType;
  industry?: string;
  size_category?: string;
  employee_count?: number;
  status?: CompanyStatus;
  is_active?: boolean;
}

export interface Company extends CompanyBase {
  id: number;
  created_at: string;
  updated_at: string;
  total_users?: number;
  total_projects?: number;
  total_departments?: number;
}

export interface CompanyWithDetails extends Company {
  branding?: CompanyBranding;
  settings?: CompanySettings;
  subscription?: CompanySubscription;
  contacts?: CompanyContact[];
  stats?: CompanyStatsResponse;
}

// =============================================================================
// Company Branding Types (company_branding.py)
// =============================================================================

export interface CompanyBranding {
  id: number;
  company_id: number;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  custom_css?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyBrandingCreate {
  company_id: number;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  custom_css?: string;
}

export interface CompanyBrandingUpdate {
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  custom_css?: string;
}

// =============================================================================
// Company Settings Types (company_settings.py)
// =============================================================================

export interface CompanySettings {
  id: number;
  company_id: number;
  timezone: string;
  default_language: string;
  date_format: string;
  time_format: string;
  currency: string;
  allow_user_registration: boolean;
  require_email_verification: boolean;
  enable_two_factor_auth: boolean;
  session_timeout_minutes: number;
  max_file_upload_size_mb: number;
  allowed_file_types: string[];
  created_at: string;
  updated_at: string;
}

export interface CompanySettingsUpdate {
  timezone?: string;
  default_language?: string;
  date_format?: string;
  time_format?: string;
  currency?: string;
  allow_user_registration?: boolean;
  require_email_verification?: boolean;
  enable_two_factor_auth?: boolean;
  session_timeout_minutes?: number;
  max_file_upload_size_mb?: number;
  allowed_file_types?: string[];
}

// =============================================================================
// Company Subscription Types (company_subscription.py)
// =============================================================================

export const SUBSCRIPTION_PLANS = [
  "free",
  "starter",
  "professional",
  "enterprise",
  "custom",
] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "past_due",
  "canceled",
  "trial",
  "incomplete",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface CompanySubscription {
  id: number;
  company_id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  max_users: number;
  max_projects: number;
  max_storage_gb: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface CompanySubscriptionUpdate {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  max_users?: number;
  max_projects?: number;
  max_storage_gb?: number;
  features?: string[];
}

// =============================================================================
// Company Contact Types (company_contact.py)
// =============================================================================

export interface CompanyContact {
  id: number;
  company_id: number;
  website?: string; //TODO: add website type on backend and frontend
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyContactCreate {
  company_id: number;
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_primary?: boolean;
}

export interface CompanyContactUpdate {
  type?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_primary?: boolean;
}

// =============================================================================
// API Response типы
// =============================================================================

export interface CompanyListResponse {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CompanyDetailResponse {
  company: Company;
}

export interface CompanyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CompanyType;
  status?: CompanyStatus;
  industry?: string;
  sort_by?: "name" | "created_at" | "updated_at" | "employee_count";
  sort_order?: "asc" | "desc";
}

export interface CompanyBulkOperation {
  company_ids: number[];
  action: "activate" | "deactivate" | "delete" | "archive";
}

export interface CompanyValidationResult {
  is_valid: boolean;
  errors: Record<string, string[]>;
}

export interface CompanyStatsResponse {
  total_users: number;
  total_projects: number;
  total_departments: number;
  active_projects: number;
  recent_activity_count: number;
  storage_used_gb: number;
  subscription_status: SubscriptionStatus;
}