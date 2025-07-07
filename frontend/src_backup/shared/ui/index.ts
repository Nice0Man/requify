// Core UI Components
export { ErrorBoundary } from "./ErrorBoundary";
export { Footer } from "./Footer";
export { SimpleFooter } from "./SimpleFooter";
export { Layout } from "./Layout";

// Loading Components
export {
  LoadingSpinner,
  PageLoadingSpinner,
  OverlayLoadingSpinner,
  InlineLoadingSpinner,
} from "./LoadingSpinner";

// Page Transitions
export {
  PageTransition,
  RouteTransition,
  StaggeredTransition,
  SectionTransition,
} from "./PageTransition";

// Auth Components
export {
  AuthLayout,
  AuthFormLayout,
  MinimalAuthLayout,
  BrandedAuthLayout,
} from "./AuthLayout";
export { AuthFormField } from "./AuthFormField";
export { AuthButton } from "./AuthButton";

// Navigation & Access Control
export { PrivateRoute } from "./PrivateRoute";
export {
  PermissionGuard,
  usePermissionGuard,
  AdminOnly,
  SuperuserOnly,
  ProjectsWrite,
  RequirementsWrite,
  ReleasesWrite,
  TestingExecute,
} from "./PermissionGuard";

// Data Components
export { DataTable } from "./DataTable";
export type { DataTableProps, Column, Action } from "./DataTable";

// Form Components
export {
  FormField,
  FormTextField,
  FormSelectField,
  FormCheckboxField,
  FormRadioField,
  FormAutocompleteField,
} from "./FormField";

// Layout Components
export { Page } from "./Page";
export { StatsCard } from "./StatsCard";
export { SearchFilters } from "./SearchFilters";
export { ConfirmDialog } from "./ConfirmDialog";

// Media Components
export {
  ResponsiveImage,
  HeroImage,
  AvatarImage,
  CardImage,
} from "./ResponsiveImage";

// User Interface
export { UserAvatar } from "./UserAvatar";
export { RoleBadge } from "./RoleBadge";
export { ActivityFeed } from "./ActivityFeed";
export { QuickAccess } from "./QuickAccessCard";

// Feedback & Notifications
export { useToast } from "./Toast";
export { SnackbarProvider, useSnackbar } from "./Snackbar";
export { LoadingBackdrop } from "./LoadingBackdrop";
export { Modal, ConfirmModal } from "./Modal";

// Utility Components
export { ApiStatusIndicator } from "./ApiStatusIndicator";
export { FullPageScroll } from "./FullPageScroll";
export {
  AnimatedText,
  AnimatedHeading,
  AnimatedList,
} from "./AnimatedText";
export { TabPanel } from "./TabPanel";
export {
  ScrollIndicator,
  ScrollDots,
  ScrollProgress,
} from "./ScrollIndicator";
