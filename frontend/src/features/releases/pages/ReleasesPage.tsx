import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  InputAdornment,
  Fab,
  Paper,
} from "@mui/material";
import {
  RocketLaunch,
  Add,
  Edit,
  Delete,
  Schedule,
  BugReport,
  Refresh,
  GetApp,
  Visibility,
  PlayArrow,
  Pending,
  CheckCircleOutline,
  ErrorOutline,
  CalendarToday,
  Search,
  FilterList,
  Publish,
  Sync,
  Description,
  Restore,
  MoreVert,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "@/features/auth/context/auth.context";
import {
  releasesApi,
  ReleaseListParams,
  Release,
  ReleaseStatus,
  ReleaseCreate,
  ReleaseUpdate,
} from "../api/releases.api";

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

const ReleasesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAnyPermission } = usePermissions();

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
    show_deleted: false,
  });

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [releaseForm, setReleaseForm] = useState<Partial<ReleaseCreate & { status?: string }>>({
    name: "",
    version: "",
    description: "",
    planned_date: "",
    project_id: undefined,
    status: "",
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

      const params: ReleaseListParams = {
        skip: page * pageSize,
        limit: pageSize,
        status: filters.status || undefined,
        project_id: filters.project_id
          ? parseInt(filters.project_id)
          : undefined,
        sort_by: "planned_date",
        sort_order: "desc",
      };

      const response = await releasesApi.getReleases(params);
      let fetchedReleases = response.data.items || [];
      
      // Filter based on deleted status
      if (!filters.show_deleted) {
        fetchedReleases = fetchedReleases.filter(
          (release) => release.status !== ReleaseStatus.DELETED
        );
      }

      // Apply search filter
      if (filters.search) {
        fetchedReleases = fetchedReleases.filter(
          (release) =>
            release.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            release.version.toLowerCase().includes(filters.search.toLowerCase()) ||
            (release.description?.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      setReleases(fetchedReleases);
      setTotalCount(fetchedReleases.length);

      // Calculate stats (exclude deleted releases from stats)
      const activeReleases = fetchedReleases.filter(
        (r) => r.status !== ReleaseStatus.DELETED
      );
      const releaseStats: ReleaseStats = {
        total: activeReleases.length,
        planning: activeReleases.filter(
          (r) =>
            r.status === ReleaseStatus.PLANNING ||
            r.status === ReleaseStatus.PLANNED
        ).length,
        in_progress: activeReleases.filter(
          (r) => r.status === ReleaseStatus.IN_PROGRESS
        ).length,
        testing: activeReleases.filter(
          (r) => r.status === ReleaseStatus.TESTING
        ).length,
        ready: activeReleases.filter((r) => r.status === ReleaseStatus.READY)
          .length,
        released: activeReleases.filter(
          (r) => r.status === ReleaseStatus.RELEASED
        ).length,
        cancelled: activeReleases.filter(
          (r) => r.status === ReleaseStatus.CANCELLED
        ).length,
        overdue: activeReleases.filter((r) => {
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

  // Handle create release
  const handleCreateRelease = async () => {
    try {
      if (!releaseForm.name || !releaseForm.version) {
        toast.error("Name and version are required");
        return;
      }

      const createData: ReleaseCreate = {
        name: releaseForm.name,
        version: releaseForm.version,
        description: releaseForm.description || "",
        planned_date: releaseForm.planned_date || "",
        project_id: releaseForm.project_id || 0,
        status: ReleaseStatus.PLANNED,
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
        status: "",
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

      const updateData: ReleaseUpdate = {
        name: releaseForm.name,
        version: releaseForm.version,
        description: releaseForm.description || "",
        planned_date: releaseForm.planned_date || "",
        status: releaseForm.status,
      };

      await releasesApi.updateRelease(selectedRelease.id, updateData);
      toast.success("Release updated successfully");
      setEditDialog(false);
      setSelectedRelease(null);
      setReleaseForm({
        name: "",
        version: "",
        description: "",
        planned_date: "",
        project_id: undefined,
        status: "",
      });
      loadReleases();
    } catch (err: any) {
      toast.error("Failed to update release: " + err.message);
    }
  };

  // Handle delete release (soft delete)
  const handleDeleteRelease = async (release: Release) => {
    if (window.confirm(`Are you sure you want to delete "${release.name}"? This will mark it as deleted but not permanently remove it.`)) {
      try {
        await releasesApi.deleteRelease(release.id);
        toast.success("Release marked as deleted successfully");
        loadReleases();
      } catch (err: any) {
        toast.error("Failed to delete release: " + err.message);
      }
    }
  };

  // Handle restore release
  const handleRestoreRelease = async (release: Release) => {
    if (window.confirm(`Are you sure you want to restore "${release.name}"?`)) {
      try {
        await releasesApi.restoreRelease(release.id, ReleaseStatus.DRAFT);
        toast.success("Release restored successfully");
        loadReleases();
      } catch (err: any) {
        toast.error("Failed to restore release: " + err.message);
      }
    }
  };

  // Handle publish release
  const handlePublishRelease = async (release: Release) => {
    if (window.confirm(`Are you sure you want to publish "${release.name}" v${release.version}?`)) {
      try {
        const publishData = {
          changelog: `Release ${release.version} published`,
          notification_recipients: [],
        };
        await releasesApi.publishRelease(release.id, publishData);
        toast.success("Release published successfully");
        loadReleases();
      } catch (err: any) {
        toast.error("Failed to publish release: " + err.message);
      }
    }
  };

  // Handle sync requirements
  const handleSyncRequirements = async (release: Release) => {
    try {
      const syncData = {
        project_id: release.project_id,
      };
      const response = await releasesApi.syncProjectRequirementsToRelease(release.id, syncData);
      toast.success(`Synced ${response.data.synced_requirements} requirements successfully`);
      loadReleases();
    } catch (err: any) {
      toast.error("Failed to sync requirements: " + err.message);
    }
  };

  // Handle generate specification
  const handleGenerateSpecification = async (release: Release) => {
    try {
      const specData = {
        format: "pdf" as const,
        language: "ru" as const,
        include_requirements: true,
        include_relationships: true,
        include_changelog: true,
        include_statistics: true,
        template_style: "standard" as const,
        auto_numbering: true,
      };
      const response = await releasesApi.generateReleaseSpecification(release.id, specData);
      toast.success("Specification generated successfully");
      // You could open the download URL here
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (err: any) {
      toast.error("Failed to generate specification: " + err.message);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
      case ReleaseStatus.PLANNED:
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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
      case ReleaseStatus.PLANNED:
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
      status: release.status,
    });
    setEditDialog(true);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, flexShrink: 0 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Releases
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage product releases, versions, and deployment schedules.
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Tooltip title="Refresh Releases">
              <span>
                <IconButton onClick={loadReleases} disabled={loading}>
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => {
                // Implementation for exporting releases
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/releases/create")}
            >
              New Release
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            action={
              <Button color="inherit" size="small" onClick={loadReleases}>
                Retry
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2">Total Releases</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" color="info.main">
                {stats.planning}
              </Typography>
              <Typography variant="body2">Planned</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" color="warning.main">
                {stats.in_progress}
              </Typography>
              <Typography variant="body2">In Progress</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" color="secondary.main">
                {stats.testing}
              </Typography>
              <Typography variant="body2">Testing</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" color="success.main">
                {stats.released}
              </Typography>
              <Typography variant="body2">Released</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" color="error.main">
                {stats.overdue}
              </Typography>
              <Typography variant="body2">Overdue</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FilterList color="primary" />
            <Typography variant="h6">Filters</Typography>
            {(filters.search || filters.status.length > 0) && (
              <Button
                size="small"
                onClick={() =>
                  setFilters({
                    status: "",
                    search: "",
                    project_id: "",
                    show_deleted: false,
                  })
                }
              >
                Clear All
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search releases..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value={ReleaseStatus.PLANNED}>Planned</MenuItem>
                <MenuItem value={ReleaseStatus.PLANNING}>Planning</MenuItem>
                <MenuItem value={ReleaseStatus.IN_PROGRESS}>
                  In Progress
                </MenuItem>
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
                onChange={(e) =>
                  setFilters({ ...filters, project_id: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Show Deleted"
                value={filters.show_deleted}
                onChange={(e) =>
                  setFilters({ ...filters, show_deleted: e.target.value === "true" })
                }
              >
                <MenuItem value="false">Hide Deleted</MenuItem>
                <MenuItem value="true">Show Deleted</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Releases Table */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ overflow: "auto", flex: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Planned Date</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : releases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        No releases found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  releases.map((release) => (
                    <TableRow key={release.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {release.name}
                          </Typography>
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
                        <Typography variant="body2" fontFamily="monospace">
                          {release.version}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(release.status)}
                          label={release.status.replace("_", " ")}
                          size="small"
                          sx={{
                            backgroundColor: alpha(
                              getStatusColor(release.status),
                              0.1
                            ),
                            color: getStatusColor(release.status),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            {release.planned_date
                              ? new Date(
                                  release.planned_date
                                ).toLocaleDateString()
                              : "Not set"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {release.project_id || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                navigate(`/releases/${release.id}`)
                              }
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {release.status !== ReleaseStatus.DELETED ? (
                            <>
                              <Tooltip title="Edit Release">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => openEditDialog(release)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {release.status === ReleaseStatus.READY && (
                                <Tooltip title="Publish Release">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handlePublishRelease(release)}
                                  >
                                    <Publish fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Sync Requirements">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleSyncRequirements(release)}
                                >
                                  <Sync fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Generate Specification">
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleGenerateSpecification(release)}
                                >
                                  <Description fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Release">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteRelease(release)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip title="Restore Release">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleRestoreRelease(release)}
                              >
                                <Restore fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => navigate("/releases/create")}
      >
        <Add />
      </Fab>

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
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={releaseForm.status}
                onChange={(e) =>
                  setReleaseForm({ ...releaseForm, status: e.target.value })
                }
              >
                <MenuItem value={ReleaseStatus.DRAFT}>Draft</MenuItem>
                <MenuItem value={ReleaseStatus.PLANNED}>Planned</MenuItem>
                <MenuItem value={ReleaseStatus.PLANNING}>Planning</MenuItem>
                <MenuItem value={ReleaseStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={ReleaseStatus.TESTING}>Testing</MenuItem>
                <MenuItem value={ReleaseStatus.READY}>Ready</MenuItem>
                <MenuItem value={ReleaseStatus.PUBLISHED}>Published</MenuItem>
                <MenuItem value={ReleaseStatus.RELEASED}>Released</MenuItem>
                <MenuItem value={ReleaseStatus.CANCELLED}>Cancelled</MenuItem>
              </TextField>
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
    </Box>
  );
};

export default ReleasesPage;
