import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  Paper,
  Fab,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Stack,
  Typography,
  Chip,
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
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  FolderOpen as ProjectIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Shared components and utilities
import { Page, SearchFilters, ConfirmDialog } from "@/shared/ui";
import { useTableState, useDialog } from "@/shared/hooks";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/shared/utils/formatters";

// Features and widgets
import { ProjectFilters } from "@/features/project-management/ui/ProjectFilters";
import { ProjectStats } from "@/widgets/project-stats";

// Types and API
import {
  Project,
  ProjectStatus,
  ProjectListParams,
} from "@/entities/project/model/projects.types";
import { projectsApi } from "@/entities/project";

interface ProjectFilters {
  status: ProjectStatus[];
  owner_id?: number;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Table state management
  const {
    page,
    pageSize,
    sortModel,
    search,
    showFilters,
    filters,
    activeFiltersCount,
    setPage,
    setPageSize,
    setSortModel,
    setSearch,
    setShowFilters,
    setFilter,
    clearFilters,
  } = useTableState<ProjectFilters>({
    initialFilters: {
      status: [],
      owner_id: undefined,
    },
  });

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // UI state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
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

  // Dialog management
  const deleteDialog = useDialog<number>({
    onConfirm: async (projectId) => {
      if (projectId) {
        await handleDelete(projectId);
      }
    },
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
        search: search || undefined,
        status:
          filters.status && filters.status.length === 1
            ? filters.status[0]
            : undefined,
        owner_id: filters.owner_id || undefined,
      };

      const response = await projectsApi.getProjects(params as any);
      const items = response.items || [];
      const total = response.total || 0;

      setProjects(items);
      setTotalCount(total);
    } catch (error: any) {
      console.error("Failed to load projects:", error);
      setError(error.message || "Failed to load projects");
      setProjects([]);
      setTotalCount(0);
      toast.error(error.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, search, filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Event handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilter(key as keyof ProjectFilters, value);
  };

  const handleDelete = async (id: number) => {
    try {
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
  };

  const handleBulkDelete = async () => {
    try {
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
      setSnackbar({
        open: true,
        message: "Export started. Download will begin shortly.",
        severity: "info",
      });
    } catch (error: any) {
      toast.error("Failed to export projects");
    }
  };

  const handleStatsCardClick = (status?: ProjectStatus) => {
    if (status) {
      setFilter("status", [status]);
    } else {
      clearFilters();
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
          formatDate(params.value),
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
            onClick={() => deleteDialog.open(params.id as number)}
          />,
        ],
      },
    ],
    [navigate, deleteDialog]
  );

  // Page actions
  const pageActions = (
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
  );

  return (
    <Page
      title="Projects"
      subtitle="Manage and track all your project requirements and deliverables."
      icon={<ProjectIcon />}
      actions={pageActions}
    >
      {/* Stats Cards */}
      <Box sx={{ mb: 3 }}>
        <ProjectStats
          projects={projects}
          loading={loading}
          onCardClick={handleStatsCardClick}
        />
      </Box>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={search}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
        onRefresh={loadProjects}
        searchPlaceholder="Search projects..."
        loading={loading}
      >
        <ProjectFilters filters={filters} onFilterChange={handleFilterChange} />
      </SearchFilters>

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
              </Menu>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadProjects}>
              Retry
            </Button>
          }
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={projects}
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
      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        title="Archive Project"
        message="The project will be hidden from the list but can be restored later by changing its status. Are you sure you want to archive this project?"
        confirmText="Archive Project"
        severity="warning"
        loading={deleteDialog.loading}
      />

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
    </Page>
  );
};

export default ProjectsPage;
