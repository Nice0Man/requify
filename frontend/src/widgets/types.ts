// Common widget types and interfaces
export interface BaseWidgetProps {
  className?: string;
  loading?: boolean;
  error?: string;
}

export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
  };
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  columns: number;
  spacing: number;
} 
