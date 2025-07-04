// UI-related типы, используемые в shared слое
// Для API типов используйте @/shared/lib/types/api

// =============================================================================
// UI Form Types
// =============================================================================

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

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
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

// =============================================================================
// File & Attachment Types
// =============================================================================

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

// =============================================================================
// UI State Types
// =============================================================================

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

// =============================================================================
// Table Types
// =============================================================================

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

// =============================================================================
// Date & Time Types
// =============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

// =============================================================================
// Chart Types
// =============================================================================

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

// =============================================================================
// Theme & Preferences
// =============================================================================

export interface Theme {
  mode: "light" | "dark";
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export interface UserUIPreferences {
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

export type BasicUserRole = "admin" | "manager" | "user" | "viewer";
