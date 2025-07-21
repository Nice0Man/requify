import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface KanbanWidgetProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}
