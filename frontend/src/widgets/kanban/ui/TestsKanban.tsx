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
  BugReport,
  Person,
  Schedule,
  MoreVert,
  Visibility,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  Edit,
  Delete,
  DragIndicator,
  PlayArrow,
  Stop,
} from "@mui/icons-material";

// React Beautiful DnD
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Using entities according to FSD
import { testCasesApi } from "@/entities/test-case";
import type {
  TestCaseCreate,
  TestCaseUpdate,
} from "@/entities/test-case/model/types";

// Using shared utilities
import { formatDate } from "@/shared/utils";

// Interfaces
interface TestKanbanColumn {
  id: string;
  title: string;
  color: string;
  status: string;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
}

interface TestKanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
  labels?: string[];
  test_type?: string;
  execution_time?: number;
  expected_result?: string;
  actual_result?: string;
  requirement_id?: number;
  requirement_title?: string;
}

interface TestsKanbanProps {
  projectId?: number;
  requirementId?: number;
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

// Default columns for tests
const testColumns: TestKanbanColumn[] = [
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
    description: "Currently executing",
    icon: <PlayArrow />,
  },
  {
    id: "passed",
    title: "Passed",
    color: "#10b981",
    status: "passed",
    description: "Test passed successfully",
    icon: <CheckCircle />,
  },
  {
    id: "failed",
    title: "Failed",
    color: "#ef4444",
    status: "failed",
    description: "Test failed",
    icon: <ErrorOutline />,
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "#f59e0b",
    status: "blocked",
    description: "Cannot execute",
    icon: <Stop />,
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

// Test Card Component
interface TestCardProps {
  item: TestKanbanItem;
  index: number;
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: TestKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  onExecute?: (itemId: number) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const TestCard: React.FC<TestCardProps> = ({
  item,
  index,
  onItemClick,
  onEdit,
  onDelete,
  onExecute,
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

  const handleExecute = () => {
    onExecute?.(item.id);
    handleMenuClose();
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "passed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      case "blocked":
        return "#f59e0b";
      case "in_progress":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  return (
    <Draggable draggableId={`test-${item.id}`} index={index}>
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
              ? alpha(theme.palette.warning.main, 0.1)
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
                <BugReport fontSize="small" color="warning" />
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

            {/* Test Type and Requirement */}
            {variant !== "minimal" && (
              <Box display="flex" gap={1} mb={1}>
                {item.test_type && (
                  <Chip
                    label={item.test_type}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                    }}
                  />
                )}
                {item.requirement_title && (
                  <Chip
                    label={`REQ: ${item.requirement_title}`}
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

            {/* Test Results */}
            {variant === "detailed" &&
              (item.expected_result || item.actual_result) && (
                <Box mb={1.5}>
                  {item.expected_result && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Expected: {item.expected_result}
                    </Typography>
                  )}
                  {item.actual_result && (
                    <Typography
                      variant="caption"
                      color={
                        item.status === "passed" ? "success.main" : "error.main"
                      }
                      display="block"
                    >
                      Actual: {item.actual_result}
                    </Typography>
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
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
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

                {/* Execution Time */}
                {variant === "detailed" && item.execution_time && (
                  <Tooltip title={`Execution time: ${item.execution_time}ms`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.execution_time}ms
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Created Date */}
                {variant === "detailed" && (
                  <Tooltip title={`Created: ${formatDate(item.created_at)}`}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.created_at)}
                    </Typography>
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
                      backgroundColor: theme.palette.warning.main,
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
            <MenuItem onClick={handleExecute}>
              <ListItemIcon>
                <PlayArrow fontSize="small" />
              </ListItemIcon>
              <ListItemText>Execute Test</ListItemText>
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

// Test Column Component
interface TestColumnProps {
  column: TestKanbanColumn;
  items: TestKanbanItem[];
  onItemClick?: (itemId: number) => void;
  onEdit?: (item: TestKanbanItem) => void;
  onDelete?: (itemId: number) => void;
  onExecute?: (itemId: number) => void;
  onAddItem?: (columnId: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

const TestColumn: React.FC<TestColumnProps> = ({
  column,
  items,
  onItemClick,
  onEdit,
  onDelete,
  onExecute,
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
              <TestCard
                key={`test-${item.id}`}
                item={item}
                index={index}
                onItemClick={onItemClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onExecute={onExecute}
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
                <BugReport sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.disabled">
                  No tests in {column.title.toLowerCase()}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Drag tests here or click + to add
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
interface TestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TestCaseCreate | TestCaseUpdate) => void;
  initialData?: TestKanbanItem;
  projectId?: number;
  requirementId?: number;
  initialStatus?: string;
}

const TestDialog: React.FC<TestDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  projectId,
  requirementId,
  initialStatus,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: initialStatus || "pending",
    test_type: "functional",
    expected_result: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        status: initialData.status,
        test_type: initialData.test_type || "functional",
        expected_result: initialData.expected_result || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: initialStatus || "pending",
        test_type: "functional",
        expected_result: "",
      });
    }
  }, [initialData, initialStatus]);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      ...(requirementId && { requirement_id: requirementId }),
    };
    onSubmit(submitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Test Case" : "Create New Test Case"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Test Case Title"
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
          <TextField
            label="Expected Result"
            value={formData.expected_result}
            onChange={(e) =>
              setFormData({ ...formData, expected_result: e.target.value })
            }
            fullWidth
            multiline
            rows={2}
          />
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Test Type</InputLabel>
              <Select
                value={formData.test_type}
                label="Test Type"
                onChange={(e: SelectChangeEvent) =>
                  setFormData({ ...formData, test_type: e.target.value })
                }
              >
                <MenuItem value="functional">Functional</MenuItem>
                <MenuItem value="integration">Integration</MenuItem>
                <MenuItem value="unit">Unit</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="usability">Usability</MenuItem>
              </Select>
            </FormControl>
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
          </Box>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="passed">Passed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
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

// Main Tests Kanban Component
export const TestsKanban: React.FC<TestsKanbanProps> = ({
  projectId,
  requirementId,
  showFilters = true,
  allowDragDrop = true,
  className,
  onItemClick,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<TestKanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestKanbanItem | undefined>();
  const [dialogInitialStatus, setDialogInitialStatus] = useState<string>();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const testCases = await testCasesApi.getTestCases({
        ...(requirementId && { requirement_id: requirementId }),
        limit: 100,
      });

      if (testCases && testCases.items && Array.isArray(testCases.items)) {
        const data = testCases.items.map((test: any) => ({
          id: test.id,
          title: test.title || "Untitled Test Case",
          description: test.description || "",
          status: test.status || "pending",
          priority: test.priority || "medium",
          assignee: test.assignee || test.assigned_to || "",
          created_at: test.created_at || new Date().toISOString(),
          updated_at: test.updated_at || new Date().toISOString(),
          labels: test.labels || test.tags || [],
          test_type: test.test_type || test.type || "functional",
          execution_time: test.execution_time || 0,
          expected_result: test.expected_result || "",
          actual_result: test.actual_result || "",
          requirement_id: test.requirement_id,
          requirement_title: test.requirement_title || "",
        }));
        setItems(data);
      }
    } catch (error) {
      console.error("Error loading test cases:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

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
      await testCasesApi.updateTestCase(itemId, { status: toColumn });
    } catch (error) {
      console.error("Error updating test case status:", error);
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
  const handleEditItem = (item: TestKanbanItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      try {
        await testCasesApi.deleteTestCase(itemId);
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error deleting test case:", error);
      }
    }
  };

  // Handle execute test
  const handleExecuteTest = async (itemId: number) => {
    try {
      // Update status to in_progress
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: "in_progress" } : item
        )
      );

      await testCasesApi.executeTestCase(itemId);

      // Reload data to get updated results
      loadData();
    } catch (error) {
      console.error("Error executing test case:", error);
      // Revert on error
      loadData();
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: TestCaseCreate | TestCaseUpdate) => {
    try {
      if (editingItem) {
        // Update existing
        await testCasesApi.updateTestCase(editingItem.id, data);
      } else {
        // Create new
        await testCasesApi.createTestCase(data as TestCaseCreate);
      }
      loadData(); // Reload data
    } catch (error) {
      console.error("Error saving test case:", error);
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
    <Box className={className} sx={{ width: "100%", px: 1 }}>
      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3, px: 2 }}>
          <TextField
            placeholder="Search test cases..."
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
          {testColumns.map((column) => (
            <Box key={column.id} sx={{ minWidth: 280, maxWidth: 320, flex: "0 0 auto" }}>
              <TestColumn
                column={column}
                items={getColumnItems(column.id)}
                onItemClick={onItemClick}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onExecute={handleExecuteTest}
                onAddItem={handleAddItem}
                variant={variant}
              />
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* Create/Edit Dialog */}
      <TestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        projectId={projectId}
        requirementId={requirementId}
        initialStatus={dialogInitialStatus}
      />
    </Box>
  );
};
