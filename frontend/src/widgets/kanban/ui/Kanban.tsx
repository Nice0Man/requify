import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Stack,
  Paper,
  AvatarGroup,
  LinearProgress,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search,
  Add,
  Assignment,
  RocketLaunch,
  BugReport,
  Person,
  Schedule,
  Flag,
  MoreVert,
  Visibility,
  CheckCircle,
  RadioButtonUnchecked,
  ErrorOutline,
  AccessTime,
  Group,
  LocalOffer,
  DragIndicator,
} from "@mui/icons-material";

// React Beautiful DnD
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Using entities according to FSD
import { requirementsApi } from "@/entities/requirement";
import { projectsApi } from "@/entities/project";
import { testCasesApi } from "@/entities/test-case";
import type {
  Requirement,
  RequirementWithDetails,
  RequirementType,
} from "@/entities/requirement/model/types";
import type { Project } from "@/entities/project/model/types";
import type { TestCase } from "@/entities/test-case/model/types";

// Using shared utilities
import { formatDate } from "@/shared/utils";

// Interfaces
interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  status: string;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
}

interface KanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  assignees?: string[];
  created_at: string;
  updated_at: string;
  type: "requirement" | "project" | "task";
  labels?: string[];
  progress?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  project_name?: string;
  author?: string;
}

