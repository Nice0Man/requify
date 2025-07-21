import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface LayoutWidgetProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  className?: string;
  children?: React.ReactNode;
}
