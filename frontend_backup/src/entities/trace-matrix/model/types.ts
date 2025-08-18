/**
 * Trace Matrix Entity Types - Типы сущности матрицы трассируемости
 * Соответствуют backend API schemas (backend/app/schemas/trace_matrix.py)
 */

// =============================================================================
// Basic Trace Matrix Types
// =============================================================================

export interface TraceNode {
  requirement_id: number;
  requirement_title: string;
  requirement_type: string;
  level: number;
  children: TraceNode[];
  parents: TraceNode[];
  
  // Дополнительные поля для UI
  requirement_code?: string;
  requirement_status?: string;
  requirement_priority?: string;
  project_id?: number;
  project_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TraceLink {
  source_id: number;
  target_id: number;
  relationship_type: string;
  strength: number; // 0-1
  
  // Дополнительные поля для UI
  source_title?: string;
  target_title?: string;
  created_at?: string;
  created_by?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface TraceMatrix {
  requirement_id: number;
  requirement_title: string;
  depth: number;
  matrix: TraceNode[][];
  links: TraceLink[];
  statistics: TraceMatrixStatistics;
  generated_at: string;
  
  // Дополнительные поля
  project_id?: number;
  config?: TraceMatrixConfig;
  errors?: string[];
  warnings?: string[];
}

export interface TraceMatrixConfig {
  include_forward: boolean;
  include_backward: boolean;
  relationship_types?: string[];
  exclude_types?: string[];
  max_depth: number;
  include_orphans: boolean;
  
  // Дополнительные настройки для UI
  group_by_type?: boolean;
  show_circular_deps?: boolean;
  highlight_critical_path?: boolean;
  filter_by_status?: string[];
  filter_by_priority?: string[];
  filter_by_project?: number[];
}

export interface TraceMatrixStatistics {
  total_requirements: number;
  total_links: number;
  max_depth_reached: number;
  coverage_percentage: number;
  orphan_requirements: number;
  circular_dependencies: number;
  
  // Дополнительная статистика
  requirements_by_type: Record<string, number>;
  requirements_by_level: Record<number, number>;
  links_by_type: Record<string, number>;
  average_connections_per_requirement: number;
  most_connected_requirement?: {
    id: number;
    title: string;
    connections: number;
  };
  least_connected_requirements?: {
    id: number;
    title: string;
    connections: number;
  }[];
}

export interface TraceMatrixExport {
  format: string;
  file_path: string;
  file_size: number;
  download_url: string;
  expires_at: string;
  
  // Дополнительные поля
  generated_by?: {
    id: number;
    username: string;
    full_name?: string;
  };
  config?: TraceMatrixConfig;
  project_name?: string;
}

// =============================================================================
// Visualization Types
// =============================================================================

export interface TraceMatrixVisualization {
  type: 'tree' | 'graph' | 'table' | 'sankey';
  nodes: VisualNode[];
  edges: VisualEdge[];
  layout: 'hierarchical' | 'force' | 'circular' | 'grid';
  config: VisualizationConfig;
}

export interface VisualNode {
  id: string;
  label: string;
  type: string;
  level: number;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  shape?: 'circle' | 'square' | 'diamond' | 'triangle';
  
  // Metadata
  requirement_id: number;
  requirement_data: {
    title: string;
    type: string;
    status: string;
    priority: string;
    project: string;
  };
  connections: {
    incoming: number;
    outgoing: number;
    total: number;
  };
}

export interface VisualEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  strength: number;
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  
  // Metadata
  relationship_type: string;
  created_at?: string;
}

export interface VisualizationConfig {
  node_size_scale: [number, number];
  edge_width_scale: [number, number];
  color_scheme: 'default' | 'status' | 'type' | 'priority' | 'project';
  show_labels: boolean;
  show_node_details: boolean;
  show_edge_details: boolean;
  enable_zoom: boolean;
  enable_pan: boolean;
  enable_drag: boolean;
  animation_duration: number;
}

// =============================================================================
// Analysis Types
// =============================================================================

export interface TraceAnalysis {
  coverage_analysis: CoverageAnalysis;
  impact_analysis: ImpactAnalysis;
  dependency_analysis: DependencyAnalysis;
  completeness_analysis: CompletenessAnalysis;
  quality_metrics: QualityMetrics;
}

export interface CoverageAnalysis {
  total_coverage: number;
  forward_coverage: number;
  backward_coverage: number;
  coverage_by_type: Record<string, number>;
  uncovered_requirements: {
    id: number;
    title: string;
    type: string;
    reason: string;
  }[];
  coverage_gaps: {
    from_type: string;
    to_type: string;
    gap_count: number;
  }[];
}

export interface ImpactAnalysis {
  high_impact_requirements: {
    id: number;
    title: string;
    impact_score: number;
    affected_count: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
  }[];
  change_impact_map: Record<number, number[]>;
  ripple_effects: {
    requirement_id: number;
    affected_levels: number;
    total_affected: number;
  }[];
}

export interface DependencyAnalysis {
  circular_dependencies: {
    cycle: number[];
    severity: 'warning' | 'error';
    description: string;
  }[];
  dependency_chains: {
    start_id: number;
    end_id: number;
    chain_length: number;
    path: number[];
  }[];
  critical_dependencies: {
    requirement_id: number;
    dependency_count: number;
    risk_score: number;
  }[];
}

export interface CompletenessAnalysis {
  missing_links: {
    from_requirement: number;
    to_requirement: number;
    suggested_type: string;
    confidence: number;
  }[];
  orphaned_requirements: {
    id: number;
    title: string;
    type: string;
    suggestions: string[];
  }[];
  over_connected_requirements: {
    id: number;
    title: string;
    connection_count: number;
    threshold: number;
  }[];
}

export interface QualityMetrics {
  overall_score: number;
  completeness_score: number;
  consistency_score: number;
  traceability_score: number;
  
