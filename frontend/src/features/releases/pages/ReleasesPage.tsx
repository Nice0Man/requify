import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";
import {
  RocketLaunch,
  Add,
  Edit,
  Delete,
  Schedule,
  Launch,
  Timeline,
  Assignment,
  BugReport,
  Refresh,
  ExpandMore,
  GetApp,
  Visibility,
  PlayArrow,
  Pending,
  CheckCircleOutline,
  ErrorOutline,
  CalendarToday,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "@/features/auth/context/auth.context";
import { UserRole } from "@/features/auth/types/auth.types";
import {
  releasesApi,
  ReleaseListParams as ApiReleaseListParams,
  Release as ApiRelease,
  ReleaseStatus as ApiReleaseStatus,
  ReleaseCreate as ApiReleaseCreate,
  ReleaseUpdate as ApiReleaseUpdate,
} from "../api/releases.api";
import {
  Release,
  ReleaseStatus,
  ReleaseCreate,
  ReleaseType,
} from "../types/release.types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`releases-tabpanel-${index}`}
      aria-labelledby={`releases-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface ReleaseStats {
  total: number;
  planning: number;
  in_progress: number;
  testing: number;
  ready: number;
  released: number;
  cancelled: number;
  overdue: number;
}

// Convert API release to local release type
const convertApiReleaseToRelease = (apiRelease: ApiRelease): Release => {
  return {
    ...apiRelease,
    type: (apiRelease.type as ReleaseType) || ReleaseType.FEATURE,
    requirements: apiRelease.requirements || [],
    change_log: apiRelease.change_log || [],
    dependencies: apiRelease.dependencies || [],
    artifacts: apiRelease.artifacts || [],
    approvals: apiRelease.approvals || [],
    completion_percentage: apiRelease.completion_percentage || 0,
    project_name:
      apiRelease.project_name || `Project #${apiRelease.project_id}`,
    created_by_name: apiRelease.created_by_name || "Unknown",
    updated_by_name: apiRelease.updated_by_name || "Unknown",
    status: convertApiStatusToStatus(apiRelease.status),
  };
};
// Convert API status to local status
const convertApiStatusToStatus = (
  apiStatus: ApiReleaseStatus
): ReleaseStatus => {
  switch (apiStatus) {
    case ApiReleaseStatus.PLANNING:
      return ReleaseStatus.PLANNING;
    case ApiReleaseStatus.IN_PROGRESS:
      return ReleaseStatus.IN_PROGRESS;
    case ApiReleaseStatus.TESTING:
      return ReleaseStatus.TESTING;
    case ApiReleaseStatus.READY:
      return ReleaseStatus.READY;
    case ApiReleaseStatus.RELEASED:
      return ReleaseStatus.RELEASED;
    case ApiReleaseStatus.CANCELLED:
      return ReleaseStatus.CANCELLED;
    default:
      return ReleaseStatus.PLANNING;
  }
};

// Convert local status to API status
const convertStatusToApiStatus = (status: ReleaseStatus): ApiReleaseStatus => {
  switch (status) {
    case ReleaseStatus.PLANNING:
      return ApiReleaseStatus.PLANNING;
    case ReleaseStatus.IN_PROGRESS:
      return ApiReleaseStatus.IN_PROGRESS;
    case ReleaseStatus.TESTING:
      return ApiReleaseStatus.TESTING;
    case ReleaseStatus.READY:
      return ApiReleaseStatus.READY;
    case ReleaseStatus.RELEASED:
      return ApiReleaseStatus.RELEASED;
    case ReleaseStatus.CANCELLED:
      return ApiReleaseStatus.CANCELLED;
    default:
      return ApiReleaseStatus.PLANNING;
  }
};

const ReleasesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Check permissions
  const canWrite =
    hasAnyPermission(["releases:write", "project:write"]) ||
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.ADMIN;
  const canApprove =
    hasAnyPermission(["releases:approve"]) ||
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.ADMIN;

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReleaseStats>({
    total: 0,
    planning: 0,
    in_progress: 0,
    testing: 0,
    ready: 0,
    released: 0,
    cancelled: 0,
    overdue: 0,
  });

  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    project_id: "",
  });

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [releaseForm, setReleaseForm] = useState<Partial<ReleaseCreate>>({
    name: "",
    version: "",
    description: "",
    planned_date: "",
    project_id: undefined,
  });

  // Load data
  useEffect(() => {
    loadReleases();
  }, [page, pageSize, filters]);

  // Load releases
  const loadReleases = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ApiReleaseListParams = {
        skip: page * pageSize,
        limit: pageSize,
        status: filters.status
          ? convertStatusToApiStatus(filters.status as ReleaseStatus)
          : undefined,
        project_id: filters.project_id
          ? parseInt(filters.project_id)
          : undefined,
        sort_by: "planned_date",
        sort_order: "desc",
      };

      const response = await releasesApi.getReleases(params);
      const convertedReleases = (response.data.items || []).map(
        convertApiReleaseToRelease
      );
      setReleases(convertedReleases);
      setTotalCount(response.data.total || 0);

      // Calculate stats
      const releaseStats: ReleaseStats = {
        total: convertedReleases.length,
        planning: convertedReleases.filter(
          (r) => r.status === ReleaseStatus.PLANNING
        ).length,
        in_progress: convertedReleases.filter(
          (r) => r.status === ReleaseStatus.IN_PROGRESS
        ).length,
        testing: convertedReleases.filter(
          (r) => r.status === ReleaseStatus.TESTING
        ).length,
        ready: convertedReleases.filter((r) => r.status === ReleaseStatus.READY)
          .length,
        released: convertedReleases.filter(
          (r) => r.status === ReleaseStatus.RELEASED
        ).length,
        cancelled: convertedReleases.filter(
          (r) => r.status === ReleaseStatus.CANCELLED
        ).length,
        overdue: convertedReleases.filter((r) => {
          const plannedDate = new Date(r.planned_date || "");
          return (
            plannedDate < new Date() && r.status !== ReleaseStatus.RELEASED
          );
        }).length,
      };
      setStats(releaseStats);
    } catch (err: any) {
      console.error("Failed to load releases:", err);
      setError(err.message || "Failed to load releases");
      setReleases([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle create release
  const handleCreateRelease = async () => {
    try {
      if (!releaseForm.name || !releaseForm.version) {
        toast.error("Name and version are required");
        return;
      }

      const createData: ApiReleaseCreate = {
        name: releaseForm.name,
        version: releaseForm.version,
        description: releaseForm.description || "",
        planned_date: releaseForm.planned_date || "",
        project_id: releaseForm.project_id || 0,
      };

      await releasesApi.createRelease(createData);
      toast.success("Release created successfully");
      setCreateDialog(false);
      setReleaseForm({
        name: "",
        version: "",
        description: "",
        planned_date: "",
        project_id: undefined,
      });
      loadReleases();
    } catch (err: any) {
      toast.error("Failed to create release: " + err.message);
    }
  };

  // Handle edit release
  const handleEditRelease = async () => {
    try {
      if (!selectedRelease || !releaseForm.name || !releaseForm.version) {
        toast.error("Name and version are required");
        return;
      }

      const updateData: ApiReleaseUpdate = {
        name: releaseForm.name,
        version: releaseForm.version,
        description: releaseForm.description || "",
        planned_date: releaseForm.planned_date || "",
        requirements_ids: releaseForm.requirement_ids || [],
      };

      await releasesApi.updateRelease(selectedRelease.id, updateData);
      toast.success("Release updated successfully");
      setEditDialog(false);
      setSelectedRelease(null);
      loadReleases();
    } catch (err: any) {
      toast.error("Failed to update release: " + err.message);
    }
  };

  // Handle delete release
  const handleDeleteRelease = async (release: Release) => {
    if (window.confirm(`Are you sure you want to delete "${release.name}"?`)) {
      try {
        await releasesApi.deleteRelease(release.id);
        toast.success("Release deleted successfully");
        loadReleases();
      } catch (err: any) {
        toast.error("Failed to delete release: " + err.message);
      }
    }
  };

  // Get status color
  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
        return theme.palette.info.main;
      case ReleaseStatus.IN_PROGRESS:
        return theme.palette.warning.main;
      case ReleaseStatus.TESTING:
        return theme.palette.secondary.main;
      case ReleaseStatus.READY:
        return theme.palette.primary.main;
      case ReleaseStatus.RELEASED:
        return theme.palette.success.main;
      case ReleaseStatus.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
        return <Schedule />;
      case ReleaseStatus.IN_PROGRESS:
        return <PlayArrow />;
      case ReleaseStatus.TESTING:
        return <BugReport />;
      case ReleaseStatus.READY:
        return <CheckCircleOutline />;
      case ReleaseStatus.RELEASED:
        return <RocketLaunch />;
      case ReleaseStatus.CANCELLED:
        return <ErrorOutline />;
      default:
        return <Pending />;
    }
  };

  // Check if release is overdue
  const isOverdue = (release: Release) => {
    const plannedDate = new Date(release.planned_date || "");
    return (
      plannedDate < new Date() && release.status !== ReleaseStatus.RELEASED
    );
  };

  // Open edit dialog
  const openEditDialog = (release: Release) => {
    setSelectedRelease(release);
    setReleaseForm({
      name: release.name,
      version: release.version,
      description: release.description || "",
      planned_date: release.planned_date || "",
      project_id: release.project_id,
    });
    setEditDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Launch sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Release Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Plan, track, and manage software releases across all projects
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Release Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.info.main,
                0.1
              )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Schedule
                sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }}
              />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.info.main }}
              >
                {stats.planning}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Planning
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.warning.main,
                0.1
              )} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <PlayArrow
                sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }}
              />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.warning.main }}
              >
                {stats.in_progress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.secondary.main,
                0.1
              )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <BugReport
                sx={{
                  fontSize: 40,
                  color: theme.palette.secondary.main,
                  mb: 1,
                }}
              />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {stats.testing}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Testing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.success.main,
                0.1
              )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <RocketLaunch
                sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }}
              />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.success.main }}
              >
                {stats.released}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Released
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<Timeline />} label="Overview" />
          <Tab icon={<CalendarToday />} label="Timeline" />
          <Tab
            icon={
              <Badge badgeContent={stats.overdue} color="error">
                <Assignment />
              </Badge>
            }
            label="Planning"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}

      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            All Releases
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadReleases}
              disabled={loading}
            >
              Refresh
            </Button>
            {canWrite && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialog(true)}
              >
                New Release
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search releases..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value={ReleaseStatus.PLANNING}>Planning</MenuItem>
                <MenuItem value={ReleaseStatus.IN_PROGRESS}>
                  In Progress
                </MenuItem>
                <MenuItem value={ReleaseStatus.TESTING}>Testing</MenuItem>
                <MenuItem value={ReleaseStatus.READY}>Ready</MenuItem>
                <MenuItem value={ReleaseStatus.RELEASED}>Released</MenuItem>
                <MenuItem value={ReleaseStatus.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Project ID"
              value={filters.project_id}
              onChange={(e) =>
                setFilters({ ...filters, project_id: e.target.value })
              }
            />
          </Grid>
        </Grid>

        {/* Releases Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Release</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Planned Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : (
                releases.map((release) => (
                  <TableRow key={release.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {release.name} v{release.version}
                        </Typography>
                        {release.description && (
                          <Typography variant="body2" color="text.secondary">
                            {release.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(release.status)}
                        <Chip
                          label={release.status.replace("_", " ")}
                          size="small"
                          sx={{
                            backgroundColor: alpha(
                              getStatusColor(release.status),
                              0.1
                            ),
                            color: getStatusColor(release.status),
                            textTransform: "capitalize",
                          }}
                        />
                        {isOverdue(release) && (
                          <Chip
                            label="Overdue"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {release.project_name || `Project #${release.project_id}`}
                    </TableCell>
                    <TableCell>
                      {release.planned_date
                        ? new Date(release.planned_date).toLocaleDateString()
                        : "Not set"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: "100px" }}>
                        <LinearProgress
                          variant="determinate"
                          value={release.completion_percentage || 0}
                          sx={{
                            backgroundColor: alpha(
                              getStatusColor(release.status),
                              0.3
                            ),
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: getStatusColor(release.status),
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {release.completion_percentage || 0}% complete
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/releases/${release.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {canWrite && (
                        <>
                          <Tooltip title="Edit Release">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(release)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Release">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRelease(release)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Timeline Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Release Timeline
        </Typography>

        {releases.length === 0 ? (
          <Alert severity="info">No releases to display in timeline</Alert>
        ) : (
          <Box>
            {releases
              .sort(
                (a, b) =>
                  new Date(a.planned_date || "").getTime() -
                  new Date(b.planned_date || "").getTime()
              )
              .map((release, index) => (
                <Accordion key={release.id} defaultExpanded={index < 3}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      width="100%"
                    >
                      {getStatusIcon(release.status)}
                      <Box>
                        <Typography variant="h6">
                          {release.name} v{release.version}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {release.planned_date
                            ? `Planned: ${new Date(
                                release.planned_date
                              ).toLocaleDateString()}`
                            : "No date set"}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: "auto" }}>
                        <Chip
                          label={release.status.replace("_", " ")}
                          size="small"
                          sx={{
                            backgroundColor: alpha(
                              getStatusColor(release.status),
                              0.1
                            ),
                            color: getStatusColor(release.status),
                            textTransform: "capitalize",
                          }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Release Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {release.description || "No description provided"}
                        </Typography>
                        <Box display="flex" gap={2} mb={2}>
                          <Chip
                            label={`Project #${release.project_id}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${
                              release.completion_percentage || 0
                            }% Complete`}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Key Dates
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Typography variant="body2">
                            <strong>Created:</strong>{" "}
                            {new Date(release.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Last Updated:</strong>{" "}
                            {new Date(release.updated_at).toLocaleDateString()}
                          </Typography>
                          {release.planned_date && (
                            <Typography variant="body2">
                              <strong>Planned Release:</strong>{" "}
                              {new Date(
                                release.planned_date
                              ).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>
        )}
      </TabPanel>

      {/* Planning Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Release Planning & Management
        </Typography>

        {stats.overdue > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You have {stats.overdue} overdue release
            {stats.overdue > 1 ? "s" : ""} that need attention.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Planning Status */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Planning Status
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Ready for Release</Typography>
                    <Chip label={stats.ready} color="primary" size="small" />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">In Testing</Typography>
                    <Chip
                      label={stats.testing}
                      color="secondary"
                      size="small"
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">In Development</Typography>
                    <Chip
                      label={stats.in_progress}
                      color="warning"
                      size="small"
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Planning</Typography>
                    <Chip label={stats.planning} color="info" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Release Health */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Release Health
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">On Track</Typography>
                    <Chip
                      label={stats.total - stats.overdue}
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Overdue</Typography>
                    <Chip label={stats.overdue} color="error" size="small" />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Cancelled</Typography>
                    <Chip
                      label={stats.cancelled}
                      color="default"
                      size="small"
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Total Active</Typography>
                    <Chip
                      label={stats.total - stats.released - stats.cancelled}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setCreateDialog(true)}
                      fullWidth
                    >
                      New Release
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Timeline />}
                    onClick={() => setActiveTab(1)}
                    fullWidth
                  >
                    View Timeline
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    fullWidth
                  >
                    Release Reports
                  </Button>
                  <Button variant="outlined" startIcon={<GetApp />} fullWidth>
                    Export Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Create Release Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Release</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Release Name"
                value={releaseForm.name}
                onChange={(e) =>
                  setReleaseForm({ ...releaseForm, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Version"
                value={releaseForm.version}
                onChange={(e) =>
                  setReleaseForm({ ...releaseForm, version: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={releaseForm.description}
                onChange={(e) =>
                  setReleaseForm({
                    ...releaseForm,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planned Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={releaseForm.planned_date}
                onChange={(e) =>
                  setReleaseForm({
                    ...releaseForm,
                    planned_date: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project ID"
                type="number"
                value={releaseForm.project_id || ""}
                onChange={(e) =>
                  setReleaseForm({
                    ...releaseForm,
                    project_id: parseInt(e.target.value) || undefined,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRelease} variant="contained">
            Create Release
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Release Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Release</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Release Name"
                value={releaseForm.name}
                onChange={(e) =>
                  setReleaseForm({ ...releaseForm, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Version"
                value={releaseForm.version}
                onChange={(e) =>
                  setReleaseForm({ ...releaseForm, version: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={releaseForm.description}
                onChange={(e) =>
                  setReleaseForm({
                    ...releaseForm,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planned Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={releaseForm.planned_date}
                onChange={(e) =>
                  setReleaseForm({
                    ...releaseForm,
                    planned_date: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditRelease} variant="contained">
            Update Release
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReleasesPage;
