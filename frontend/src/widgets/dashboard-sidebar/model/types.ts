export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";
export type DashboardLayout = "grid" | "list" | "masonry";
export type DashboardDensity = "comfortable" | "compact" | "dense";

export interface DashboardSidebarProps {
  className?: string;
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  collapsed: boolean;
  isFullscreen?: boolean;
  onModeChange: (mode: DashboardMode) => void;
  onLayoutChange: (layout: DashboardLayout) => void;
  onDensityChange: (density: DashboardDensity) => void;
  onToggleCollapse: () => void;
  onFullscreenToggle?: () => void;
} 