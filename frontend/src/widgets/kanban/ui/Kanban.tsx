import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Stack,
  Fade,
  Grow,
  Slide,
  Paper,
  AvatarGroup,
  LinearProgress,
} from "@mui/material";
import {
  ViewColumn,
  Search,
  FilterList,
  Add,
  Refresh,
  Assignment,
  RocketLaunch,
  BugReport,
  Person,
  Schedule,
  Flag,
  DragIndicator,
  MoreVert,
  TrendingUp,
  Visibility,
  CheckCircle,
  RadioButtonUnchecked,
  ErrorOutline,
  AccessTime,
  Group,
  LocalOffer,
} from "@mui/icons-material";

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

// Local interfaces to avoid external dependencies
interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  status: string;
  limit?: number;
  description?: string;
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
      color: "#94a3b8",
      status: "draft",
      description: "Requirements in draft state",
    },
    {
      id: "review",
      title: "In Review",
      color: "#f59e0b",
      status: "review",
      description: "Under team review",
    },
    {
      id: "approved",
      title: "Approved",
      color: "#10b981",
      status: "approved",
      description: "Ready for implementation",
    },
    {
      id: "rejected",
      title: "Rejected",
      color: "#ef4444",
      status: "rejected",
      description: "Needs revision",
    },
  ],
  projects: [
    {
      id: "planning",
      title: "Planning",
      color: "#6366f1",
      status: "planning",
      description: "Project planning phase",
    },
    {
      id: "active",
      title: "Active",
      color: "#10b981",
      status: "active",
      description: "Actively developed",
    },
    {
      id: "completed",
      title: "Completed",
      color: "#94a3b8",
      status: "completed",
      description: "Successfully completed",
    },
    {
      id: "cancelled",
      title: "Cancelled",
      color: "#ef4444",
      status: "cancelled",
      description: "Cancelled projects",
    },
  ],
  tasks: [
    {
      id: "pending",
      title: "Pending",
      color: "#94a3b8",
      status: "pending",
      description: "Waiting to start",
    },
    {
      id: "in_progress",
      title: "In Progress",
      color: "#f59e0b",
      status: "in_progress",
      description: "Currently working",
    },
    {
      id: "passed",
      title: "Passed",
      color: "#10b981",
      status: "passed",
      description: "Tests passed",
    },
    {
      id: "failed",
      title: "Failed",
      color: "#ef4444",
      status: "failed",
      description: "Tests failed",
    },
  ],
};

const getItemIcon = (type: string, status?: string) => {
  const iconStyle = { fontSize: 18 };

  switch (type) {
    case "requirement":
      return status === "approved" ? (
        <CheckCircle sx={{ ...iconStyle, color: "success.main" }} />
      ) : (
        <Assignment sx={iconStyle} />
      );
    case "project":
      return <RocketLaunch sx={iconStyle} />;
    case "task":
      return status === "passed" ? (
        <CheckCircle sx={{ ...iconStyle, color: "success.main" }} />
      ) : status === "failed" ? (
        <ErrorOutline sx={{ ...iconStyle, color: "error.main" }} />
      ) : (
        <BugReport sx={iconStyle} />
      );
    default:
      return <Assignment sx={iconStyle} />;
  }
};

const getPriorityColor = (
  priority?: string
): "error" | "warning" | "info" | "success" | "default" => {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    case "minor":
      return "success";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string, type: string) => {
  const iconStyle = { fontSize: 16 };

  if (type === "task") {
    switch (status) {
      case "passed":
        return <CheckCircle sx={{ ...iconStyle, color: "success.main" }} />;
      case "failed":
        return <ErrorOutline sx={{ ...iconStyle, color: "error.main" }} />;
      case "in_progress":
        return <AccessTime sx={{ ...iconStyle, color: "warning.main" }} />;
      default:
        return <RadioButtonUnchecked sx={iconStyle} />;
    }
  }

  switch (status) {
    case "approved":
    case "completed":
      return <CheckCircle sx={{ ...iconStyle, color: "success.main" }} />;
    case "active":
    case "in_progress":
      return <AccessTime sx={{ ...iconStyle, color: "info.main" }} />;
    case "rejected":
    case "failed":
    case "cancelled":
      return <ErrorOutline sx={{ ...iconStyle, color: "error.main" }} />;
    default:
      return <RadioButtonUnchecked sx={iconStyle} />;
  }
};

