import React from 'react';
import {
  Assignment,
  Visibility,
  CheckCircle,
  ErrorOutline,
  RadioButtonUnchecked,
  RocketLaunch,
  AccessTime,
  Build,
  Code,
  Publish,
  PlayArrow,
  Stop,
  Schedule,
} from '@mui/icons-material';
import type { KanbanColumn, KanbanType, KanbanConfiguration } from './types';

// Project Kanban Configuration
export const PROJECT_COLUMNS: KanbanColumn[] = [
  {
    id: "planning",
    title: "Planning",
    color: "#6366f1",
    status: "planning",
    description: "Project planning phase",
    icon: React.createElement(Assignment),
    order: 0,
  },
  {
    id: "active",
    title: "Active",
    color: "#10b981",
    status: "active",
    description: "Actively developed",
    icon: React.createElement(RocketLaunch),
    order: 1,
  },
  {
    id: "development",
    title: "Development",
    color: "#f59e0b",
    status: "development",
    description: "In development",
    icon: React.createElement(Build),
    order: 2,
  },
  {
    id: "testing",
    title: "Testing",
    color: "#8b5cf6",
    status: "testing",
    description: "In testing phase",
    icon: React.createElement(Code),
    order: 3,
  },
  {
    id: "completed",
    title: "Completed",
    color: "#64748b",
    status: "completed",
    description: "Completed projects",
    icon: React.createElement(CheckCircle),
    order: 4,
  },
];

// Requirements Kanban Configuration
export const REQUIREMENTS_COLUMNS: KanbanColumn[] = [
  {
    id: "draft",
    title: "Draft",
    color: "#64748b",
    status: "draft",
    description: "Requirements in draft state",
    icon: React.createElement(RadioButtonUnchecked),
    order: 0,
  },
  {
    id: "review",
    title: "In Review",
    color: "#f59e0b",
    status: "review",
    description: "Under team review",
    icon: React.createElement(Visibility),
    order: 1,
  },
  {
    id: "approved",
    title: "Approved",
    color: "#10b981",
    status: "approved",
    description: "Ready for implementation",
    icon: React.createElement(CheckCircle),
    order: 2,
  },
  {
    id: "rejected",
    title: "Rejected",
    color: "#ef4444",
    status: "rejected",
    description: "Needs revision",
    icon: React.createElement(ErrorOutline),
    order: 3,
  },
];

// Releases Kanban Configuration
export const RELEASES_COLUMNS: KanbanColumn[] = [
  {
    id: "draft",
    title: "Draft",
    color: "#64748b",
    status: "draft",
    description: "Planning stage",
    icon: React.createElement(Assignment),
    order: 0,
  },
  {
    id: "planned",
    title: "Planned",
    color: "#3b82f6",
    status: "planned",
    description: "Scheduled for development",
    icon: React.createElement(Schedule),
    order: 1,
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "#f59e0b",
    status: "in_progress",
    description: "Currently being developed",
    icon: React.createElement(Build),
    order: 2,
  },
  {
    id: "testing",
    title: "Testing",
    color: "#8b5cf6",
    status: "testing",
    description: "Quality assurance",
    icon: React.createElement(Code),
    order: 3,
  },
  {
    id: "ready",
    title: "Ready",
    color: "#10b981",
    status: "ready",
    description: "Ready for release",
    icon: React.createElement(CheckCircle),
    order: 4,
  },
  {
    id: "published",
    title: "Published",
    color: "#059669",
    status: "published",
    description: "Released to production",
    icon: React.createElement(Publish),
    order: 5,
  },
  {
    id: "cancelled",
    title: "Cancelled",
    color: "#ef4444",
    status: "cancelled",
    description: "Cancelled releases",
    icon: React.createElement(ErrorOutline),
    order: 6,
  },
];

// Tests Kanban Configuration
export const TESTS_COLUMNS: KanbanColumn[] = [
  {
    id: "pending",
    title: "Pending",
    color: "#64748b",
    status: "pending",
    description: "Waiting to start",
    icon: React.createElement(AccessTime),
    order: 0,
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "#3b82f6",
    status: "in_progress",
    description: "Currently executing",
    icon: React.createElement(PlayArrow),
    order: 1,
  },
  {
    id: "passed",
    title: "Passed",
    color: "#10b981",
    status: "passed",
    description: "Test passed successfully",
    icon: React.createElement(CheckCircle),
    order: 2,
  },
  {
    id: "failed",
    title: "Failed",
    color: "#ef4444",
    status: "failed",
    description: "Test failed",
    icon: React.createElement(ErrorOutline),
    order: 3,
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "#f59e0b",
    status: "blocked",
    description: "Cannot execute",
    icon: React.createElement(Stop),
    order: 4,
  },
];

// Get columns by kanban type
export const getKanbanColumns = (type: KanbanType): KanbanColumn[] => {
  switch (type) {
    case "projects":
      return PROJECT_COLUMNS;
    case "requirements":
      return REQUIREMENTS_COLUMNS;
    case "releases":
      return RELEASES_COLUMNS;
    case "tests":
      return TESTS_COLUMNS;
    default:
      return REQUIREMENTS_COLUMNS;
  }
};

// Default configurations for each kanban type
export const KANBAN_CONFIGURATIONS: Record<KanbanType, KanbanConfiguration> = {
  projects: {
    type: "projects",
    columns: PROJECT_COLUMNS,
    allowDragDrop: true,
    showFilters: true,
    variant: "detailed",
    projectFilter: false,
  },
  requirements: {
    type: "requirements",
    columns: REQUIREMENTS_COLUMNS,
    allowDragDrop: true,
    showFilters: true,
    variant: "detailed",
    projectFilter: true,
  },
  releases: {
    type: "releases",
    columns: RELEASES_COLUMNS,
    allowDragDrop: true,
    showFilters: true,
    variant: "detailed",
    projectFilter: true,
  },
  tests: {
    type: "tests",
    columns: TESTS_COLUMNS,
    allowDragDrop: true,
    showFilters: true,
    variant: "detailed",
    projectFilter: true,
  },
};

// Get configuration by type
export const getKanbanConfiguration = (type: KanbanType): KanbanConfiguration => {
  return KANBAN_CONFIGURATIONS[type];
};

// Priority color mapping
export const PRIORITY_COLORS = {
  low: "#10b981",
  medium: "#f59e0b", 
  high: "#ef4444",
  critical: "#dc2626",
} as const;

// Status color mapping helper
export const getStatusColor = (status: string, type: KanbanType): string => {
  const columns = getKanbanColumns(type);
  const column = columns.find(col => col.status === status);
  return column?.color || "#64748b";
}; 