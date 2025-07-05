import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
  useTheme,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  Badge,
  Tooltip,
  Paper,
  Fade,
  Grow,
  Collapse,
  ListItemButton,
  ListItemAvatar,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Button,
} from "@mui/material";
import {
  Assignment,
  Search,
  FilterList,
  Refresh,
  ChevronRight,
  PriorityHigh,
  CheckCircle,
  Schedule,
  Warning,
  ErrorOutline,
  Person,
  CalendarToday,
  Code,
  Visibility,
  Sort,
  GridView,
  ViewList,
  TrendingUp,
  AccessTime,
  FlagOutlined,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  BookmarkBorder,
  Comment,
  AttachFile,
  Share,
  MoreVert,
} from "@mui/icons-material";

// Using entities according to FSD
import { requirementsApi } from "@/entities/requirement";
import type { Requirement } from "@/entities/requirement/model/types";
import type { RequirementWithDetails } from "@/entities/requirement/model/types";

// Using shared utilities
import { formatDate } from "@/shared/utils";

// Local interfaces to avoid external dependencies
interface RequirementListProps {
  projectId?: number;
  limit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
  onRequirementClick?: (requirementId: number) => void;
  variant?: "card" | "list" | "compact";
  groupBy?: "status" | "priority" | "assignee" | "none";
  sortBy?: "created_at" | "updated_at" | "priority" | "title";
  sortOrder?: "asc" | "desc";
  showStats?: boolean;
  allowMultiSelect?: boolean;
}

// Extended requirement type with additional fields
interface ExtendedRequirement extends Requirement {
  // UI specific fields
  commentsCount: number;
  attachmentsCount: number;
  isBookmarked: boolean;
  completionPercentage: number;
  estimatedHours: number;
  actualHours: number;
  lastActivity: string;
  tags: string[];
  assigneeName?: string;
  // Override base types with string values for UI
  status: string;
  priority: string;
  author_name?: string;
  type?: string;
}

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

const getStatusColor = (
  status?: string
): "success" | "warning" | "error" | "info" | "default" => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return "success";
    case "draft":
      return "default";
    case "review":
    case "in_progress":
      return "warning";
    case "rejected":
    case "cancelled":
      return "error";
    default:
      return "info";
  }
};

const getStatusIcon = (status?: string) => {
  const iconStyle = { fontSize: 20 };

  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return <CheckCircle sx={{ ...iconStyle, color: "success.main" }} />;
    case "draft":
      return <Schedule sx={{ ...iconStyle, color: "text.secondary" }} />;
    case "review":
    case "in_progress":
      return <AccessTime sx={{ ...iconStyle, color: "warning.main" }} />;
    case "rejected":
    case "cancelled":
      return <ErrorOutline sx={{ ...iconStyle, color: "error.main" }} />;
    default:
      return (
        <RadioButtonUnchecked sx={{ ...iconStyle, color: "text.secondary" }} />
      );
  }
};

const getPriorityIcon = (priority?: string) => {
  const iconStyle = { fontSize: 16 };

  switch (priority?.toLowerCase()) {
    case "critical":
    case "high":
      return <FlagOutlined sx={{ ...iconStyle, color: "error.main" }} />;
    case "medium":
      return <FlagOutlined sx={{ ...iconStyle, color: "warning.main" }} />;
    case "low":
      return <FlagOutlined sx={{ ...iconStyle, color: "info.main" }} />;
    default:
      return <FlagOutlined sx={{ ...iconStyle, color: "text.disabled" }} />;
  }
};

