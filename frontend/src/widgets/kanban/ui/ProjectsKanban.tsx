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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search,
  Add,
  RocketLaunch,
  Person,
  Schedule,
  Flag,
  MoreVert,
  Visibility,
  CheckCircle,
  Assignment,
  ErrorOutline,
  AccessTime,
  Edit,
  Delete,
  LocalOffer,
  DragIndicator,
  Group,
} from "@mui/icons-material";

// React Beautiful DnD
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Using entities according to FSD
import { projectsApi } from "@/entities/project";
import type {
  Project,
  ProjectCreate,
  ProjectStatus,
  ProjectUpdate,
} from "@/entities/project/model/types";

// Using shared utilities
import { formatDate } from "@/shared/utils";

// Interfaces
interface ProjectKanbanColumn {
  id: string;
  title: string;
  color: string;
  status: string;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
}

interface ProjectKanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  labels?: string[];
  progress?: number;
  members_count?: number;
  requirements_count?: number;
  start_date?: string;
  end_date?: string;
}

interface ProjectsKanbanProps {
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

// Default columns for projects
const projectColumns: ProjectKanbanColumn[] = [
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
    id: "on_hold",
    title: "On Hold",
    color: "#f59e0b",
    status: "on_hold",
    description: "Temporarily paused",
    icon: <AccessTime />,
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
];

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

// Project Card Component
interface ProjectCardProps {
  item: ProjectKanbanItem;
  index: number;
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: ProjectKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  item,
  index,
  onItemClick,
  onEdit,
  onDelete,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleClick = () => {
    onItemClick?.(item.id);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    onEdit?.(item);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(item.id);
    handleMenuClose();
  };

