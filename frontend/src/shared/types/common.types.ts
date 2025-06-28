// Common types shared across features

export interface ApiError {
  error: string;
  error_description: string;
  error_details?: Record<string, any>;
  status_code?: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
  page?: number;
  per_page?: number;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BaseFilters {
  search?: string;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormFieldConfig {
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "multiselect"
    | "checkbox"
    | "radio"
    | "date"
    | "datetime"
    | "file";
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
}

export interface FileUpload {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  url?: string;
}

export interface Attachment {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  attachments?: Attachment[];
}

export interface Permission {
  scope: string;
  action: "read" | "write" | "delete" | "admin";
  resource?: string;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  changes: Record<string, { old: any; new: any }>;
  user_id: number;
  user_name: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  user_id: number;
  created_at: string;
  expires_at?: string;
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  REQUIREMENT_UPDATED = "requirement_updated",
  TEST_COMPLETED = "test_completed",
  RELEASE_DEPLOYED = "release_deployed",
  PROJECT_UPDATED = "project_updated",
  COMMENT_ADDED = "comment_added",
  APPROVAL_REQUESTED = "approval_requested",
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastFetch?: string;
}

export interface AsyncData<T> extends LoadingState {
  data: T | null;
}

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filter?: {
    type: "text" | "select" | "date" | "number";
    options?: SelectOption[];
  };
  width?: number | string;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  rowKey: keyof T | ((record: T) => string);
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  selection?: {
    type: "checkbox" | "radio";
    selectedKeys: string[];
    onChange: (selectedKeys: string[], selectedRows: T[]) => void;
  };
  loading?: boolean;
  size?: "small" | "middle" | "large";
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  format?: "number" | "percentage" | "currency" | "duration";
  color?: "primary" | "success" | "warning" | "error";
  icon?: string;
}

export interface Theme {
  mode: "light" | "dark";
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export interface UserPreferences {
  theme: Theme["mode"];
  language: string;
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  table_page_size: number;
  default_project?: number;
}