interface RequirementCardProps {
  requirement: ExtendedRequirement;
  onClick?: () => void;
  variant?: "card" | "list" | "compact";
  index: number;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  onClick,
  variant = "list",
  index,
  selected = false,
  onSelect,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(e.target.checked);
    }
  };

  const isOverdue =
    requirement.deadline && new Date(requirement.deadline) < new Date();

  if (variant === "card") {
    return (
      <Grow in timeout={400 + index * 100}>
        <Card
          onClick={onClick}
          sx={{
            cursor: onClick ? "pointer" : "default",
            mb: 2,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            background: selected
              ? alpha(theme.palette.primary.main, 0.04)
              : theme.palette.background.paper,
            boxShadow: selected
              ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
              : `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": onClick
              ? {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 8px 32px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                  transform: "translateY(-2px)",
                }
              : {},
            "&:before":
              requirement.priority === "high" ||
              requirement.priority === "critical"
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
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {onSelect && (
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={handleSelect}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: theme.palette.primary.main,
                      cursor: "pointer",
                    }}
                  />
                )}
                {getStatusIcon(requirement.status)}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.4,
                      flex: 1,
                      pr: 1,
                    }}
                  >
                    {requirement.title}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Chip
                      label={requirement.priority}
                      size="small"
                      color={getPriorityColor(requirement.priority)}
                      icon={getPriorityIcon(requirement.priority)}
                      sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                    />
                    <Chip
                      label={requirement.status}
                      size="small"
                      color={getStatusColor(requirement.status)}
                      sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                    />
                  </Stack>
                </Stack>

                {requirement.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: expanded ? "none" : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                    }}
                  >
                    {requirement.description}
                  </Typography>
                )}

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Code sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {requirement.code}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarToday
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(requirement.created_at)}
                      </Typography>
                    </Stack>

                    {requirement.author_name && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Person
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {requirement.author_name}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    {requirement.commentsCount !== undefined &&
                      requirement.commentsCount > 0 && (
                        <Tooltip title="Comments">
                          <Badge
                            badgeContent={requirement.commentsCount}
                            color="primary"
                          >
                            <Comment
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                          </Badge>
                        </Tooltip>
                      )}

                    {requirement.attachmentsCount !== undefined &&
                      requirement.attachmentsCount > 0 && (
                        <Tooltip title="Attachments">
                          <Badge
                            badgeContent={requirement.attachmentsCount}
                            color="secondary"
                          >
                            <AttachFile
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                          </Badge>
                        </Tooltip>
                      )}

                    {requirement.isBookmarked && (
                      <Tooltip title="Bookmarked">
                        <BookmarkBorder
                          sx={{ fontSize: 16, color: "warning.main" }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grow>
    );
  }

  return (
    <Fade in timeout={300 + index * 50}>
      <ListItem
        onClick={onClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          borderRadius: 2,
          mb: 1,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: selected
            ? alpha(theme.palette.primary.main, 0.04)
            : theme.palette.background.paper,
          boxShadow: selected
            ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
            : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": onClick
            ? {
                backgroundColor: alpha(theme.palette.action.hover, 0.5),
                borderColor: theme.palette.primary.main,
                boxShadow: `0 4px 16px ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}`,
              }
            : {},
          px: 2,
          py: variant === "compact" ? 1 : 1.5,
        }}
      >
        <ListItemAvatar sx={{ minWidth: 48 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={handleSelect}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: theme.palette.primary.main,
                  cursor: "pointer",
                }}
              />
            )}
            {getStatusIcon(requirement.status)}
          </Stack>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography
                variant={variant === "compact" ? "body2" : "body1"}
                sx={{
                  fontWeight: 600,
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {requirement.title}
              </Typography>

              <Stack direction="row" spacing={0.5}>
                <Chip
                  label={requirement.priority}
                  size="small"
                  color={getPriorityColor(requirement.priority)}
                  icon={getPriorityIcon(requirement.priority)}
                  sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                />
                <Chip
                  label={requirement.status}
                  size="small"
                  color={getStatusColor(requirement.status)}
                  sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                />
              </Stack>
            </Stack>
          }
          secondary={
            <Stack spacing={0.5} mt={0.5}>
              {requirement.description && variant !== "compact" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: expanded ? "none" : 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                  }}
                >
                  {requirement.description}
                </Typography>
              )}

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="caption" color="text.secondary">
                    {requirement.code}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(requirement.created_at)}
                  </Typography>
                  {requirement.author_name && (
                    <Typography variant="caption" color="text.secondary">
                      by {requirement.author_name}
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  {requirement.commentsCount !== undefined &&
                    requirement.commentsCount > 0 && (
                      <Badge
                        badgeContent={requirement.commentsCount}
                        color="primary"
                      >
                        <Comment
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                      </Badge>
                    )}

                  {requirement.attachmentsCount !== undefined &&
                    requirement.attachmentsCount > 0 && (
                      <Badge
                        badgeContent={requirement.attachmentsCount}
                        color="secondary"
                      >
                        <AttachFile
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                      </Badge>
                    )}

                  {requirement.isBookmarked && (
                    <BookmarkBorder
                      sx={{ fontSize: 14, color: "warning.main" }}
                    />
                  )}
                </Stack>
              </Stack>
            </Stack>
          }
        />

        <Stack direction="row" alignItems="center" spacing={0.5}>
          {requirement.description && (
            <IconButton
              size="small"
              onClick={handleExpand}
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <ExpandMore sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          {onClick && (
            <ChevronRight sx={{ color: "text.secondary", opacity: 0.7 }} />
          )}
        </Stack>
      </ListItem>
    </Fade>
  );
};

export const RequirementList: React.FC<RequirementListProps> = ({
  projectId,
  limit = 10,
  showFilters = true,
  showPagination = true,
  className,
  onRequirementClick,
  variant = "list",
  groupBy = "none",
  sortBy = "created_at",
  sortOrder = "desc",
  showStats = true,
  allowMultiSelect = false,
}) => {
  const theme = useTheme();
  const [requirements, setRequirements] = useState<ExtendedRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequirements, setSelectedRequirements] = useState<number[]>(
    []
  );
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [currentVariant, setCurrentVariant] = useState(variant);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {};
      if (projectId) filters.project_id = projectId;
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await requirementsApi.getRequirements({
        ...filters,
        page,
        limit,
        sort_by: currentSortBy,
        sort_order: currentSortOrder,
      });

      // Enhance requirements with mock data
      const enhancedRequirements = (response.items || []).map(
        (req: RequirementWithDetails): ExtendedRequirement => ({
          ...req,
          commentsCount: Math.floor(Math.random() * 10),
          attachmentsCount: Math.floor(Math.random() * 5),
          isBookmarked: Math.random() > 0.7,
          completionPercentage: Math.floor(Math.random() * 100),
          estimatedHours: Math.floor(Math.random() * 40) + 1,
          actualHours: Math.floor(Math.random() * 50),
          lastActivity: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          assigneeName: req.assigned_to_user?.username,
          tags: ["tag1", "tag2"].slice(0, Math.floor(Math.random() * 3)),
          status: req.status?.name || "unknown",
          priority: req.priority?.name || "medium",
          author_name: req.created_by_user?.username,
          type: req.type?.name,
        })
      );

      setRequirements(enhancedRequirements);
      setTotalPages(Math.ceil((response.total || 0) / limit));
    } catch (err: any) {
      setError(err.message || "Failed to load requirements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [
    projectId,
    page,
    limit,
    statusFilter,
    priorityFilter,
    searchTerm,
    currentSortBy,
    currentSortOrder,
  ]);

  const handleRequirementClick = (requirement: ExtendedRequirement) => {
    if (onRequirementClick && requirement.id) {
      onRequirementClick(requirement.id);
    }
  };

  const handleRefresh = () => {
    loadRequirements();
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSortChange = (
    field: "created_at" | "updated_at" | "priority" | "title"
  ) => {
    if (currentSortBy === field) {
      setCurrentSortOrder(currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortBy(field);
      setCurrentSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(requirements.map((req) => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  const handleSelectRequirement = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedRequirements((prev: number[]) => [...prev, id]);
    } else {
      setSelectedRequirements((prev: number[]) =>
        prev.filter((selectedId) => selectedId !== id)
      );
    }
  };

  const getRequirementStats = (requirements: ExtendedRequirement[]) => {
    const total = requirements.length;
    const byStatus = requirements.reduce((acc: Record<string, number>, req) => {
      const status = req.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const byPriority = requirements.reduce(
      (acc: Record<string, number>, req) => {
        const priority = req.priority || "medium";
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      },
      {}
    );
    return { total, byStatus, byPriority };
  };

  const getGroupedRequirements = (
    requirements: ExtendedRequirement[],
    groupBy: string
  ) => {
    if (groupBy === "none") return { "All Requirements": requirements };

    return requirements.reduce(
      (acc: Record<string, ExtendedRequirement[]>, req) => {
        const key =
          groupBy === "status"
            ? req.status || "unknown"
            : groupBy === "priority"
            ? req.priority || "medium"
            : groupBy === "assignee"
            ? req.assigneeName || "Unassigned"
            : "Other";

        if (!acc[key]) acc[key] = [];
        acc[key].push(req);
        return acc;
      },
      {}
    );
  };

  const stats = getRequirementStats(requirements);

  const grouped = getGroupedRequirements(requirements, groupBy);

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
      <Fade in timeout={400}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.info.main,
              0.02
            )}, ${alpha(theme.palette.primary.main, 0.02)})`,
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
                  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.info.main,
                    0.3
                  )}`,
                }}
              >
                <Assignment />
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Requirements
                </Typography>
                {showStats && (
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
                      label={`${stats.byStatus.approved || 0} approved`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                    <Chip
                      icon={<AccessTime sx={{ fontSize: 16 }} />}
                      label={`${stats.byStatus.review || 0} in review`}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  </Stack>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <ToggleButtonGroup
                value={currentVariant}
                exclusive
                onChange={(_, value) => value && setCurrentVariant(value)}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="card">
                  <GridView />
                </ToggleButton>
              </ToggleButtonGroup>

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
        <Fade in timeout={600}>
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
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="review">In Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

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

                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => handleSortChange("created_at")}
                    startIcon={<CalendarToday />}
                    color={
                      currentSortBy === "created_at" ? "primary" : "inherit"
                    }
                  >
                    Date
                  </Button>
                  <Button
                    onClick={() => handleSortChange("priority")}
                    startIcon={<PriorityHigh />}
                    color={currentSortBy === "priority" ? "primary" : "inherit"}
                  >
                    Priority
                  </Button>
                  <Button
                    onClick={() => handleSortChange("title")}
                    startIcon={<Sort />}
                    color={currentSortBy === "title" ? "primary" : "inherit"}
                  >
                    Title
                  </Button>
                </ButtonGroup>
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      )}

      {/* Multi-select Actions */}
      {allowMultiSelect && selectedRequirements.length > 0 && (
        <Fade in>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              background: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedRequirements.length} requirements selected
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Share />}>
                  Export
                </Button>
                <Button size="small" startIcon={<BookmarkBorder />}>
                  Bookmark
                </Button>
                <Button size="small" color="error" startIcon={<ErrorOutline />}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      )}

      {/* Content */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            background: theme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box sx={{ p: 3 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Skeleton
                        variant="rectangular"
                        width={60}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={60}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                    </Stack>
                  </Stack>
                ))}
              </Box>
            ) : requirements.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  px: 3,
                  color: "text.secondary",
                }}
              >
                <Assignment sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No requirements found
                </Typography>
                <Typography variant="body2">
                  {searchTerm || statusFilter || priorityFilter
                    ? "Try adjusting your filters to see more results"
                    : "Create your first requirement to get started"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 3 }}>
                {Object.entries(grouped).map(
                  ([groupName, groupRequirements]) => (
                    <Box key={groupName}>
                      {groupBy !== "none" && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            mb: 2,
                            mt: groupName !== Object.keys(grouped)[0] ? 3 : 0,
                            color: "text.secondary",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          {groupName} ({groupRequirements.length})
                        </Typography>
                      )}

                      {currentVariant === "card" ? (
                        <Stack spacing={2}>
                          {groupRequirements.map((requirement, index) => (
                            <RequirementCard
                              key={requirement.id}
                              requirement={requirement}
                              onClick={() =>
                                handleRequirementClick(requirement)
                              }
                              variant={currentVariant}
                              index={index}
                              selected={selectedRequirements.includes(
                                requirement.id
                              )}
                              onSelect={
                                allowMultiSelect
                                  ? (selected) =>
                                      handleSelectRequirement(
                                        requirement.id,
                                        selected
                                      )
                                  : undefined
                              }
                            />
                          ))}
                        </Stack>
                      ) : (
                        <List sx={{ py: 0 }}>
                          {groupRequirements.map((requirement, index) => (
                            <RequirementCard
                              key={requirement.id}
                              requirement={requirement}
                              onClick={() =>
                                handleRequirementClick(requirement)
                              }
                              variant={currentVariant}
                              index={index}
                              selected={selectedRequirements.includes(
                                requirement.id
                              )}
                              onSelect={
                                allowMultiSelect
                                  ? (selected) =>
                                      handleSelectRequirement(
                                        requirement.id,
                                        selected
                                      )
                                  : undefined
                              }
                            />
                          ))}
                        </List>
                      )}
                    </Box>
                  )
                )}
              </Box>
            )}

            {showPagination && totalPages > 1 && (
              <Box
                sx={{ display: "flex", justifyContent: "center", p: 3, pt: 0 }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Paper>
      </Fade>
    </Box>
  );
};
