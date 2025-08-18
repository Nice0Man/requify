export type KanbanType = "projects" | "requirements" | "releases" | "tests";

export type KanbanVariant = "compact" | "detailed" | "minimal";

export type KanbanItemStatus =
  // Project statuses
  | "planning"
  | "active"
  | "development"
  | "testing"
  | "completed"
  // Requirement statuses
  | "draft"
  | "review"
  | "approved"
  | "rejected"
  // Release statuses
  | "planned"
  | "in_progress"
  | "ready"
  | "published"
  | "cancelled"
  // Test statuses
  | "pending"
  | "passed"
  | "failed"
  | "blocked";

export type KanbanItemPriority = "low" | "medium" | "high" | "critical";

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  status: KanbanItemStatus;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
  order: number;
}

export interface KanbanItem {
  id: number;
  title: string;
  description?: string;
  status: KanbanItemStatus;
  priority?: KanbanItemPriority;
  assignee?: string;
  assignees?: string[];
  created_at: string;
  updated_at: string;
  labels?: string[];
  progress?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  project_id?: number;
  project_name?: string;
  author?: string;
  // Specific fields for different types
  version?: string; // for releases
  requirement_id?: number; // for tests
  requirement_title?: string; // for tests
  test_type?: string; // for tests
  execution_time?: number; // for tests
  expected_result?: string; // for tests
  actual_result?: string; // for tests
  type_name?: string; // for requirements
}

export interface KanbanCard extends KanbanItem {
  type: KanbanType;
  updatedAt?: string; // Alias for updated_at for consistency
}

export interface KanbanBoard {
  id: string;
  title: string;
  type: KanbanType;
  project_id?: number;
  columns: KanbanColumn[];
  items: KanbanCard[];
  created_at: string;
  updated_at: string;
}

export interface KanbanFilter {
  search?: string;
  status?: KanbanItemStatus[];
  priority?: KanbanItemPriority[];
  assignee?: string[];
  labels?: string[];
  project_id?: number;
  requirement_id?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface KanbanDragResult {
  itemId: number;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export interface KanbanConfiguration {
  type: KanbanType;
  columns: KanbanColumn[];
  allowDragDrop: boolean;
  showFilters: boolean;
  variant: KanbanVariant;
  projectFilter?: boolean;
}

// API Response types
export interface KanbanItemsResponse {
  items: KanbanItem[];
  total: number;
  page: number;
  limit: number;
}

export interface KanbanItemCreateRequest {
  title: string;
  description?: string;
  status: KanbanItemStatus;
  priority?: KanbanItemPriority;
  assignee?: string;
  labels?: string[];
  project_id?: number;
  requirement_id?: number;
  dueDate?: string;
  estimatedHours?: number;
}

export interface KanbanItemUpdateRequest {
  title?: string;
  description?: string;
  status?: KanbanItemStatus;
  priority?: KanbanItemPriority;
  assignee?: string;
  labels?: string[];
  progress?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
}

// Component Props types
export interface KanbanBoardProps {
  type: KanbanType;
  projectId?: number;
  requirementId?: number;
  allowDragDrop?: boolean;
  showFilters?: boolean;
  className?: string;
  onItemClick?: (itemId: number, itemType: KanbanType) => void;
  onItemMove?: (result: KanbanDragResult) => void;
  variant?: KanbanVariant;
  configuration?: Partial<KanbanConfiguration>;
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  items: KanbanCard[];
  onItemClick?: (itemId: number) => void;
  onItemEdit?: (item: KanbanCard) => void;
  onItemDelete?: (itemId: number) => void;
  onAddItem?: (columnId: string) => void;
  variant?: KanbanVariant;
  allowDragDrop?: boolean;
}

export interface KanbanCardProps {
  item: KanbanCard;
  index: number;
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: KanbanCard) => void;
  onDelete?: (itemId: number) => void;
  variant?: KanbanVariant;
  isDragging?: boolean;
}
