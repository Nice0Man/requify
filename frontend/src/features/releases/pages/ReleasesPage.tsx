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
  Stack,
  Avatar,
  AvatarGroup,
  Fade,
  Container,
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
  Search,
  FilterList,
  Clear,
  Publish,
  Archive,
  Share,
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
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Releases
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage product releases, versions, and deployment schedules.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Releases">
              <IconButton
                onClick={loadReleases}
                disabled={loading}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: "rotate(180deg)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => {
                // Implementation for exporting releases
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              New Release
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={() => setError(null)}
              action={
                <Button color="inherit" size="small" onClick={loadReleases}>
                  Retry
                </Button>
              }
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => navigate("/dashboard")}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {stats.total}
                  </Typography>
                  <RocketLaunch color="primary" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Total Releases
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All versions
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {stats.planning}
                  </Typography>
                  <Schedule color="info" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Planned
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In planning phase
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {stats.in_progress}
                  </Typography>
                  <Timeline color="warning" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  In Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active development
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={700} color="secondary.main">
                    {stats.testing}
                  </Typography>
                  <BugReport color="secondary" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Testing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quality assurance
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {stats.released}
                  </Typography>
                  <Publish color="success" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Released
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live in production
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {stats.overdue}
                  </Typography>
                  <ErrorOutline color="error" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Overdue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Past due date
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <FilterList color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Filters
              </Typography>
              {(filters.search || filters.status.length > 0) && (
                <Button
                  size="small"
                  onClick={() => setFilters({
                    status: "",
                    search: "",
                    project_id: "",
                  })}
                  sx={{ textTransform: "none" }}
                >
                  Clear All
                </Button>
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search releases..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={ReleaseStatus.PLANNING}>Planned</MenuItem>
                  <MenuItem value={ReleaseStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={ReleaseStatus.TESTING}>Testing</MenuItem>
                  <MenuItem value={ReleaseStatus.READY}>Ready</MenuItem>
                  <MenuItem value={ReleaseStatus.RELEASED}>Released</MenuItem>
                  <MenuItem value={ReleaseStatus.CANCELLED}>Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Project ID"
                  value={filters.project_id}
                  onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                />
              </Grid>
            </Grid>
          </Stack>
        </Card>

        {/* Releases DataGrid */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={releases}
              columns={columns}
              paginationMode="server"
              rowCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              loading={loading}
              disableSelectionOnClick
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              sx={{
                border: "none",
                "& .MuiDataGrid-cell": {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: alpha(theme.palette.grey[50], 0.5),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
            />
          </Box>
        </Card>
      </Stack>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          "&:hover": {
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
        onClick={() => setCreateDialog(true)}
      >
        <Add />
      </Fab>

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
    </Container>
  );
};

export default ReleasesPage;
