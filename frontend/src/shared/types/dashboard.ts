/**
 * Dashboard Types
 * Типы для дашборда и его компонентов
 */

export type DashboardMode = "overview" | "detailed" | "compact" | "minimal" | "fullscreen";
export type DashboardLayoutType = "grid" | "list" | "masonry" | "default";
export type DashboardDensity = "comfortable" | "compact" | "spacious" | "dense";

export type DashboardLayout = DashboardLayoutType;

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
}

export interface BaseWidgetProps {
  mode?: DashboardMode;
  layout?: DashboardLayoutType;
  density?: DashboardDensity;
}

export interface DataWidgetProps extends BaseWidgetProps {
  data?: any[];
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}
