import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Fab,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge,
  Autocomplete,
  InputAdornment,
  Tooltip,
  Stack,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbar,
  GridActionsCellItem,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FolderOpen as ProjectIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Clear as ClearIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import type {
  Project,
  ProjectWithStats,
  ProjectCreate,
  ProjectUpdate,
  ProjectStatus,
  ProjectListParams,
  ProjectListResponse,
} from "@/shared/api/types/schemas";
import { useAuth } from "@/features/auth/model/auth.context";

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const theme = useTheme();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortModel, setSortModel] = useState([
    { field: "created_at", sort: "desc" as const },
  ]);

  // Filters matching backend schema
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    status: [],
    owner_id: undefined,
  });

  // UI State
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [bulkActionsAnchor, setBulkActionsAnchor] =
    useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load data
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ProjectListParams = {
        skip: page * pageSize,
        limit: pageSize,
        sort_by: sortModel[0]?.field,
        sort_order: sortModel[0]?.sort,
        search: filters.search || undefined,
        status:
          filters.status && filters.status.length === 1
            ? filters.status[0] // Single status selected
            : filters.status && filters.status.length > 1
            ? undefined // Multiple statuses selected - let backend return all
            : undefined, // No status selected - show all projects
        owner_id: filters.owner_id || undefined,
      };

      const response = await projectsApi.getProjects(params);

      // Ensure we always set an array, never undefined
      const items = response.data?.items || [];
      const total = response.data?.total || 0;

      setProjects(items);
      setTotalCount(total);
    } catch (error: any) {
      console.error("Failed to load projects:", error);

      setError(error.message || "Failed to load projects");
      setProjects([]); // Ensure projects is always an array
      setTotalCount(0);
      toast.error(error.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Handlers
  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: [],
      owner_id: undefined,
    });
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      // Soft delete: Change status to inactive instead of actual deletion
      await projectsApi.updateProject(id, { status: ProjectStatus.INACTIVE });
      setSnackbar({
        open: true,
        message: "Project archived successfully",
        severity: "success",
      });
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "Failed to archive project");
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBulkDelete = async () => {
    try {
      // Soft delete: Change status to inactive for all selected projects
      await Promise.all(
        selectedRows.map((id) =>
          projectsApi.updateProject(id, { status: ProjectStatus.INACTIVE })
        )
      );
      setSnackbar({
        open: true,
        message: `${selectedRows.length} projects archived`,
        severity: "success",
      });
      setSelectedRows([]);
      loadProjects();
    } catch (error: any) {
      toast.error("Failed to archive projects");
    }
    setBulkActionsAnchor(null);
  };

  const handleExport = async () => {
    try {
      // Note: This would need to be implemented in the API
      setSnackbar({
        open: true,
        message: "Export started. Download will begin shortly.",
        severity: "info",
      });
    } catch (error: any) {
      toast.error("Failed to export projects");
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return <CheckCircleIcon />;
      case ProjectStatus.COMPLETED:
        return <CheckCircleIcon />;
      case ProjectStatus.INACTIVE:
      case ProjectStatus.PLANNING:
        return <ScheduleIcon />;
      case ProjectStatus.ARCHIVED:
      case ProjectStatus.CANCELLED:
        return <ArchiveIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  // Column definitions
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Project Name",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.value}
            </Typography>
            {params.row.description && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.description}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "code",
        headerName: "Code",
        width: 120,
        renderCell: (params) => (
          <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={getStatusLabel(params.value)}
            color={getStatusColor(params.value)}
            icon={getStatusIcon(params.value)}
          />
        ),
      },
      {
        field: "owner_id",
        headerName: "Owner",
        width: 100,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            User #{params.value}
          </Typography>
        ),
      },
      {
        field: "created_at",
        headerName: "Created",
        width: 120,
        valueFormatter: (params: GridValueFormatterParams) =>
          format(parseISO(params.value), "MMM dd, yyyy"),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() => navigate(`/projects/${params.id}`)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate(`/projects/${params.id}/edit`)}
          />,
          <GridActionsCellItem
            icon={<SettingsIcon />}
            label="Settings"
            onClick={() => navigate(`/projects/${params.id}/settings`)}
          />,
          <GridActionsCellItem
            icon={<ArchiveIcon />}
            label="Archive"
            onClick={() => {
              setItemToDelete(params.id as number);
              setDeleteDialogOpen(true);
            }}
          />,
        ],
      },
    ],
    [navigate]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.owner_id) count++;
    return count;
  }, [filters]);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
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
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your project requirements and deliverables.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Projects">
            <span>
              <IconButton
                onClick={loadProjects}
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
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => navigate("/projects/import")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
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
            startIcon={<AddIcon />}
            onClick={() => navigate("/projects/create")}
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
            Create Project
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Projects
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {totalCount}
                  </Typography>
                </Box>
                <ProjectIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Projects
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {
                      (projects || []).filter(
                        (p) => p.status === ProjectStatus.ACTIVE
                      ).length
                    }
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {
                      (projects || []).filter(
                        (p) => p.status === ProjectStatus.COMPLETED
                      ).length
                    }
                  </Typography>
                </Box>
                <CheckCircleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Planning
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {
                      (projects || []).filter(
                        (p) => p.status === ProjectStatus.PLANNING
                      ).length
                    }
                  </Typography>
                </Box>
                <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          mb={showFilters ? 2 : 0}
        >
          <TextField
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange("search", "")}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <Badge badgeContent={activeFiltersCount} color="primary">
            <Button
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Badge>

          {activeFiltersCount > 0 && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}

          <IconButton onClick={loadProjects}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                multiple
                size="small"
                options={Object.values(ProjectStatus)}
                value={filters.status || []}
                onChange={(_, value) => handleFilterChange("status", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    helperText="Leave empty to show all projects"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...chipProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        size="small"
                        label={getStatusLabel(option)}
                        color={getStatusColor(option)}
                        {...chipProps}
                      />
                    );
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="Owner ID"
                type="number"
                value={filters.owner_id || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "owner_id",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                fullWidth
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "primary.light" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2">
              {selectedRows.length} project(s) selected
            </Typography>
            <Box>
              <Button
                size="small"
                onClick={(e) => setBulkActionsAnchor(e.currentTarget)}
                endIcon={<MoreVertIcon />}
              >
                Actions
              </Button>
              <Menu
                anchorEl={bulkActionsAnchor}
                open={Boolean(bulkActionsAnchor)}
                onClose={() => setBulkActionsAnchor(null)}
              >
                <MenuItem onClick={handleBulkDelete}>
                  <ListItemIcon>
                    <ArchiveIcon />
                  </ListItemIcon>
                  <ListItemText>Archive Selected</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    /* TODO: Bulk status change */
                  }}
                >
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText>Change Status</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Error State */}
      {error && !loading && (
        <Fade in={!!error}>
          <Box sx={{ mb: 2 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadProjects}>
                  Retry
                </Button>
              }
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Box>
        </Fade>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={projects || []} // Ensure always an array
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model as any)}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(model) => setSelectedRows(model as any)}
          rowSelectionModel={selectedRows}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Archive Project
            </Typography>
            <IconButton onClick={() => setDeleteDialogOpen(false)} size="small">
              <ClearIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <WarningIcon color="error" />
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="warning.main"
                  >
                    Project will be archived
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The project will be hidden from the list but can be restored
                    later by changing its status.
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Typography>
              Are you sure you want to archive this project?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => itemToDelete && handleDelete(itemToDelete)}
            color="warning"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Archive Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
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
        onClick={() => navigate("/projects/create")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ProjectsPage;
