import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface DashboardHeaderProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  className?: string;
  title?: string;
  showControls?: boolean;
} 