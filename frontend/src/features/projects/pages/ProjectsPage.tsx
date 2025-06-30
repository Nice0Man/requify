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
  Switch,
  FormControlLabel,
  Avatar,
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
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FolderOpen as ProjectIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Assignment as RequirementsIcon,
  RocketLaunch as ReleasesIcon,
  Clear as ClearIcon,
  AttachMoney as BudgetIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, isAfter, parseISO, differenceInDays } from "date-fns";
import {
  Project,
  ProjectFilters,
  ProjectStatus,
} from "../types/projects.types";
import {
  projectsApi,
  ProjectListParams as ApiProjectListParams,
  Project as ApiProject,
  ProjectStatus as ApiProjectStatus,
} from "../api/projects.api";
import { useAuth } from "../../auth/context/auth.context";

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  // State
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortModel, setSortModel] = useState([
    { field: "updated_at", sort: "desc" as const },
  ]);

  // Filters
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    status: [],
    managerId: null,
    teamLeadId: null,
    clientId: null,
    tags: [],
    isPublic: null,
    dateRange: { start: null, end: null },
  });

  // Reference data
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

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

      const params: ApiProjectListParams = {
        skip: page * pageSize,
        limit: pageSize,
        sort_by: sortModel[0]?.field,
        sort_order: sortModel[0]?.sort,
        search: filters.search || undefined,
        status:
          filters.status.length === 1
            ? (filters.status[0] as ApiProjectStatus)
            : undefined,
        created_by: filters.managerId || undefined,
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
      managerId: null,
      teamLeadId: null,
      clientId: null,
      tags: [],
      isPublic: null,
      dateRange: { start: null, end: null },
    });
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      await projectsApi.deleteProject(id);
      setSnackbar({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRows.map((id) => projectsApi.deleteProject(id))
      );
      setSnackbar({
        open: true,
        message: `${selectedRows.length} projects deleted`,
        severity: "success",
      });
      setSelectedRows([]);
      loadProjects();
    } catch (error: any) {
      toast.error("Failed to delete projects");
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

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "completed":
        return "primary";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon />;
      case "inactive":
        return <ScheduleIcon />;
      case "completed":
        return <CheckCircleIcon />;
      case "archived":
        return <ArchiveIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  // Get project health indicator
  const getProjectHealth = (project: ApiProject) => {
    if (project.status === ApiProjectStatus.COMPLETED) return "success";
    if (project.status === ApiProjectStatus.CANCELLED) return "default";

    const now = new Date();
    if (project.end_date) {
      const endDate = parseISO(project.end_date);
      const daysLeft = differenceInDays(endDate, now);

      if (daysLeft < 0) return "error"; // Overdue
      if (daysLeft < 7) return "warning"; // Due soon
    }

    return "success"; // On track
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
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            color={getStatusColor(params.value)}
            icon={getStatusIcon(params.value)}
          />
        ),
      },
      {
        field: "created_by",
        headerName: "Created By",
        width: 150,
        valueGetter: (params) => params.row.created_by || "Unknown",
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.created_by || "Unknown"}
          </Typography>
        ),
      },
      {
        field: "health",
        headerName: "Health",
        width: 100,
        renderCell: (params) => {
          const health = getProjectHealth(params.row);
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    health === "success"
                      ? "success.main"
                      : health === "warning"
                      ? "warning.main"
                      : health === "error"
                      ? "error.main"
                      : "grey.400",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {health === "success"
                  ? "On Track"
                  : health === "warning"
                  ? "At Risk"
                  : health === "error"
                  ? "Overdue"
                  : "Unknown"}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "end_date",
        headerName: "Due Date",
        width: 120,
        valueFormatter: (params: GridValueFormatterParams) =>
          params.value ? format(parseISO(params.value), "MMM dd, yyyy") : "",
        renderCell: (params) => {
          if (!params.value) return null;
          const isOverdue = isAfter(new Date(), parseISO(params.value));
          const daysLeft = differenceInDays(parseISO(params.value), new Date());

          return (
            <Box>
              <Typography
                variant="body2"
                color={
                  isOverdue
                    ? "error"
                    : daysLeft < 7
                    ? "warning.main"
                    : "text.primary"
                }
                fontWeight={isOverdue ? 600 : 400}
              >
                {format(parseISO(params.value), "MMM dd, yyyy")}
              </Typography>
              {daysLeft >= 0 && daysLeft < 30 && (
                <Typography variant="caption" color="text.secondary">
                  {daysLeft} days left
                </Typography>
              )}
              {isOverdue && (
                <Typography variant="caption" color="error">
                  {Math.abs(daysLeft)} days overdue
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: "updated_at",
        headerName: "Updated",
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
            icon={<DeleteIcon />}
            label="Delete"
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
    if (filters.status.length > 0) count++;
    if (filters.managerId) count++;
    if (filters.teamLeadId) count++;
    if (filters.clientId) count++;
    if (filters.tags.length > 0) count++;
    if (filters.isPublic !== null) count++;
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
                        (p) => p.status === ApiProjectStatus.ACTIVE
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
                        (p) => p.status === ApiProjectStatus.COMPLETED
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
                    At Risk
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {
                      (projects || []).filter(
                        (p) =>
                          getProjectHealth(p) === "warning" ||
                          getProjectHealth(p) === "error"
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
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={Object.values(ApiProjectStatus)}
                value={filters.status}
                onChange={(_, value) => handleFilterChange("status", value)}
                renderInput={(params) => (
                  <TextField {...params} label="Status" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      size="small"
                      label={option.charAt(0).toUpperCase() + option.slice(1)}
                      color={getStatusColor(option)}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isPublic === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "isPublic",
                        e.target.checked ? true : null
                      )
                    }
                  />
                }
                label="Public Only"
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
                    <DeleteIcon />
                  </ListItemIcon>
                  <ListItemText>Delete Selected</ListItemText>
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
                <MenuItem
                  onClick={() => {
                    /* TODO: Bulk archive */
                  }}
                >
                  <ListItemIcon>
                    <ArchiveIcon />
                  </ListItemIcon>
                  <ListItemText>Archive Selected</ListItemText>
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
              Delete Project
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
                    color="error.main"
                  >
                    This action cannot be undone
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All associated requirements, releases, and project data will
                    be permanently deleted.
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Typography>
              Are you sure you want to delete this project?
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
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete Project
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
