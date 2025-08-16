// Dashboard page exports
export { default } from './ui';
export { DashboardPage } from './ui';

// Dashboard types (re-export from entities)
export type {
  DashboardWidget,
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
} from '@/entities/dashboard';

// Dashboard context
export {
  DashboardProvider,
  useDashboard,
  useDashboardWidgets,
} from './context/DashboardContext';

// Dashboard styles
export {
  useWidgetStyles,
  createWidgetStyles,
  createWidgetContainerStyles,
  WIDGET_DESIGN_TOKENS,
} from './styles/DashboardWidgetStyles';

// Dashboard config
export {
  createFullDashboardConfig,
} from './config/widgetDefinitions'; 
