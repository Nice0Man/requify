/**
 * Report Entity Types - Типы сущности отчетов
 * Соответствуют backend API schemas (backend/app/schemas/report.py)
 */

// =============================================================================
// Enums (соответствуют backend схемам)
// =============================================================================

export const REPORT_TYPES = [
  "specification",
  "requirements",
  "project_summary",
  "progress",
  "testing",
  "audit",
  "trace_matrix",
  "custom",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_FORMATS = [
  "html",
  "pdf",
  "docx",
  "xlsx",
  "json",
  "csv",
  "xml",
] as const;

export type ReportFormat = (typeof REPORT_FORMATS)[number];

export const REPORT_STATUSES = [
  "pending",
  "generating",
  "completed", 
  "failed",
  "cancelled",
  "expired",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

// =============================================================================
// Report Types
// =============================================================================

export interface ReportBase {
  status: ReportStatus;
  format: ReportFormat;
  generated_at: string;
}

export interface ReportCreate extends ReportBase {
  generated_by: string;
  config: ReportConfig;
  type: ReportType;
  name?: string;
  description?: string;
}

export interface ReportUpdate {
  status?: ReportStatus;
  file_path?: string;
  file_size?: number;
  download_url?: string;
  error_message?: string;
}

export interface Report extends ReportBase {
  id: number;
  generated_by: string;
  file_path?: string;
  file_size?: number;
  download_url?: string;
  config: ReportConfig;
  created_at: string;
  updated_at: string;
  
  // Дополнительные поля
  spec_id?: number;
  spec_name?: string;
  project_id?: number;
  project_name?: string;
  type: ReportType;
  name?: string;
  description?: string;
  error_message?: string;
  expires_at?: string;
  
  // Связанные данные (опционально загружаются)
  generated_by_user?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  project?: {
    id: number;
    name: string;
    code: string;
  };
  specification?: {
    id: number;
    name: string;
    version: string;
  };
}

export interface ReportWithDetails extends Report {
  requirements_count?: number;
  pages_count?: number;
  generation_time_ms?: number;
  file_url?: string;
  
  // Дополнительная статистика
  total_sections?: number;
  total_images?: number;
  total_tables?: number;
  total_references?: number;
  compression_ratio?: number;
}

// =============================================================================
// Report Configuration Types
// =============================================================================

export interface ReportFilter {
  project_ids?: number[];
  requirement_types?: number[];
  requirement_statuses?: number[];
  requirement_priorities?: number[];
  date_from?: string;
  date_to?: string;
  author_ids?: number[];
  tags?: string[];
  
  // Дополнительные фильтры
  include_archived?: boolean;
  include_deleted?: boolean;
  min_completion?: number;
  max_completion?: number;
  search_query?: string;
}

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  filters?: ReportFilter;
  include_details: boolean;
  include_statistics: boolean;
  include_charts: boolean;
  group_by?: string;
  sort_by?: string;
  template?: string;
  
  // Дополнительные настройки
  page_size?: "A4" | "A3" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  include_toc?: boolean;
  include_appendix?: boolean;
  watermark?: string;
  header_text?: string;
  footer_text?: string;
  include_metadata?: boolean;
  custom_sections?: ReportSection[];
  styling?: ReportStyling;
}

export interface ReportSection {
  id: string;
  title: string;
  type: "text" | "table" | "chart" | "image" | "list" | "custom";
  order: number;
  content: any;
  settings?: {
    page_break_before?: boolean;
    page_break_after?: boolean;
    include_in_toc?: boolean;
    level?: number;
  };
}

export interface ReportStyling {
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  font_size?: number;
  line_height?: number;
  margin_top?: number;
  margin_bottom?: number;
  margin_left?: number;
  margin_right?: number;
  logo_url?: string;
  custom_css?: string;
}

// =============================================================================
// Report Templates
// =============================================================================

export interface ReportTemplate {
  id: number;
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  config: ReportConfig;
  is_default: boolean;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  created_by_user?: {
    id: number;
    username: string;
    full_name?: string;
  };
  usage_count?: number;
  last_used_at?: string;
  preview_url?: string;
}

export interface ReportTemplateCreate {
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  config: ReportConfig;
  is_default?: boolean;
  is_public?: boolean;
}

export interface ReportTemplateUpdate {
  name?: string;
  description?: string;
  config?: ReportConfig;
  is_default?: boolean;
  is_public?: boolean;
}

// =============================================================================
// Report Generation
// =============================================================================

export interface ReportGenerationRequest {
  type: ReportType;
  format: ReportFormat;
  config: ReportConfig;
  template_id?: number;
  name?: string;
  description?: string;
  priority?: "low" | "normal" | "high";
  async_generation?: boolean;
  notify_on_completion?: boolean;
  expires_after_hours?: number;
}

export interface ReportGenerationJob {
  id: string;
  report_id?: number;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
  error_message?: string;
  result_url?: string;
  
  // Метаданные генерации
  steps_total?: number;
  steps_completed?: number;
  current_step?: string;
  processing_time_ms?: number;
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
}

// =============================================================================
// Report Analytics
// =============================================================================

export interface ReportAnalytics {
  total_reports: number;
  reports_by_type: Record<ReportType, number>;
  reports_by_format: Record<ReportFormat, number>;
  reports_by_status: Record<ReportStatus, number>;
  average_generation_time: number;
  total_file_size: number;
  most_popular_templates: ReportTemplate[];
  generation_trend: {
    date: string;
    count: number;
    avg_size: number;
    avg_time: number;
  }[];
  user_activity: {
    user_id: number;
    username: string;
    report_count: number;
    last_generated: string;
  }[];
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ReportListResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ReportDetailResponse {
  report: ReportWithDetails;
}

export interface ReportTemplateListResponse {
  templates: ReportTemplate[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ReportAnalyticsResponse {
  analytics: ReportAnalytics;
  generated_at: string;
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ReportType;
  format?: ReportFormat;
  status?: ReportStatus;
  project_id?: number;
  generated_by?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: "created_at" | "updated_at" | "generated_at" | "file_size" | "name";
  sort_order?: "asc" | "desc";
  include_details?: boolean;
  include_expired?: boolean;
}

export interface ReportTemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ReportType;
  format?: ReportFormat;
  is_public?: boolean;
  created_by?: number;
  sort_by?: "name" | "created_at" | "usage_count" | "last_used_at";
  sort_order?: "asc" | "desc";
}

// =============================================================================
// Bulk Operations
// =============================================================================

export interface ReportBulkOperation {
  report_ids: number[];
  action: "delete" | "regenerate" | "download" | "archive" | "share";
  config?: {
    archive_format?: "zip" | "tar";
    share_expires_hours?: number;
    share_password?: string;
  };
}

// =============================================================================
// Report Sharing
// =============================================================================

export interface ReportShare {
  id: number;
  report_id: number;
  share_token: string;
  shared_by: number;
  shared_with?: string; // email
  expires_at?: string;
  password_protected: boolean;
  download_count: number;
  max_downloads?: number;
  created_at: string;
  
  // Связанные данные
  report?: Report;
  shared_by_user?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface ReportShareCreate {
  report_id: number;
  shared_with?: string;
  expires_hours?: number;
  password?: string;
  max_downloads?: number;
  allow_preview?: boolean;
}

// =============================================================================
// Report Scheduling
// =============================================================================

export interface ReportSchedule {
  id: number;
  name: string;
  description?: string;
  config: ReportConfig;
  template_id?: number;
  cron_expression: string;
  timezone: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Настройки уведомлений
  notify_on_success?: boolean;
  notify_on_failure?: boolean;
  notification_emails?: string[];
  webhook_url?: string;
  
  // Связанные данные
  created_by_user?: {
    id: number;
    username: string;
    full_name?: string;
  };
  generated_reports?: Report[];
  last_run_status?: "success" | "failed" | "skipped";
  run_count?: number;
}

export interface ReportScheduleCreate {
  name: string;
  description?: string;
  config: ReportConfig;
  template_id?: number;
  cron_expression: string;
  timezone?: string;
  notify_on_success?: boolean;
  notify_on_failure?: boolean;
  notification_emails?: string[];
  webhook_url?: string;
}