interface KanbanCardProps {
  item: KanbanItem;
  onItemClick?: (itemId: number, itemType: string) => void;
  allowDragDrop?: boolean;
  variant?: "compact" | "detailed" | "minimal";
  index: number;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  onItemClick,
  allowDragDrop,
  variant = "detailed",
  index,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onItemClick && item.id) {
      onItemClick(item.id, item.type);
    }
  };

  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();
  const priorityColor = getPriorityColor(item.priority);

  return (
    <Grow in timeout={600 + index * 100}>
      <Card
        onClick={handleClick}
        sx={{
          cursor: onItemClick ? "pointer" : "default",
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
          boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&:hover": onItemClick
            ? {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.primary.main,
                  0.15
                )}`,
                transform: "translateY(-2px)",
                "& .card-actions": {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              }
            : {},
          "&:before":
            item.priority === "high" || item.priority === "critical"
              ? {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 4,
                  height: "100%",
                  background: `linear-gradient(to bottom, ${
                    theme.palette.error.main
                  }, ${alpha(theme.palette.error.main, 0.6)})`,
                }
              : {},
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            mb={1.5}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flex: 1, minWidth: 0 }}
            >
              {allowDragDrop && (
                <DragIndicator
                  sx={{
                    fontSize: 16,
                    color: "text.disabled",
                    cursor: "grab",
                    "&:hover": { color: "text.secondary" },
                  }}
                />
              )}
              {getItemIcon(item.type, item.status)}
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {item.type}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              {item.priority && (
                <Tooltip title={`Priority: ${item.priority}`}>
                  <Chip
                    label={item.priority}
                    size="small"
                    color={priorityColor}
                    sx={{
                      fontSize: "0.7rem",
                      height: 20,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  />
                </Tooltip>
              )}

              <IconButton
                className="card-actions"
                size="small"
                sx={{
                  opacity: 0,
                  transform: "translateX(8px)",
                  transition: "all 0.2s ease",
                  width: 24,
                  height: 24,
                }}
              >
                <MoreVert sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Title */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>

          {/* Description */}
          {item.description && variant !== "minimal" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 1.5,
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: variant === "compact" ? 1 : 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.description}
            </Typography>
          )}

          {/* Progress Bar */}
          {item.progress !== undefined && variant === "detailed" && (
            <Box mb={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0.5}
              >
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  {item.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={item.progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                  },
                }}
              />
            </Box>
          )}

          {/* Meta Information */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {getStatusIcon(item.status, item.type)}
              <Typography variant="caption" color="text.secondary">
                {isOverdue ? (
                  <span
                    style={{ color: theme.palette.error.main, fontWeight: 600 }}
                  >
                    Overdue
                  </span>
                ) : (
                  formatDate(item.created_at)
                )}
              </Typography>
            </Stack>

            {/* Assignees */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {item.assignees && item.assignees.length > 1 ? (
                <Tooltip title={item.assignees.join(", ")}>
                  <AvatarGroup
                    max={2}
                    sx={{
                      "& .MuiAvatar-root": {
                        width: 24,
                        height: 24,
                        fontSize: "0.7rem",
                        border: `1px solid ${theme.palette.background.paper}`,
                      },
                    }}
                  >
                    {item.assignees.map((assignee, idx) => (
                      <Avatar key={idx}>{assignee[0].toUpperCase()}</Avatar>
                    ))}
                  </AvatarGroup>
                </Tooltip>
              ) : (
                item.assignee && (
                  <Tooltip title={item.assignee}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem" }}>
                      {item.assignee[0].toUpperCase()}
                    </Avatar>
                  </Tooltip>
                )
              )}

              {item.dueDate && (
                <Tooltip title={`Due: ${formatDate(item.dueDate)}`}>
                  <AccessTime
                    sx={{
                      fontSize: 14,
                      color: isOverdue ? "error.main" : "text.secondary",
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {/* Labels */}
          {item.labels && item.labels.length > 0 && variant !== "minimal" && (
            <Stack
              direction="row"
              spacing={0.5}
              mt={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              {item.labels
                .slice(0, variant === "compact" ? 2 : 4)
                .map((label, index) => (
                  <Chip
                    key={index}
                    label={label}
                    size="small"
                    variant="outlined"
                    icon={<LocalOffer sx={{ fontSize: 12 }} />}
                    sx={{
                      fontSize: "0.65rem",
                      height: 20,
                      "& .MuiChip-icon": {
                        fontSize: 12,
                        marginLeft: 0.5,
                      },
                    }}
                  />
                ))}
              {item.labels.length > (variant === "compact" ? 2 : 4) && (
                <Chip
                  label={`+${
                    item.labels.length - (variant === "compact" ? 2 : 4)
                  }`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 20 }}
                />
              )}
            </Stack>
          )}

          {/* Time Tracking */}
          {(item.estimatedHours || item.actualHours) &&
            variant === "detailed" && (
              <Stack
                direction="row"
                justifyContent="space-between"
                mt={1.5}
                pt={1.5}
                sx={{
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                {item.estimatedHours && (
                  <Typography variant="caption" color="text.secondary">
                    Est: {item.estimatedHours}h
                  </Typography>
                )}
                {item.actualHours && (
                  <Typography variant="caption" color="text.secondary">
                    Actual: {item.actualHours}h
                  </Typography>
                )}
              </Stack>
            )}
        </CardContent>
      </Card>
    </Grow>
  );
};

interface KanbanColumnProps {
  column: KanbanColumn;
  items: KanbanItem[];
  onItemClick?: (itemId: number, itemType: string) => void;
  allowDragDrop?: boolean;
  variant?: "compact" | "detailed" | "minimal";
  index: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  items = [],
  onItemClick,
  allowDragDrop,
  variant = "detailed",
  index,
}) => {
  const theme = useTheme();
  const isOverLimit = column.limit && items.length >= column.limit;

  return (
    <Slide direction="right" in timeout={400 + index * 150}>
      <Paper
        elevation={0}
        sx={{
          minWidth: 300,
          maxWidth: 320,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.8
          )}, ${alpha(theme.palette.background.default, 0.4)})`,
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          p: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.04)}`,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          },
        }}
      >
        {/* Column Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: column.color || theme.palette.primary.main,
                boxShadow: `0 0 8px ${alpha(
                  column.color || theme.palette.primary.main,
                  0.4
                )}`,
              }}
            />
            <Stack spacing={0.5}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, fontSize: "0.95rem" }}
              >
                {column.title}
              </Typography>
              {column.description && variant === "detailed" && (
                <Typography variant="caption" color="text.secondary">
                  {column.description}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Badge
              badgeContent={items.length}
              color={isOverLimit ? "error" : "default"}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.7rem",
                  height: 18,
                  minWidth: 18,
                  fontWeight: 600,
                },
              }}
            />

            {isOverLimit && (
              <Tooltip title={`Limit exceeded (${column.limit})`}>
                <Chip
                  label="LIMIT"
                  size="small"
                  color="error"
                  sx={{
                    fontSize: "0.6rem",
                    height: 18,
                    fontWeight: 600,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Items Container */}
        <Box
          sx={{
            maxHeight: variant === "compact" ? 400 : 600,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              background: alpha(theme.palette.grey[200], 0.5),
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.grey[400], 0.7),
              borderRadius: 3,
              "&:hover": {
                background: alpha(theme.palette.grey[500], 0.8),
              },
            },
          }}
        >
          {items.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Visibility sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                No items in {column.title.toLowerCase()}
              </Typography>
            </Box>
          ) : (
            items.map((item, itemIndex) => (
              <KanbanCard
                key={item.id}
                item={item}
                onItemClick={onItemClick}
                allowDragDrop={allowDragDrop}
                variant={variant}
                index={itemIndex}
              />
            ))
          )}
        </Box>

        {/* Add Button */}
        {variant !== "minimal" && (
          <Fade in timeout={1000 + index * 200}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              fullWidth
              sx={{
                mt: 2,
                borderStyle: "dashed",
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: "text.secondary",
                py: 1,
                "&:hover": {
                  borderStyle: "solid",
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  color: "primary.main",
                },
              }}
            >
              Add Item
            </Button>
          </Fade>
        )}
      </Paper>
    </Slide>
  );
};

export const Kanban: React.FC<KanbanProps> = ({
  mode = "requirements",
  projectId,
  columns,
  showFilters = true,
  allowDragDrop = false,
  className,
  onItemClick,
  onItemMove,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  const currentColumns =
    columns || defaultColumns[mode] || defaultColumns.requirements || [];

  console.log("Component initialized with:", {
    mode,
    projectId,
    itemsLength: safeItems.length,
    columnsLength: currentColumns.length,
    isLoading,
    error,
  });

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: KanbanItem[] = [];

      console.log(`Loading items for mode: ${mode}, projectId: ${projectId}`);

      switch (mode) {
        case "requirements":
          try {
            const reqResponse = await requirementsApi.getRequirements({
              project_id: projectId,
              limit: 100,
            });
            console.log("Requirements API response:", reqResponse);

            if (!reqResponse) {
              throw new Error("Requirements API returned null response");
            }

            if (!reqResponse.items) {
              console.warn(
                "Requirements API returned response without items array"
              );
              reqResponse.items = [];
            }

            if (!Array.isArray(reqResponse.items)) {
              throw new Error(
                `Requirements API returned non-array items: ${typeof reqResponse.items}`
              );
            }

            data = reqResponse.items
              .map((req: RequirementWithDetails) => {
                if (!req || typeof req !== "object") {
                  console.warn("Invalid requirement object:", req);
                  return null;
                }

                return {
                  id: req.id || 0,
                  title: req.title || "Untitled",
                  description: req.description || "",
                  status:
                    typeof req.status === "string"
                      ? req.status
                      : req.status?.name || "draft",
                  priority:
                    typeof req.priority === "string"
                      ? req.priority
                      : req.priority?.name || "medium",
                  assignee: req.author_name || "Unassigned",
                  created_at: req.created_at || new Date().toISOString(),
                  updated_at: req.updated_at || new Date().toISOString(),
                  type: "requirement" as const,
                  labels: req.type?.name
                    ? [req.type.name]
                    : typeof req.type === "string"
                    ? [req.type]
                    : [],
                  progress: req.progress || 0,
                };
              })
              .filter(Boolean) as KanbanItem[];
          } catch (reqError) {
            console.error("Error loading requirements:", reqError);
            throw new Error(
              `Failed to load requirements: ${
                reqError instanceof Error ? reqError.message : String(reqError)
              }`
            );
          }
          break;

        case "projects":
          try {
            const projResponse = await projectsApi.getProjects({
              limit: 100,
            });
            console.log("Projects API response:", projResponse);

            if (!projResponse) {
              throw new Error("Projects API returned null response");
            }

            if (!projResponse.items) {
              console.warn(
                "Projects API returned response without items array"
              );
              projResponse.items = [];
            }

            if (!Array.isArray(projResponse.items)) {
              throw new Error(
                `Projects API returned non-array items: ${typeof projResponse.items}`
              );
            }

            data = projResponse.items
              .map((proj: Project) => {
                if (!proj || typeof proj !== "object") {
                  console.warn("Invalid project object:", proj);
                  return null;
                }

                return {
                  id: proj.id || 0,
                  title: proj.name || "Untitled Project",
                  description: proj.description || "",
                  status: proj.status || "planning",
                  priority: "medium",
                  assignee: "PM",
                  created_at: proj.created_at || new Date().toISOString(),
                  updated_at:
                    proj.updated_at ||
                    proj.created_at ||
                    new Date().toISOString(),
                  type: "project" as const,
                  labels: proj.code ? [proj.code] : [],
                  progress: proj.status === "active" ? 100 : 0,
                };
              })
              .filter(Boolean) as KanbanItem[];
          } catch (projError) {
            console.error("Error loading projects:", projError);
            throw new Error(
              `Failed to load projects: ${
                projError instanceof Error
                  ? projError.message
                  : String(projError)
              }`
            );
          }
          break;

        case "tasks":
          try {
            const testResponse = await testCasesApi.getTestCases({
              limit: 100,
            });
            console.log("Test cases API response:", testResponse);

            if (!testResponse) {
              throw new Error("Test cases API returned null response");
            }

            if (!testResponse.items) {
              console.warn(
                "Test cases API returned response without items array"
              );
              testResponse.items = [];
            }

            if (!Array.isArray(testResponse.items)) {
              throw new Error(
                `Test cases API returned non-array items: ${typeof testResponse.items}`
              );
            }

            data = testResponse.items
              .map((test: TestCase) => {
                if (!test || typeof test !== "object") {
                  console.warn("Invalid test case object:", test);
                  return null;
                }

                return {
                  id: test.id || 0,
                  title: test.title || "Untitled Test",
                  description: test.description || "",
                  status: test.status || "pending",
                  priority: test.priority || "medium",
                  assignee: test.author_name || "Unassigned",
                  created_at: test.created_at || new Date().toISOString(),
                  updated_at: test.updated_at || new Date().toISOString(),
                  type: "task" as const,
                  labels: test.type ? [test.type] : [],
                  progress: test.progress || 0,
                };
              })
              .filter(Boolean) as KanbanItem[];
          } catch (testError) {
            console.error("Error loading test cases:", testError);
            throw new Error(
              `Failed to load test cases: ${
                testError instanceof Error
                  ? testError.message
                  : String(testError)
              }`
            );
          }
          break;

        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      console.log("Processed data:", data);

      if (!Array.isArray(data)) {
        throw new Error(`Processed data is not an array: ${typeof data}`);
      }

      setItems(data);
    } catch (err: any) {
      console.error("Error loading items:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mode, projectId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = () => {
    loadItems();
  };

  const handleItemMove = (
    itemId: number,
    fromColumn: string,
    toColumn: string
  ) => {
    if (onItemMove) {
      onItemMove(itemId, fromColumn, toColumn);
    }
    // Update local state
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((item) =>
        item.id === itemId ? { ...item, status: toColumn } : item
      );
    });
  };

  const filteredItems = (safeItems || []).filter((item) => {
    if (
      searchTerm &&
      !item.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (priorityFilter && item.priority !== priorityFilter) {
      return false;
    }
    if (assigneeFilter && item.assignee !== assigneeFilter) {
      return false;
    }
    return true;
  });

  console.log("Render state:", {
    items: safeItems?.length || 0,
    filteredItems: filteredItems?.length || 0,
    currentColumns: currentColumns?.length || 0,
    isLoading,
    error,
    mode,
    projectId,
  });

  const getColumnItems = (columnId: string) => {
    const result = (filteredItems || []).filter(
      (item) =>
        item.status === columnId ||
        item.status ===
          (currentColumns || []).find((col) => col.id === columnId)?.status
    );
    console.log(`Column ${columnId} items:`, result.length);
    return result;
  };

  const getModeIcon = () => {
    switch (mode) {
      case "requirements":
        return <Assignment />;
      case "projects":
        return <RocketLaunch />;
      case "tasks":
        return <BugReport />;
      default:
        return <ViewColumn />;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "requirements":
        return "Requirements Board";
      case "projects":
        return "Projects Board";
      case "tasks":
        return "Tasks Board";
      default:
        return "Kanban Board";
    }
  };

  const getStats = () => {
    const safeFilteredItems = filteredItems || [];
    const total = safeFilteredItems.length;
    const completed = safeFilteredItems.filter((item) =>
      ["approved", "completed", "passed"].includes(item.status)
    ).length;
    const inProgress = safeFilteredItems.filter((item) =>
      ["review", "active", "in_progress"].includes(item.status)
    ).length;

    return { total, completed, inProgress };
  };

  const stats = getStats();

  if (error) {
    return (
      <Fade in>
        <Card
          className={className}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            background: alpha(theme.palette.error.main, 0.02),
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <ErrorOutline sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
            <Typography color="error" variant="h6" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              onClick={handleRefresh}
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Fade>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <Fade in timeout={600}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.02
            )}, ${alpha(theme.palette.secondary.main, 0.02)})`,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                }}
              >
                {getModeIcon()}
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {getModeTitle()}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip
                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                    label={`${stats.total} total`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label={`${stats.completed} completed`}
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                  <Chip
                    icon={<AccessTime sx={{ fontSize: 16 }} />}
                    label={`${stats.inProgress} in progress`}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                </Stack>
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title="Refresh data">
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isLoading}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* Filters */}
      {showFilters && (
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 250,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={assigneeFilter}
                  label="Assignee"
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Assignees</MenuItem>
                  {Array.from(
                    new Set(
                      (safeItems || [])
                        .map((item) => item.assignee)
                        .filter(Boolean)
                    )
                  ).map((assignee) => (
                    <MenuItem key={assignee} value={assignee}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{ width: 20, height: 20, fontSize: "0.7rem" }}
                        >
                          {assignee![0].toUpperCase()}
                        </Avatar>
                        <span>{assignee}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Fade>
      )}

      {/* Kanban Board */}
      {isLoading ? (
        <Box display="flex" gap={3} overflow="auto" pb={2}>
          {(currentColumns || []).map((_, index) => (
            <Box key={index} minWidth={300}>
              <Skeleton
                variant="rectangular"
                height={variant === "compact" ? 300 : 500}
                sx={{ borderRadius: 3 }}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          display="flex"
          gap={3}
          overflow="auto"
          pb={3}
          sx={{
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: alpha(theme.palette.grey[200], 0.5),
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.grey[400], 0.7),
              borderRadius: 4,
              "&:hover": {
                background: alpha(theme.palette.grey[500], 0.8),
              },
            },
          }}
        >
          {(currentColumns || []).map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={getColumnItems(column.id)}
              onItemClick={onItemClick}
              allowDragDrop={allowDragDrop}
              variant={variant}
              index={index}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
