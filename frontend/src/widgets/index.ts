// Widgets - reusable components that combine features and entities
// According to FSD principles, widgets use features and entities

export { ActivityFeed } from "./activity-feed";
export { DashboardStats } from "./dashboard-stats";
export { Navigation } from "./navigation";
export { ProjectOverview } from "./project-overview";
export { RequirementList } from "./requirement-list";
export { SystemHealth } from "./system-health";
export { QuickActions } from "./quick-actions";
export { Kanban } from "./kanban";

// Landing widgets
export * from './landing';

// Export widget types
export type {
  ActivityFeedProps,
  DashboardStatsProps,
  NavigationProps,
  ProjectOverviewProps,
  RequirementListProps,
  SystemHealthProps,
  QuickActionsProps,
  KanbanProps,
} from "./types";
