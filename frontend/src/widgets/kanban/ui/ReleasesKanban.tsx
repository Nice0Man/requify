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
  Rocket,
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
  Publish,
  Code,
  Build,
} from "@mui/icons-material";

// React Beautiful DnD
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Using entities according to FSD
import { releasesApi } from "@/entities/release";
import { releaseManagementApi } from "@/features/release-management";
import type {
  Release,
  ReleaseCreate,
  ReleaseUpdate,
} from "@/entities/release/model/types";

// Using shared utilities
import { formatDate } from "@/shared/utils";

// Interfaces
interface ReleaseKanbanColumn {
  id: string;
  title: string;
  color: string;
  status: string;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
}

interface ReleaseKanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  version?: string;
  created_at: string;
  updated_at: string;
  planned_date?: string;
  actual_date?: string;
  labels?: string[];
  progress?: number;
  requirements_count?: number;
  project_name?: string;
  release_type?: string;
  completion_percentage?: number;
}

interface ReleasesKanbanProps {
  projectId?: number;
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

// Default columns for releases
const releaseColumns: ReleaseKanbanColumn[] = [
  {
    id: "draft",
    title: "Draft",
    color: "#64748b",
    status: "draft",
    description: "Planning stage",
    icon: <Assignment />,
  },
  {
    id: "planned",
    title: "Planned",
    color: "#3b82f6",
    status: "planned",
    description: "Scheduled for development",
    icon: <Schedule />,
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "#f59e0b",
    status: "in_progress",
    description: "Currently being developed",
    icon: <Build />,
  },
  {
    id: "testing",
    title: "Testing",
    color: "#8b5cf6",
    status: "testing",
    description: "Quality assurance",
    icon: <Code />,
  },
  {
    id: "ready",
    title: "Ready",
    color: "#10b981",
    status: "ready",
    description: "Ready for release",
    icon: <CheckCircle />,
  },
  {
    id: "published",
    title: "Published",
    color: "#059669",
    status: "published",
    description: "Released to production",
    icon: <Publish />,
  },
  {
    id: "cancelled",
    title: "Cancelled",
    color: "#ef4444",
    status: "cancelled",
    description: "Cancelled releases",
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

// Release type colors
const getReleaseTypeColor = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case "major":
      return "#ef4444";
    case "minor":
      return "#f59e0b";
    case "patch":
      return "#10b981";
    case "hotfix":
      return "#dc2626";
    case "beta":
      return "#8b5cf6";
    case "alpha":
      return "#6366f1";
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

// Release Card Component
interface ReleaseCardProps {
  item: ReleaseKanbanItem;
  index: number;
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: ReleaseKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  onPublish?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({
  item,
  index,
  onItemClick,
  onEdit,
  onDelete,
  onPublish,
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

  const handlePublish = () => {
    onPublish?.(item.id);
    handleMenuClose();
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "published":
        return "#059669";
      case "ready":
        return "#10b981";
      case "testing":
        return "#8b5cf6";
      case "in_progress":
        return "#f59e0b";
      case "planned":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const isOverdue = item.planned_date && new Date(item.planned_date) < new Date() && item.status !== "published";

  return (
    <Draggable draggableId={`release-${item.id}`} index={index}>
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
            borderLeft: `4px solid ${getStatusColor()}`,
            backgroundColor: snapshot.isDragging
              ? alpha(theme.palette.success.main, 0.1)
              : theme.palette.background.paper,
            transform: snapshot.isDragging ? "rotate(2deg)" : "none",
            boxShadow: snapshot.isDragging
              ? theme.shadows[8]
              : theme.shadows[1],
            "&:hover": {
              boxShadow: theme.shadows[4],
              transform: "translateY(-2px)",
            },
            ...(isOverdue && {
              borderColor: theme.palette.error.main,
              backgroundColor: alpha(theme.palette.error.main, 0.05),
            }),
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            {/* Header */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1} flex={1}>
                <Rocket fontSize="small" color="success" />
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
                {isOverdue && (
                  <Chip
                    label="OVERDUE"
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: "0.6rem", fontWeight: 700 }}
                  />
                )}
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

            {/* Version and Type */}
            {variant !== "minimal" && (
              <Box display="flex" gap={1} mb={1}>
                {item.version && (
                  <Chip
                    label={`v${item.version}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 600,
                    }}
                  />
                )}
                {item.release_type && (
                  <Chip
                    label={item.release_type}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(getReleaseTypeColor(item.release_type), 0.1),
                      color: getReleaseTypeColor(item.release_type),
                      fontWeight: 600,
                    }}
                  />
                )}
                {item.project_name && (
                  <Chip
                    label={item.project_name}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  />
                )}
              </Box>
            )}

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
            {variant === "detailed" && item.completion_percentage !== undefined && (
              <Box mb={1.5}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Completion
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.completion_percentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.completion_percentage}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                  }}
                />
              </Box>
            )}

            {/* Requirements Count */}
            {variant === "detailed" && item.requirements_count !== undefined && (
              <Box display="flex" gap={1} mb={1.5}>
                <Chip
                  icon={<Assignment />}
                  label={`${item.requirements_count} requirements`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
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
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
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

                {/* Planned Date */}
                {variant === "detailed" && item.planned_date && (
                  <Tooltip title={`Planned: ${formatDate(item.planned_date)}`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule sx={{ 
                        fontSize: 14, 
                        color: isOverdue ? "error.main" : "text.secondary" 
                      }} />
                      <Typography 
                        variant="caption" 
                        color={isOverdue ? "error.main" : "text.secondary"}
                        fontWeight={isOverdue ? 600 : 400}
                      >
                        {formatDate(item.planned_date)}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Actual Date */}
                {variant === "detailed" && item.actual_date && (
                  <Tooltip title={`Released: ${formatDate(item.actual_date)}`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CheckCircle sx={{ fontSize: 14, color: "success.main" }} />
                      <Typography variant="caption" color="success.main">
                        {formatDate(item.actual_date)}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Box>

              {/* Actions */}
              <Box display="flex" alignItems="center" gap={1}>
                {item.status === "ready" && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish?.(item.id);
                    }}
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.success.main, 0.2),
                      },
                    }}
                  >
                    <Publish fontSize="small" />
                  </IconButton>
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
            {item.status === "ready" && (
              <MenuItem onClick={handlePublish}>
                <ListItemIcon>
                  <Publish fontSize="small" />
                </ListItemIcon>
                <ListItemText>Publish Release</ListItemText>
              </MenuItem>
            )}
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

// Release Column Component
interface ReleaseColumnProps {
  column: ReleaseKanbanColumn;
  items: ReleaseKanbanItem[];
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: ReleaseKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  onPublish?: (itemId: number) => void;
  onAddItem?: (columnId: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const ReleaseColumn: React.FC<ReleaseColumnProps> = ({
  column,
  items,
  onItemClick,
  onEdit,
  onDelete,
  onPublish,
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
              <ReleaseCard
                key={`release-${item.id}`}
                item={item}
                index={index}
                onItemClick={onItemClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onPublish={onPublish}
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
                <Rocket sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.disabled">
                  No releases in {column.title.toLowerCase()}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Drag releases here or click + to add
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
interface ReleaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReleaseCreate | ReleaseUpdate) => void;
  initialData?: ReleaseKanbanItem;
  projectId?: number;
  initialStatus?: string;
}

const ReleaseDialog: React.FC<ReleaseDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  projectId,
  initialStatus,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    version: "",
    release_type: "minor",
    status: initialStatus || "draft",
    planned_date: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.title,
        description: initialData.description || "",
        version: initialData.version || "",
        release_type: initialData.release_type || "minor",
        status: initialData.status,
        planned_date: initialData.planned_date || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        version: "",
        release_type: "minor",
        status: initialStatus || "draft",
        planned_date: "",
      });
    }
  }, [initialData, initialStatus]);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      ...(projectId && { project_id: projectId }),
      ...(formData.planned_date && { planned_date: formData.planned_date }),
    };
    onSubmit(submitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Release" : "Create New Release"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Release Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            fullWidth
            placeholder="e.g., 1.0.0"
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Release Type</InputLabel>
              <Select
                value={formData.release_type}
                label="Release Type"
                onChange={(e: SelectChangeEvent) =>
                  setFormData({ ...formData, release_type: e.target.value })
                }
              >
                <MenuItem value="major">Major</MenuItem>
                <MenuItem value="minor">Minor</MenuItem>
                <MenuItem value="patch">Patch</MenuItem>
                <MenuItem value="hotfix">Hotfix</MenuItem>
                <MenuItem value="beta">Beta</MenuItem>
                <MenuItem value="alpha">Alpha</MenuItem>
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
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="testing">Testing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField
            label="Planned Date"
            type="date"
            value={formData.planned_date}
            onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
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

// Main Releases Kanban Component
export const ReleasesKanban: React.FC<ReleasesKanbanProps> = ({
  projectId,
  showFilters = true,
  allowDragDrop = true,
  className,
  onItemClick,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<ReleaseKanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReleaseKanbanItem | undefined>();
  const [dialogInitialStatus, setDialogInitialStatus] = useState<string>();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const releases = await releaseManagementApi.getActiveReleases(projectId);

      if (releases && Array.isArray(releases)) {
        const data = releases.map((release: any) => ({
          id: release.id,
          title: release.name || 'Untitled Release',
          description: release.description || '',
          status: release.status || 'draft',
          priority: release.priority || 'medium',
          version: release.version || '',
          created_at: release.created_at || new Date().toISOString(),
          updated_at: release.updated_at || new Date().toISOString(),
          planned_date: release.planned_date || '',
          actual_date: release.actual_date || '',
          labels: release.labels || [],
          progress: release.progress || 0,
          requirements_count: release.requirements?.length || 0,
          project_name: release.project_name || '',
          release_type: release.release_type || 'minor',
          completion_percentage: release.completion_percentage || 0,
        }));
        setItems(data);
      }
    } catch (error) {
      console.error("Error loading releases:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

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
        item.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      await releasesApi.updateRelease(itemId, { status: toColumn });
    } catch (error) {
      console.error("Error updating release status:", error);
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
  const handleEditItem = (item: ReleaseKanbanItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this release?")) {
      try {
        await releasesApi.deleteRelease(itemId);
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error deleting release:", error);
      }
    }
  };

  // Handle publish release
  const handlePublishRelease = async (itemId: number) => {
    if (window.confirm("Are you sure you want to publish this release?")) {
      try {
        await releasesApi.publishRelease(itemId);
        // Update local state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId 
              ? { ...item, status: "published", actual_date: new Date().toISOString() } 
              : item
          )
        );
      } catch (error) {
        console.error("Error publishing release:", error);
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: ReleaseCreate | ReleaseUpdate) => {
    try {
      if (editingItem) {
        // Update existing
        await releasesApi.updateRelease(editingItem.id, data);
      } else {
        // Create new
        await releasesApi.createRelease(data as ReleaseCreate);
      }
      loadData(); // Reload data
    } catch (error) {
      console.error("Error saving release:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" gap={1.5} overflow="auto">
          {Array.from({ length: 7 }).map((_, index) => (
            <Box key={index} sx={{ minWidth: 280 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              {Array.from({ length: 2 }).map((_, cardIndex) => (
                <Skeleton
                  key={cardIndex}
                  variant="rectangular"
                  height={140}
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
    <Box className={className} sx={{ width: "100%", px: 1 }}>
      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3, px: 2 }}>
          <TextField
            placeholder="Search releases..."
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
            px: 2,
            width: "100%",
            minWidth: "max-content",
          }}
        >
          {releaseColumns.map((column) => (
            <Box key={column.id} sx={{ minWidth: 280, maxWidth: 320, flex: "0 0 auto" }}>
              <ReleaseColumn
                column={column}
                items={getColumnItems(column.id)}
                onItemClick={onItemClick}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onPublish={handlePublishRelease}
                onAddItem={handleAddItem}
                variant={variant}
              />
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* Create/Edit Dialog */}
      <ReleaseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        projectId={projectId}
        initialStatus={dialogInitialStatus}
      />
    </Box>
  );
}; 