import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";

export interface RequirementListWidgetProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  className?: string;
  limit?: number;
  showFilters?: boolean;
  loading?: boolean;
  error?: string | Error;
} 