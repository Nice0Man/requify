export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'requirements' | 'testing' | 'release' | 'custom';
  category: string;
  icon?: string;
  parameters: ReportParameter[];
  outputFormats: Array<'pdf' | 'excel' | 'csv' | 'html'>;
  estimatedDuration: number; // in seconds
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'daterange';
  required: boolean;
  defaultValue?: any;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  description?: string;
  dependsOn?: string; // parameter name that this depends on
}

export interface GenerateReportRequest {
  templateId: string;
  projectId?: string;
  name?: string;
  parameters: Record<string, any>;
  outputFormat: 'pdf' | 'excel' | 'csv' | 'html';
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
  scheduledFor?: string; // ISO date string for scheduled generation
}

export interface ReportStatus {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  projectId?: string;
  projectName?: string;
  status: 'queued' | 'generating' | 'ready' | 'failed' | 'cancelled';
  progress: number; // 0-100
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  downloadUrl?: string;
  downloadExpiry?: string;
  error?: string;
  outputFormat: string;
  fileSize?: number;
  parameters: Record<string, any>;
  generatedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReportSummary {
  totalReports: number;
  readyReports: number;
  generatingReports: number;
  failedReports: number;
  queuedReports: number;
  recentReports: ReportStatus[];
  popularTemplates: Array<{
    templateId: string;
    templateName: string;
    usageCount: number;
  }>;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
}

export interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  projectId?: string;
  projectName?: string;
  parameters: Record<string, any>;
  outputFormat: string;
  schedule: ReportSchedule;
  active: boolean;
  lastRun?: string;
  nextRun: string;
  runCount: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    deliveryMethod: 'email' | 'download';
  }>;
}

export interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval?: number; // every N periods
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  month?: number; // 1-12 for yearly
  time: string; // HH:mm format
  timezone: string;
  endDate?: string; // when to stop generating
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
}

export interface ReportExportOptions {
  includeCharts: boolean;
  includeTables: boolean;
  includeAppendices: boolean;
  pageOrientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  watermark?: string;
  confidentiality?: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface ReportMetrics {
  totalPages?: number;
  totalRecords?: number;
  dataSourcesCount?: number;
  generationTime?: number; // in seconds
  fileSize?: number; // in bytes
  lastUpdated?: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isResolved: boolean;
  parentId?: string; // for replies
}

export interface ReportShare {
  id: string;
  reportId: string;
  sharedWith: Array<{
    id: string;
    name: string;
    email: string;
    type: 'user' | 'group' | 'external';
  }>;
  permissions: Array<'view' | 'download' | 'comment' | 'share'>;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

// Form types for React Hook Form
export interface ReportGenerationForm {
  templateId: string;
  projectId?: string;
  name: string;
  outputFormat: 'pdf' | 'excel' | 'csv' | 'html';
  parameters: Record<string, any>;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  exportOptions: ReportExportOptions;
  scheduleOptions?: {
    isScheduled: boolean;
    schedule?: ReportSchedule;
    recipients?: Array<{ email: string; deliveryMethod: 'email' | 'download' }>;
  };
}

export interface ReportTemplateForm {
  name: string;
  description: string;
  type: 'project' | 'requirements' | 'testing' | 'release' | 'custom';
  category: string;
  parameters: ReportParameter[];
  outputFormats: Array<'pdf' | 'excel' | 'csv' | 'html'>;
  isActive: boolean;
}

// API Response types
export interface ReportsListResponse {
  reports: ReportStatus[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ReportTemplatesResponse {
  templates: ReportTemplate[];
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface ReportGenerationResponse {
  reportId: string;
  estimatedCompletion: string;
  queuePosition?: number;
}

// Filter and search types
export interface ReportFilters {
  status?: Array<'queued' | 'generating' | 'ready' | 'failed' | 'cancelled'>;
  templateIds?: string[];
  projectIds?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  generatedBy?: string[];
  outputFormats?: Array<'pdf' | 'excel' | 'csv' | 'html'>;
}

export interface ReportSearchParams {
  query?: string;
  filters?: ReportFilters;
  sortBy?: 'createdAt' | 'name' | 'status' | 'templateName' | 'projectName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} 