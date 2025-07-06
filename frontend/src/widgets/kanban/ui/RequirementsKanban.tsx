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
  Assignment,
  Person,
  Schedule,
  Flag,
  MoreVert,
  Visibility,
  CheckCircle,
  RadioButtonUnchecked,
  ErrorOutline,
  AccessTime,
  Edit,
  Delete,
  LocalOffer,
  DragIndicator,
} from "@mui/icons-material";

// React Beautiful DnD
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Using entities according to FSD
import { requirementsApi } from "@/entities/requirement";
import type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
} from "@/entities/requirement/model/types";

// Using shared utilities
import { formatDate } from "@/shared/utils";

// Interfaces
interface RequirementKanbanColumn {
  id: string;
  title: string;
  color: string;
  status: string;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
}

interface RequirementKanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
  labels?: string[];
  progress?: number;
  project_name?: string;
  author?: string;
  type_name?: string;
}

interface RequirementsKanbanProps {
  projectId?: number;
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

// Default columns for requirements
const requirementColumns: RequirementKanbanColumn[] = [
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

// Requirement Card Component
interface RequirementCardProps {
  item: RequirementKanbanItem;
  index: number;
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: RequirementKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const RequirementCard: React.FC<RequirementCardProps> = ({
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
    <Draggable draggableId={`requirement-${item.id}`} index={index}>
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
                <Assignment fontSize="small" color="primary" />
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

            {/* Type and Project */}
            {variant !== "minimal" && (
              <Box display="flex" gap={1} mb={1}>
                {item.type_name && (
                  <Chip
                    label={item.type_name}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
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

                {/* Created Date */}
                {variant === "detailed" && (
                  <Tooltip title={`Created: ${formatDate(item.created_at)}`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.created_at)}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Box>

              {/* Assignee */}
              <Box display="flex" alignItems="center" gap={1}>
                {item.assignee ? (
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

// Requirement Column Component
interface RequirementColumnProps {
  column: RequirementKanbanColumn;
  items: RequirementKanbanItem[];
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: RequirementKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  onAddItem?: (columnId: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const RequirementColumn: React.FC<RequirementColumnProps> = ({
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
              <RequirementCard
                key={`requirement-${item.id}`}
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
                <Assignment sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.disabled">
                  No requirements in {column.title.toLowerCase()}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Drag requirements here or click + to add
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
interface RequirementDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequirementCreate | RequirementUpdate) => void;
  initialData?: RequirementKanbanItem;
  projectId?: number;
  initialStatus?: string;
}

const RequirementDialog: React.FC<RequirementDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  projectId,
  initialStatus,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: initialStatus || "draft",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        status: initialData.status,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: initialStatus || "draft",
      });
    }
  }, [initialData, initialStatus]);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      ...(projectId && { project_id: projectId }),
    };
    onSubmit(submitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Requirement" : "Create New Requirement"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
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
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="review">In Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title.trim()}
        >
          {initialData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Requirements Kanban Component
export const RequirementsKanban: React.FC<RequirementsKanbanProps> = ({
  projectId,
  showFilters = true,
  allowDragDrop = true,
  className,
  onItemClick,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<RequirementKanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    RequirementKanbanItem | undefined
  >();
  const [dialogInitialStatus, setDialogInitialStatus] = useState<string>();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const requirements = await requirementsApi.getRequirements({
        project_id: projectId,
        limit: 100,
      });

      if (
        requirements &&
        requirements.items &&
        Array.isArray(requirements.items)
      ) {
        const data = requirements.items.map((req: any) => ({
          id: req.id,
          title: req.title || "Untitled Requirement",
          description: req.description || "",
          status:
            typeof req.status === "string"
              ? req.status
              : req.status?.value || "draft",
          priority: req.priority || "medium",
          assignee: req.assignee || req.assigned_to || "",
          created_at: req.created_at || new Date().toISOString(),
          updated_at: req.updated_at || new Date().toISOString(),
          labels: req.labels || req.tags || [],
          progress: req.progress || 0,
          project_name: req.project_name || "",
          author: req.author || req.created_by || "",
          type_name: req.type_name || req.requirement_type || "",
        }));
        setItems(data);
      }
    } catch (error) {
      console.error("Error loading requirements:", error);
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
      await requirementsApi.updateRequirement(itemId, {
        status: toColumn,
      } as RequirementUpdate);
    } catch (error) {
      console.error("Error updating requirement status:", error);
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
  const handleEditItem = (item: RequirementKanbanItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this requirement?")) {
      try {
        await requirementsApi.deleteRequirement(itemId);
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error deleting requirement:", error);
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (
    data: RequirementCreate | RequirementUpdate
  ) => {
    try {
      if (editingItem) {
        // Update existing
        await requirementsApi.updateRequirement(editingItem.id, data);
      } else {
        // Create new
        await requirementsApi.createRequirement(data as RequirementCreate);
      }
      loadData(); // Reload data
    } catch (error) {
      console.error("Error saving requirement:", error);
    }
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
    <Box className={className} sx={{ width: "100%", px: 1 }}>
      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3, px: 2 }}>
          <TextField
            placeholder="Search requirements..."
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
          {requirementColumns.map((column) => (
            <Box key={column.id} sx={{ minWidth: 280, maxWidth: 320, flex: "0 0 auto" }}>
              <RequirementColumn
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
      <RequirementDialog
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