interface KanbanProps {
  mode?: "requirements" | "projects" | "tasks";
  projectId?: number;
  columns?: KanbanColumn[];
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number, itemType: string) => void;
  onItemMove?: (itemId: number, fromColumn: string, toColumn: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

// Default columns for different modes
const defaultColumns: Record<string, KanbanColumn[]> = {
  requirements: [
    {
      id: "draft",
      title: "Draft",
      color: "#64748b",
      status: "draft",
      description: "Requirements in draft state",
      icon: <RadioButtonUnchecked />,
    },
    {
      id: "review",
      title: "In Review",
      color: "#f59e0b",
      status: "review",
      description: "Under team review",
      icon: <Visibility />,
    },
    {
      id: "approved",
      title: "Approved",
      color: "#10b981",
      status: "approved",
      description: "Ready for implementation",
      icon: <CheckCircle />,
    },
    {
      id: "rejected",
      title: "Rejected",
      color: "#ef4444",
      status: "rejected",
      description: "Needs revision",
      icon: <ErrorOutline />,
    },
  ],
  projects: [
    {
      id: "planning",
      title: "Planning",
      color: "#6366f1",
      status: "planning",
      description: "Project planning phase",
      icon: <Assignment />,
    },
    {
      id: "active",
      title: "Active",
      color: "#10b981",
      status: "active",
      description: "Actively developed",
      icon: <RocketLaunch />,
    },
    {
      id: "completed",
      title: "Completed",
      color: "#64748b",
      status: "completed",
      description: "Successfully completed",
      icon: <CheckCircle />,
    },
    {
      id: "cancelled",
      title: "Cancelled",
      color: "#ef4444",
      status: "cancelled",
      description: "Cancelled projects",
      icon: <ErrorOutline />,
    },
  ],
  tasks: [
    {
      id: "pending",
      title: "Pending",
      color: "#64748b",
      status: "pending",
      description: "Waiting to start",
      icon: <AccessTime />,
    },
    {
      id: "in_progress",
      title: "In Progress",
      color: "#3b82f6",
      status: "in_progress",
      description: "Currently working on",
      icon: <Assignment />,
    },
    {
      id: "testing",
      title: "Testing",
      color: "#f59e0b",
      status: "testing",
      description: "Under testing",
      icon: <BugReport />,
    },
    {
      id: "completed",
      title: "Completed",
      color: "#10b981",
      status: "completed",
      description: "Successfully completed",
      icon: <CheckCircle />,
    },
  ],
};

// Priority colors
const getPriorityColor = (priority?: string): string => {
  switch (priority?.toLowerCase()) {
    case "high":
    case "critical":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#64748b";
  }
};

// Get avatar initials
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Kanban Card Component
interface KanbanCardProps {
  item: KanbanItem;
  index: number;
  onItemClick?: (itemId: number, itemType: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  index,
  onItemClick,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleClick = () => {
    onItemClick?.(item.id, item.type);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case "requirement":
        return <Assignment fontSize="small" />;
      case "project":
        return <RocketLaunch fontSize="small" />;
      case "task":
        return <BugReport fontSize="small" />;
      default:
        return <Assignment fontSize="small" />;
    }
  };

  return (
    <Draggable draggableId={`${item.type}-${item.id}`} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          sx={{
            mb: 2,
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: snapshot.isDragging
              ? alpha(theme.palette.primary.main, 0.1)
              : theme.palette.background.paper,
            transform: snapshot.isDragging ? "rotate(5deg)" : "none",
            boxShadow: snapshot.isDragging
              ? theme.shadows[8]
              : theme.shadows[1],
            "&:hover": {
              boxShadow: theme.shadows[4],
              transform: "translateY(-2px)",
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            {/* Header */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1} flex={1}>
                {getTypeIcon()}
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <DragIndicator
                  sx={{
                    color: theme.palette.text.disabled,
                    fontSize: 16,
                    cursor: "grab",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{ opacity: 0.7 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Description */}
            {variant !== "minimal" && item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.description}
              </Typography>
            )}

            {/* Progress */}
            {variant === "detailed" && item.progress !== undefined && (
              <Box mb={1.5}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              </Box>
            )}

            {/* Labels */}
            {variant !== "minimal" && item.labels && item.labels.length > 0 && (
              <Box display="flex" flexWrap="wrap" gap={0.5} mb={1.5}>
                {item.labels.slice(0, 3).map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  />
                ))}
                {item.labels.length > 3 && (
                  <Chip
                    label={`+${item.labels.length - 3}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                      color: theme.palette.text.secondary,
                    }}
                  />
                )}
              </Box>
            )}

            {/* Footer */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                {/* Priority */}
                {item.priority && (
                  <Chip
                    label={item.priority}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(getPriorityColor(item.priority), 0.1),
                      color: getPriorityColor(item.priority),
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* Due Date */}
                {variant === "detailed" && item.dueDate && (
                  <Tooltip title={`Due: ${formatDate(item.dueDate)}`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.dueDate)}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Box>

              {/* Assignees */}
              <Box display="flex" alignItems="center" gap={1}>
                {item.assignees && item.assignees.length > 0 ? (
                  <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 24, height: 24 } }}>
                    {item.assignees.map((assignee) => (
                      <Avatar
                        key={assignee}
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "0.7rem",
                          backgroundColor: theme.palette.primary.main,
                        }}
                      >
                        {getInitials(assignee)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                ) : item.assignee ? (
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.7rem",
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    {getInitials(item.assignee)}
                  </Avatar>
                ) : (
                  <Person sx={{ fontSize: 20, color: "text.disabled" }} />
                )}
              </Box>
            </Box>
          </CardContent>

          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Assignment fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <ErrorOutline fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      )}
    </Draggable>
  );
};

// Kanban Column Component
interface KanbanColumnProps {
  column: KanbanColumn;
  items: KanbanItem[];
  onItemClick?: (itemId: number, itemType: string) => void;
  variant?: "compact" | "detailed" | "minimal";
  onAddItem?: (columnId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  items,
  onItemClick,
  variant = "detailed",
  onAddItem,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: "calc(100vh - 300px)",
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: alpha(column.color, 0.1),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: column.color,
              }}
            />
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              {column.title}
            </Typography>
            <Badge
              badgeContent={items.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: column.color,
                  color: "white",
                  fontWeight: 600,
                },
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={() => onAddItem?.(column.id)}
            sx={{
              backgroundColor: alpha(column.color, 0.1),
              color: column.color,
              "&:hover": {
                backgroundColor: alpha(column.color, 0.2),
              },
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>
        {column.description && (
          <Typography variant="caption" color="text.secondary">
            {column.description}
          </Typography>
        )}
      </Box>

      {/* Column Content */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              p: 2,
              minHeight: 200,
              backgroundColor: snapshot.isDraggingOver
                ? alpha(column.color, 0.05)
                : "transparent",
              transition: "background-color 0.2s ease-in-out",
            }}
          >
            {items.map((item, index) => (
              <KanbanCard
                key={`${item.type}-${item.id}`}
                item={item}
                index={index}
                onItemClick={onItemClick}
                variant={variant}
              />
            ))}
            {provided.placeholder}
            
            {/* Empty State */}
            {items.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 150,
                  color: "text.disabled",
                  textAlign: "center",
                }}
              >
                <LocalOffer sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.disabled">
                  No items in {column.title.toLowerCase()}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Drag items here or click + to add
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

// Main Kanban Component
export const Kanban: React.FC<KanbanProps> = ({
  mode = "requirements",
  projectId,
  columns,
  showFilters = true,
  allowDragDrop = true,
  className,
  onItemClick,
  onItemMove,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeColumns, setActiveColumns] = useState<KanbanColumn[]>(
    columns || defaultColumns[mode] || []
  );

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let data: KanbanItem[] = [];

        switch (mode) {
          case "requirements":
            const requirements = await requirementsApi.getRequirements({
              project_id: projectId,
              limit: 100,
            });
            // Check if requirements and items exist
            if (requirements && requirements.items && Array.isArray(requirements.items)) {
              data = requirements.items.map((req: any) => ({
                id: req.id,
                title: req.title || 'Untitled Requirement',
                description: req.description || '',
                status: typeof req.status === 'string' ? req.status : req.status?.value || 'draft',
                priority: req.priority || 'medium',
                assignee: req.assignee || req.assigned_to || '',
                created_at: req.created_at || new Date().toISOString(),
                updated_at: req.updated_at || new Date().toISOString(),
                type: "requirement" as const,
                labels: req.labels || req.tags || [],
                progress: req.progress || 0,
                project_name: req.project_name || '',
                author: req.author || req.created_by || '',
              }));
            }
            break;

          case "projects":
            const projects = await projectsApi.getProjects({
              limit: 100,
            });
            // Check if projects and items exist
            if (projects && projects.items && Array.isArray(projects.items)) {
              data = projects.items.map((proj: any) => ({
                id: proj.id,
                title: proj.name || 'Untitled Project',
                description: proj.description || '',
                status: proj.status || 'planning',
                priority: proj.priority || 'medium',
                assignee: proj.owner || proj.created_by || '',
                created_at: proj.created_at || new Date().toISOString(),
                updated_at: proj.updated_at || new Date().toISOString(),
                type: "project" as const,
                labels: proj.tags || [],
                progress: proj.progress || 0,
                author: proj.owner || proj.created_by || '',
              }));
            }
            break;

          case "tasks":
            const testCases = await testCasesApi.getTestCases({
              ...(projectId && { test_plan_id: projectId }),
              limit: 100,
            });
            // Check if testCases and items exist
            if (testCases && testCases.items && Array.isArray(testCases.items)) {
              data = testCases.items.map((test: any) => ({
                id: test.id,
                title: test.title || 'Untitled Test Case',
                description: test.description || '',
                status: test.status || 'pending',
                priority: test.priority || 'medium',
                assignee: test.assignee || test.assigned_to || '',
                created_at: test.created_at || new Date().toISOString(),
                updated_at: test.updated_at || new Date().toISOString(),
                type: "task" as const,
                labels: test.labels || test.tags || [],
                author: test.author || test.created_by || '',
              }));
            }
            break;
        }

        setItems(data);
      } catch (error) {
        console.error("Error loading kanban data:", error);
        // Set empty array on error to prevent further errors
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mode, projectId]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.labels?.some((label) =>
          label.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [items, searchTerm]);

  // Get items for a specific column
  const getColumnItems = (columnId: string) => {
    return filteredItems.filter((item) => item.status === columnId);
  };

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!allowDragDrop) return;

    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const itemId = parseInt(draggableId.split("-")[1]);
    const fromColumn = source.droppableId;
    const toColumn = destination.droppableId;

    // Update local state immediately for better UX
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: toColumn } : item
      )
    );

    // Call the callback for API update
    onItemMove?.(itemId, fromColumn, toColumn);
  };

  // Handle add item
  const handleAddItem = (columnId: string) => {
    // This would typically open a create modal or navigate to create page
    console.log(`Add item to column: ${columnId}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" gap={1.5} overflow="auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} sx={{ minWidth: 280 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <Skeleton
                  key={cardIndex}
                  variant="rectangular"
                  height={120}
                  sx={{ mb: 2 }}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ p: 3 }}>
      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflow: "auto",
            pb: 2,
          }}
        >
          {activeColumns.map((column) => (
            <Box key={column.id} sx={{ minWidth: 280, maxWidth: 320 }}>
              <KanbanColumn
                column={column}
                items={getColumnItems(column.id)}
                onItemClick={onItemClick}
                variant={variant}
                onAddItem={handleAddItem}
              />
            </Box>
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
};
