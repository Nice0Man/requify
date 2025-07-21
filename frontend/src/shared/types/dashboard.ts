// Dashboard Widget Wrapper Types
export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";
export type DashboardLayout = "grid" | "list" | "masonry";
export type DashboardDensity = "comfortable" | "compact" | "dense";

// Widget sizing options
export type WidgetSize = "small" | "medium" | "large" | "xlarge" | "auto";

// Widget priority for layout algorithms
export type WidgetPriority = "low" | "normal" | "high" | "critical";

// Widget aspect ratio for grid layouts
export type WidgetAspectRatio = "square" | "wide" | "tall" | "auto";

// Widget alignment options
export type WidgetAlignment = "start" | "center" | "end" | "stretch";

// Responsive breakpoints configuration
export interface ResponsiveConfig {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
}

// Widget spacing configuration
export interface SpacingConfig {
  padding?: number | string;
  margin?: number | string;
  gap?: number | string;
}

// Widget settings for different modes
export interface ModeSettings {
  size?: WidgetSize;
  visible?: boolean;
  priority?: WidgetPriority;
  aspectRatio?: WidgetAspectRatio;
  minHeight?: number | string;
  maxHeight?: number | string;
  spacing?: SpacingConfig;
}

// Complete widget configuration
export interface WidgetConfig {
  id: string;
  title?: string;
  description?: string;
  icon?: React.ComponentType;
  
  // Default settings
  defaultSize?: WidgetSize;
  defaultPriority?: WidgetPriority;
  defaultAspectRatio?: WidgetAspectRatio;
  
  // Mode-specific settings
  modes?: {
    minimal?: ModeSettings;
    compact?: ModeSettings;
    detailed?: ModeSettings;
    fullscreen?: ModeSettings;
  };
  
  // Layout-specific settings
  layouts?: {
    grid?: ModeSettings;
    list?: ModeSettings;
    masonry?: ModeSettings;
  };
  
  // Responsive settings
  responsive?: ResponsiveConfig;
  
  // Styling options
  background?: string;
  border?: boolean;
  shadow?: boolean;
  borderRadius?: number | string;
  
  // Behavior settings
  collapsible?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  
  // Performance settings
  lazy?: boolean;
  virtualizeContent?: boolean;
}

// Props for DashboardWidgetWrapper
export interface DashboardWidgetWrapperProps {
  children: React.ReactNode;
  config: WidgetConfig;
  
  // Current dashboard state
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  
  // Optional overrides
  className?: string;
  style?: React.CSSProperties;
  size?: WidgetSize;
  priority?: WidgetPriority;
  
  // Event handlers
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
  onError?: (error: Error) => void;
  
  // Performance options
  loading?: boolean;
  error?: string | Error;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Utility type for widget dimensions
export interface WidgetDimensions {
  width: number | string;
  height: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  aspectRatio?: number | string;
}

// Theme-aware styling
export interface WidgetThemeConfig {
  light?: Partial<WidgetConfig>;
  dark?: Partial<WidgetConfig>;
} 