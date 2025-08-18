import { lazy } from 'react';

// Dashboard виджеты
export const LazyDashboardStatsWidget = lazy(() => 
  import('./dashboard-stats/ui/DashboardStatsWidget').then(module => ({
    default: module.DashboardStatsWidget
  }))
);

export const LazyActivityFeedWidget = lazy(() => 
  import('./activity-feed/ui/ActivityFeedWidget').then(module => ({
    default: module.ActivityFeedWidget
  }))
);

export const LazyQuickActionsWidget = lazy(() => 
  import('./quick-actions/ui/QuickActionsWidget').then(module => ({
    default: module.QuickActionsWidget
  }))
);

export const LazyProjectOverviewWidget = lazy(() => 
  import('./project-overview/ui/ProjectOverviewWidget').then(module => ({
    default: module.ProjectOverviewWidget
  }))
);

export const LazySystemHealthWidget = lazy(() => 
  import('./system-health/ui/SystemHealthWidget').then(module => ({
    default: module.SystemHealthWidget
  }))
);

export const LazyRequirementListWidget = lazy(() => 
  import('./requirement-list/ui/RequirementListWidget').then(module => ({
    default: module.RequirementListWidget
  }))
);

export const LazyProjectStatsWidget = lazy(() => 
  import('./project-stats/ui/ProjectStatsWidget').then(module => ({
    default: module.ProjectStatsWidget
  }))
);

export const LazyKanbanWidget = lazy(() => 
  import('./kanban/ui/KanbanWidget').then(module => ({
    default: module.KanbanWidget
  }))
);

// Layout виджеты
export const LazyAppSidebarWidget = lazy(() => 
  import('./app-sidebar/ui/AppSidebarWidget').then(module => ({
    default: module.AppSidebarWidget
  }))
);

export const LazyAppHeaderWidget = lazy(() => 
  import('./app-header/ui/AppHeaderWidget').then(module => ({
    default: module.AppHeaderWidget
  }))
);

export const LazyAppNavigationWidget = lazy(() => 
  import('./app-navigation/ui/AppNavigationWidget').then(module => ({
    default: module.AppNavigationWidget
  }))
);

export const LazyDashboardHeaderWidget = lazy(() => 
  import('./dashboard-header/ui/DashboardHeader').then(module => ({
    default: module.DashboardHeader
  }))
);

export const LazyScrollNavigationWidget = lazy(() => 
  import('./scroll-navigation/ui/ScrollNavigationWidget').then(module => ({
    default: module.ScrollNavigationWidget
  }))
);

export const LazyContainerWidget = lazy(() => 
  import('./container/ui/DashboardContainer').then(module => ({
    default: module.DashboardContainer
  }))
);

// Экспорт всех lazy виджетов для удобства
export const LazyWidgets = {
  // Dashboard
  DashboardStats: LazyDashboardStatsWidget,
  ActivityFeed: LazyActivityFeedWidget,
  QuickActions: LazyQuickActionsWidget,
  ProjectOverview: LazyProjectOverviewWidget,
  SystemHealth: LazySystemHealthWidget,
  RequirementList: LazyRequirementListWidget,
  ProjectStats: LazyProjectStatsWidget,
  Kanban: LazyKanbanWidget,
  
  // Layout
  AppSidebar: LazyAppSidebarWidget,
  AppHeader: LazyAppHeaderWidget,
  AppNavigation: LazyAppNavigationWidget,
  DashboardHeader: LazyDashboardHeaderWidget,
  ScrollNavigation: LazyScrollNavigationWidget,
  Container: LazyContainerWidget,
} as const; 