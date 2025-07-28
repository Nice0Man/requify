// Widgets Index - FSD compliant exports

// Widget types (local definitions)
export type {
  WidgetConfig,
  WidgetType,
  WidgetSize,
  WidgetState,
  WidgetContext,
  WidgetComponentProps,
  WidgetFactory,
  WidgetManager,
  BaseWidgetProps,
  AdaptiveWidgetProps,
  DataWidgetProps,
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
} from "./types";

// Core widgets
export { QuickActionsWidget } from "./quick-actions";
export { SystemHealthWidget } from "./system-health";
export { ProjectOverviewWidget } from "./project-overview";
export { ProjectStatsWidget } from "./project-stats";
export { ActivityFeedWidget } from "./activity-feed";
export { RequirementListWidget } from "./requirement-list";
export { KanbanWidget } from "./kanban";
export { DashboardStatsWidget } from "./dashboard-stats";
export { DemoDashboardWidget } from "./demo-dashboard";

// Layout widgets
export { AppHeaderWidget } from "./app-header";
export { AppSidebarWidget } from "./app-sidebar";
export { AppNavigationWidget } from "./app-navigation";
export { DashboardContainer } from "./container";
export { MainLayout } from "./layout";

// Lazy widgets для code splitting
export * from './lazy';

// LazyWidget компонент
export { LazyWidget } from '@/shared/ui/LazyWidget/LazyWidget';

// Auth widgets
export * from "./auth"; 