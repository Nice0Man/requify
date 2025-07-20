export interface ChartDataPoint {
  id: string | number;
  label: string;
  value: number;
  color?: string;
  trend?: TrendData;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  date: string | Date;
  value: number;
  category?: string;
  label?: string;
}

export interface TrendData {
  direction: "up" | "down" | "stable";
  value: number;
  percentage: number;
  label?: string;
}

export interface ChartMetric {
  id: string;
  title: string;
  value: number | string;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  color?: string;
  icon?: React.ReactNode;
  trend?: TrendData;
  description?: string;
  target?: number;
  unit?: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color?: string;
  label?: string;
}

export interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  avgProgress: number;
  statusDistribution: StatusDistribution[];
  timeline: TimeSeriesDataPoint[];
  trends: TrendData[];
}

export interface RequirementMetrics {
  totalRequirements: number;
  completedRequirements: number;
  pendingRequirements: number;
  approvedRequirements: number;
  rejectedRequirements: number;
  statusDistribution: StatusDistribution[];
  timeline: TimeSeriesDataPoint[];
  velocity: number;
  burndown: TimeSeriesDataPoint[];
}

export interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  productivity: number;
  velocity: number;
  workload: ChartDataPoint[];
  performance: TimeSeriesDataPoint[];
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  uptime: number;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  availability: number;
}

export interface ChartTheme {
  colors: {
    primary: string[];
    secondary: string[];
    success: string[];
    warning: string[];
    error: string[];
    neutral: string[];
  };
  fonts: {
    default: string;
    mono: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface ChartConfig {
  responsive?: boolean;
  animated?: boolean;
  theme?: ChartTheme;
  locale?: string;
  rtl?: boolean;
}

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'doughnut' 
  | 'area' 
  | 'radar' 
  | 'scatter' 
  | 'treemap' 
  | 'heatmap'
  | 'funnel'
  | 'gauge'
  | 'waterfall';

export interface BaseChartProps {
  data: ChartDataPoint[] | TimeSeriesDataPoint[];
  type?: ChartType;
  config?: ChartConfig;
  height?: number;
  width?: number;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onPointClick?: (point: ChartDataPoint | TimeSeriesDataPoint) => void;
  onLegendClick?: (legend: string) => void;
}

// Chart-specific props
export interface LineChartProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  showPoints?: boolean;
  showGrid?: boolean;
  smooth?: boolean;
  area?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  horizontal?: boolean;
  stacked?: boolean;
  grouped?: boolean;
}

export interface PieChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  donut?: boolean;
  onSliceClick?: (data: ChartDataPoint, index: number) => void;
}

export interface RadarChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  showDots?: boolean;
  showLines?: boolean;
  fillArea?: boolean;
}

export interface MetricCardProps {
  metric: ChartMetric;
  variant?: 'default' | 'compact' | 'detailed';
  showTrend?: boolean;
  showProgress?: boolean;
  onClick?: (metric: ChartMetric) => void;
}

export interface DashboardChart {
  id: string;
  title: string;
  type: ChartType;
  data: ChartDataPoint[] | TimeSeriesDataPoint[];
  config?: ChartConfig;
  metrics?: ChartMetric[];
  refreshInterval?: number;
  lastUpdated?: Date;
} 