  return (
    <Draggable draggableId={`project-${item.id}`} index={index}>
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
              ? alpha(theme.palette.secondary.main, 0.1)
              : theme.palette.background.paper,
            transform: snapshot.isDragging ? "rotate(2deg)" : "none",
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
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
              mb={1}
            >
              <Box display="flex" alignItems="center" gap={1} flex={1}>
                <RocketLaunch fontSize="small" color="secondary" />
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
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={0.5}
                >
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
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  }}
                />
              </Box>
            )}

            {/* Stats */}
            {variant === "detailed" && (
              <Box display="flex" gap={1} mb={1.5}>
                {item.members_count !== undefined && (
                  <Chip
                    icon={<Group />}
                    label={`${item.members_count} members`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  />
                )}
                {item.requirements_count !== undefined && (
                  <Chip
                    icon={<Assignment />}
                    label={`${item.requirements_count} reqs`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  />
                )}
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
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
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
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={1}>
                {/* Priority */}
                {item.priority && (
                  <Chip
                    label={item.priority}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(
                        getPriorityColor(item.priority),
                        0.1
                      ),
                      color: getPriorityColor(item.priority),
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* Dates */}
                {variant === "detailed" &&
                  (item.start_date || item.end_date) && (
                    <Tooltip
                      title={`Start: ${
                        item.start_date ? formatDate(item.start_date) : "TBD"
                      } | End: ${
                        item.end_date ? formatDate(item.end_date) : "TBD"
                      }`}
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {item.end_date
                            ? formatDate(item.end_date)
                            : "No deadline"}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
              </Box>

              {/* Owner */}
              <Box display="flex" alignItems="center" gap={1}>
                {item.owner ? (
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.7rem",
                      backgroundColor: theme.palette.secondary.main,
                    }}
                  >
                    {getInitials(item.owner)}
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
            <MenuItem onClick={handleClick}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <Delete fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      )}
    </Draggable>
  );
};

// Project Column Component
interface ProjectColumnProps {
  column: ProjectKanbanColumn;
  items: ProjectKanbanItem[];
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: ProjectKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  onAddItem?: (columnId: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({
  column,
  items,
  onItemClick,
  onEdit,
  onDelete,
  onAddItem,
  variant = "detailed",
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: column.color,
              }}
            />
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="text.primary"
            >
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
              <ProjectCard
                key={`project-${item.id}`}
                item={item}
                index={index}
                onItemClick={onItemClick}
                onEdit={onEdit}
                onDelete={onDelete}
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
                <RocketLaunch sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.disabled">
                  No projects in {column.title.toLowerCase()}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Drag projects here or click + to add
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

// Create/Edit Dialog Component
interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreate | ProjectUpdate) => void;
  initialData?: ProjectKanbanItem;
  initialStatus?: string;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  initialStatus,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium",
    status: initialStatus || "planning",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.title,
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        status: initialData.status,
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        status: initialStatus || "planning",
        start_date: "",
        end_date: "",
      });
    }
  }, [initialData, initialStatus]);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      ...(formData.start_date && { start_date: formData.start_date }),
      ...(formData.end_date && { end_date: formData.end_date }),
    };
    onSubmit(submitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Project" : "Create New Project"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
          />
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e: SelectChangeEvent) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e: SelectChangeEvent) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name.trim()}
        >
          {initialData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Projects Kanban Component
export const ProjectsKanban: React.FC<ProjectsKanbanProps> = ({
  showFilters = true,
  allowDragDrop = true,
  className,
  onItemClick,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<ProjectKanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    ProjectKanbanItem | undefined
  >();
  const [dialogInitialStatus, setDialogInitialStatus] = useState<string>();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const projects = await projectsApi.getProjects({
        limit: 100,
      });

      if (projects && projects.items && Array.isArray(projects.items)) {
        const data = projects.items.map((proj: any) => ({
          id: proj.id,
          title: proj.name || "Untitled Project",
          description: proj.description || "",
          status: proj.status || "planning",
          priority: proj.priority || "medium",
          owner: proj.owner || proj.created_by || "",
          created_at: proj.created_at || new Date().toISOString(),
          updated_at: proj.updated_at || new Date().toISOString(),
          labels: proj.tags || [],
          progress: proj.progress || 0,
          members_count: proj.members_count || 0,
          requirements_count: proj.requirements_count || 0,
          start_date: proj.start_date || "",
          end_date: proj.end_date || "",
        }));
        setItems(data);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  const handleDragEnd = async (result: DropResult) => {
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
    const toColumn = destination.droppableId;

    // Update local state immediately for better UX
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: toColumn } : item
      )
    );

    // Update via API
    try {
      await projectsApi.updateProject(itemId, {
        status: toColumn as ProjectStatus | undefined,
      });
    } catch (error) {
      console.error("Error updating project status:", error);
      // Revert on error
      loadData();
    }
  };

  // Handle add item
  const handleAddItem = (columnId: string) => {
    setEditingItem(undefined);
    setDialogInitialStatus(columnId);
    setDialogOpen(true);
  };

  // Handle edit item
  const handleEditItem = (item: ProjectKanbanItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsApi.deleteProject(itemId);
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    try {
      if (editingItem) {
        // Update existing
        await projectsApi.updateProject(editingItem.id, {
          ...data,
          status: data.status,
        });
      } else {
        // Create new
        await projectsApi.createProject({
          code: data.code || "",
          name: data.name || "",
          description: data.description,
          status: data.status || dialogInitialStatus || "draft",
        });
      }
      loadData(); // Reload data
      setDialogOpen(false); // Close dialog after successful save
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" gap={1.5} overflow="auto">
          {Array.from({ length: 5 }).map((_, index) => (
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
            placeholder="Search projects..."
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
          {projectColumns.map((column) => (
            <Box key={column.id} sx={{ minWidth: 280, maxWidth: 320 }}>
              <ProjectColumn
                column={column}
                items={getColumnItems(column.id)}
                onItemClick={onItemClick}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onAddItem={handleAddItem}
                variant={variant}
              />
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* Create/Edit Dialog */}
      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        initialStatus={dialogInitialStatus}
      />
    </Box>
  );
};
