import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface DashboardContainerProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | Error;
} 