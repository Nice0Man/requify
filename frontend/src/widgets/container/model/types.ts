import type {
  DashboardMode,
  DashboardLayout,
  DashboardDensity,
} from "@/shared/types/dashboard";

/**
 * Dashboard Container Props
 * Optimized for modern styling system and performance
 */
export interface DashboardContainerProps {
  /** React children elements */
  children: React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Dashboard display mode */
  mode?: DashboardMode;

  /** Layout type for content organization */
  layout?: DashboardLayout;

  /** Content density level */
  density?: DashboardDensity;

  /** Whether dashboard is in fullscreen mode */
  isFullscreen?: boolean;

  /** Maximum width constraint (false for no constraint) */
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;

  /** Disable container gutters/padding */
  disableGutters?: boolean;

  /** Enable entrance animations */
  enableAnimations?: boolean;

  /** Performance optimization hint */
  highPerformanceMode?: boolean;
}

/**
 * Container Style Configuration
 * For internal styling system use
 */
export interface DashboardContainerStyleConfig {
  spacing: {
    xs: number;
    sm: number;
    md: number;
  };

  padding: {
    xs: number;
    sm: number;
    md: number;
  };

  background: string;
  overflow: "hidden" | "visible" | "auto";
  animations: boolean;
}
