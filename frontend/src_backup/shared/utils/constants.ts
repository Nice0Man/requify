// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const API_VERSION = "v1";
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const TOKEN_EXPIRY_KEY = "token_expiry";
export const USER_DATA_KEY = "user_data";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
export const ALLOWED_SPREADSHEET_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

// Date Formats
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";
export const ISO_DATE_FORMAT = "yyyy-MM-dd";

// Status Constants
export const PROJECT_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const REQUIREMENT_STATUSES = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  IMPLEMENTED: "implemented",
  TESTED: "tested",
  REJECTED: "rejected",
} as const;

export const REQUIREMENT_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const TEST_STATUSES = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  PASSED: "passed",
  FAILED: "failed",
  BLOCKED: "blocked",
  SKIPPED: "skipped",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  PRODUCT_MANAGER: "product_manager",
  MANAGER: "manager",
  SENIOR_DEVELOPER: "senior_developer",
  DEVELOPER: "developer",
  ANALYST: "analyst",
  TESTER: "tester",
  VIEWER: "viewer",
} as const;

// UI Constants
export const DRAWER_WIDTH = 280;
export const HEADER_HEIGHT = 64;
export const FOOTER_HEIGHT = 48;

// Theme Constants
export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

// Table Constants
export const DEFAULT_SORT_ORDER = "asc";
export const SORTABLE_COLUMNS = {
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  NAME: "name",
  TITLE: "title",
  STATUS: "status",
  PRIORITY: "priority",
} as const;

// Form Constants
export const DEBOUNCE_DELAY = 300;
export const SEARCH_MIN_LENGTH = 2;
export const TEXTAREA_MIN_ROWS = 3;
export const TEXTAREA_MAX_ROWS = 10;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: "theme_preference",
  LANGUAGE: "language_preference",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  TABLE_PREFERENCES: "table_preferences",
  DASHBOARD_LAYOUT: "dashboard_layout",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access forbidden. Please check your permissions.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Successfully created!",
  UPDATED: "Successfully updated!",
  DELETED: "Successfully deleted!",
  SAVED: "Successfully saved!",
  COPIED: "Copied to clipboard!",
  EXPORTED: "Data exported successfully!",
  IMPORTED: "Data imported successfully!",
} as const;

// Feature Flags
export const FEATURES = {
  NOTIFICATIONS: true,
  EXPORT: true,
  IMPORT: true,
  BULK_OPERATIONS: true,
  ADVANCED_SEARCH: true,
  COMMENTS: true,
  FILE_ATTACHMENTS: true,
  REAL_TIME_UPDATES: false,
} as const;

// Chart Colors
export const CHART_COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

// Export all constants as a single object for easier imports
export const CONSTANTS = {
  API_BASE_URL,
  API_VERSION,
  API_TIMEOUT,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRY_KEY,
  USER_DATA_KEY,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_PAGE_SIZE,
  MAX_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_SPREADSHEET_TYPES,
  DATE_FORMAT,
  DATETIME_FORMAT,
  TIME_FORMAT,
  ISO_DATE_FORMAT,
  PROJECT_STATUSES,
  REQUIREMENT_STATUSES,
  REQUIREMENT_PRIORITIES,
  TEST_STATUSES,
  USER_ROLES,
  DRAWER_WIDTH,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  THEME_MODES,
  NOTIFICATION_TYPES,
  DEFAULT_SORT_ORDER,
  SORTABLE_COLUMNS,
  DEBOUNCE_DELAY,
  SEARCH_MIN_LENGTH,
  TEXTAREA_MIN_ROWS,
  TEXTAREA_MAX_ROWS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  CHART_COLORS,
};