  issues: {
    type: 'warning' | 'error' | 'info';
    message: string;
    requirement_ids: number[];
    severity: number;
  }[];
  
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    description: string;
    affected_requirements: number[];
  }[];
}

// =============================================================================
// API Response Types
// =============================================================================

export interface TraceMatrixResponse {
  trace_matrix: TraceMatrix;
}

export interface TraceMatrixListResponse {
  matrices: TraceMatrix[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TraceAnalysisResponse {
  analysis: TraceAnalysis;
  generated_at: string;
  cache_expires_at: string;
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface TraceMatrixQueryParams {
  project_id?: number;
  requirement_id?: number;
  depth?: number;
  include_forward?: boolean;
  include_backward?: boolean;
  relationship_types?: string[];
  exclude_types?: string[];
  include_orphans?: boolean;
  format?: 'json' | 'graph' | 'table';
  cache?: boolean;
  force_refresh?: boolean;
}

export interface TraceAnalysisQueryParams {
  project_id: number;
  analysis_types?: ('coverage' | 'impact' | 'dependency' | 'completeness' | 'quality')[];
  requirement_ids?: number[];
  depth?: number;
  include_suggestions?: boolean;
}

// =============================================================================
// Generation and Export Types
// =============================================================================

export interface TraceMatrixGenerationRequest {
  project_id?: number;
  requirement_id: number;
  config: TraceMatrixConfig;
  visualization?: {
    type: 'tree' | 'graph' | 'table' | 'sankey';
    layout: 'hierarchical' | 'force' | 'circular' | 'grid';
    config: Partial<VisualizationConfig>;
  };
}

export interface TraceMatrixExportRequest {
  matrix_id?: string;
  project_id?: number;
  requirement_id?: number;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'svg' | 'png';
  config?: {
    include_statistics?: boolean;
    include_visualization?: boolean;
    template?: string;
    page_format?: 'A4' | 'A3' | 'Letter';
    orientation?: 'portrait' | 'landscape';
  };
}

// =============================================================================
// Real-time Updates
// =============================================================================

export interface TraceMatrixUpdate {
  type: 'requirement_added' | 'requirement_removed' | 'requirement_updated' | 'link_added' | 'link_removed' | 'link_updated';
  project_id: number;
  requirement_id?: number;
  link?: {
    source_id: number;
    target_id: number;
    relationship_type: string;
  };
  affected_matrices: string[];
  timestamp: string;
}