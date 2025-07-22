import type {
  KanbanCard,
  // KanbanItem, // TODO: implement when needed
  KanbanFilter,
  KanbanType,
  KanbanItemPriority,
  KanbanDragResult,
  KanbanColumn as KanbanColumnType,
} from "./types";
import { PRIORITY_COLORS } from "./configurations";

// Priority order for sorting
const PRIORITY_ORDER: Record<KanbanItemPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// Filter kanban items based on filter criteria
export const filterKanbanItems = (
  items: KanbanCard[],
  filter: KanbanFilter
): KanbanCard[] => {
  return items.filter((item) => {
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.labels?.some((label) =>
          label.toLowerCase().includes(searchLower)
        ) ||
        item.assignee?.toLowerCase().includes(searchLower) ||
        item.project_name?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Priority filter
    if (filter.priority && filter.priority.length > 0) {
      if (!item.priority || !filter.priority.includes(item.priority)) {
        return false;
      }
    }

    // Assignee filter
    if (filter.assignee && filter.assignee.length > 0) {
      if (!item.assignee || !filter.assignee.includes(item.assignee)) {
        return false;
      }
    }

    // Labels filter
    if (filter.labels && filter.labels.length > 0) {
      const hasMatchingLabel = filter.labels.some((filterLabel) =>
        item.labels?.includes(filterLabel)
      );
      if (!hasMatchingLabel) return false;
    }

    // Project filter
    if (filter.project_id && item.project_id !== filter.project_id) {
      return false;
    }

    // Requirement filter
    if (
      filter.requirement_id &&
      item.requirement_id !== filter.requirement_id
    ) {
      return false;
    }

    // Date range filter
    if (filter.dateRange) {
      const itemDate = new Date(item.updated_at);
      if (
        itemDate < filter.dateRange.start ||
        itemDate > filter.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  });
};

// Sort kanban items by priority and date
export const sortKanbanItems = (
  items: KanbanCard[],
  // p0: string, // TODO: implement position-based sorting
  // p1: string, // TODO: implement position-based sorting
  sortBy: "priority" | "date" | "title" = "priority"
): KanbanCard[] => {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityA = PRIORITY_ORDER[a.priority || "low"];
        const priorityB = PRIORITY_ORDER[b.priority || "low"];
        return priorityB - priorityA; // High priority first

      case "date":
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

      case "title":
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });
};

// Get items for a specific column
export const getColumnItems = (
  items: KanbanCard[],
  columnId: string
): KanbanCard[] => {
  return items.filter((item) => item.status === columnId);
};

// Get priority color
export const getPriorityColor = (priority?: KanbanItemPriority): string => {
  return PRIORITY_COLORS[priority || "medium"];
};

// Format duration in human readable format
export const formatDuration = (hours?: number): string => {
  if (!hours) return "Not set";

  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  } else if (hours < 24) {
    return `${Math.round(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days}d ${Math.round(remainingHours)}h`
      : `${days}d`;
  }
};

// Calculate progress percentage
export const calculateProgress = (item: KanbanCard): number => {
  if (item.progress !== undefined) {
    return Math.max(0, Math.min(100, item.progress));
  }

  // Auto-calculate progress based on status
  switch (item.status) {
    case "draft":
    case "pending":
    case "planning":
      return 0;
    case "review":
    case "planned":
      return 25;
    case "active":
    case "development":
    case "in_progress":
      return 50;
    case "testing":
      return 75;
    case "approved":
    case "passed":
    case "ready":
    case "completed":
    case "published":
      return 100;
    case "rejected":
    case "failed":
    case "blocked":
    case "cancelled":
      return 0;
    default:
      return 0;
  }
};

// Check if item is overdue
export const isItemOverdue = (item: KanbanCard): boolean => {
  if (!item.dueDate) return false;

  const now = new Date();
  const due = new Date(item.dueDate);
  return (
    due < now && item.status !== "completed" && item.status !== "published"
  );
};

// Get relative time string
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    }
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
};

// Transform API data to KanbanCard
export const transformToKanbanCard = (
  item: any,
  type: KanbanType
): KanbanCard => {
  return {
    ...item,
    type,
    id: Number(item.id),
    title: item.title || "Untitled",
    description: item.description || "",
    status: item.status || (type === "projects" ? "planning" : "draft"),
    priority: item.priority || "medium",
    assignee: item.assignee || item.assigned_to || "",
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    labels: item.labels || item.tags || [],
    progress: item.progress || 0,
    project_id: item.project_id,
    project_name: item.project_name || "",
    author: item.author || item.created_by || "",
    // Type-specific fields
    version: item.version,
    requirement_id: item.requirement_id,
    requirement_title: item.requirement_title || "",
    test_type: item.test_type || item.type,
    execution_time: item.execution_time,
    expected_result: item.expected_result || "",
    actual_result: item.actual_result || "",
    type_name: item.type_name || item.requirement_type || "",
  };
};

// Validate drag and drop operation
export const validateDragOperation = (
  result: KanbanDragResult,
  items: KanbanCard[]
): boolean => {
  const item = items.find((i) => i.id === result.itemId);
  if (!item) return false;

  // Add business logic validation here
  // For example, prevent moving completed items back to draft
  if (
    item.status === "completed" &&
    ["draft", "planning", "pending"].includes(result.destinationColumnId)
  ) {
    return false;
  }

  return true;
};

// Get unique values for filter options
export const getFilterOptions = (items: KanbanCard[]) => {
  const assignees = [
    ...new Set(items.map((item) => item.assignee).filter(Boolean)),
  ].sort();
  const labels = [
    ...new Set(items.flatMap((item) => item.labels || [])),
  ].sort();
  const projects = [
    ...new Set(items.map((item) => item.project_name).filter(Boolean)),
  ].sort();

  return {
    assignees,
    labels,
    projects,
  };
};

// Generate item summary for tooltips
export const getItemSummary = (item: KanbanCard): string => {
  const parts = [item.title];

  if (item.assignee) {
    parts.push(`Assigned to: ${item.assignee}`);
  }

  if (item.priority && item.priority !== "medium") {
    parts.push(`Priority: ${item.priority}`);
  }

  if (item.dueDate) {
    parts.push(`Due: ${new Date(item.dueDate).toLocaleDateString()}`);
  }

  return parts.join("\n");
};

export const groupItemsByColumn = (
  items: KanbanCard[],
  columns: KanbanColumnType[]
): Record<string, KanbanCard[]> => {
  const groupedItems: Record<string, KanbanCard[]> = {};
  columns.forEach((column) => {
    groupedItems[column.id] = [];
  });
  items.forEach((item) => {
    const columnId = item.status || "default";
    if (groupedItems[columnId]) {
      groupedItems[columnId].push(item);
    }
  });
  return groupedItems;
};
