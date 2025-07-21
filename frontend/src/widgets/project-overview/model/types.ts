import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/ui";
import type { Project, ProjectFilters } from "@/entities/project/model/types";

// Enhanced types for widget display
export interface ExtendedProject extends Project {
  progress?: number;
  requirements?: { total: number; completed: number; approved: number };
  testCases?: { total: number; passed: number; failed: number };
  team?: Array<{ id: string; name: string; avatar: string; role: string }>;
  budget?: { allocated: number; spent: number; currency: string };
  lastActivity?: string;
}

export interface ProjectOverviewWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;

  // Feature-specific props
  limit?: number;
  showFilters?: boolean;
  showActions?: boolean;
  masonry?: boolean;
  flexible?: boolean;
  maxHeight?: number;
  overflow?: string;

  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
} 