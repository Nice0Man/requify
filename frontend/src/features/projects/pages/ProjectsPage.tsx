import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
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
  CircularProgress,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
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
  Cancel as CancelIcon,
  Archive as ArchiveIcon,
  Assignment as RequirementsIcon,
  RocketLaunch as ReleasesIcon,
  Clear as ClearIcon,
  PersonAdd as InviteIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  AttachMoney as BudgetIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, isAfter, parseISO, differenceInDays } from 'date-fns';
import { 
  Project, 
  ProjectFilters, 
  ProjectListParams,
  ProjectStatus,
  ProjectMemberRole
} from '../types/projects.types';
import { projectsApi } from '../api/projects.api';
import { useAuth } from '../../auth/context/auth.context';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortModel, setSortModel] = useState([{ field: 'updated_at', sort: 'desc' as const }]);
  
  // Filters
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: [],
    managerId: null,
    teamLeadId: null,
    clientId: null,
    tags: [],
    isPublic: null,
    dateRange: { start: null, end: null }
  });
  
  // Reference data
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  
  // UI State
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [bulkActionsAnchor, setBulkActionsAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
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
        status: filters.status.length === 1 ? filters.status[0] : undefined,
        manager_id: filters.managerId || undefined,
        team_lead_id: filters.teamLeadId || undefined,
        client_id: filters.clientId || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        is_public: filters.isPublic,
      };

      const response = await projectsApi.getProjects(params);
      
      // Ensure we always set an array, never undefined
      const items = response.data?.items || [];
      const total = response.data?.total || 0;
      
      setProjects(items);
      setTotalCount(total);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      setError(error.message || 'Failed to load projects');
      setProjects([]); // Ensure projects is always an array
      setTotalCount(0);
      toast.error(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Handlers
  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: [],
      managerId: null,
      teamLeadId: null,
      clientId: null,
      tags: [],
      isPublic: null,
      dateRange: { start: null, end: null }
    });
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      await projectsApi.deleteProject(id);
      setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => projectsApi.deleteProject(id)));
      setSnackbar({ open: true, message: `${selectedRows.length} projects deleted`, severity: 'success' });
      setSelectedRows([]);
      loadProjects();
    } catch (error: any) {
      toast.error('Failed to delete projects');
    }
    setBulkActionsAnchor(null);
  };

  const handleExport = async () => {
    try {
      // Note: This would need to be implemented in the API
      setSnackbar({ open: true, message: 'Export started. Download will begin shortly.', severity: 'info' });
    } catch (error: any) {
      toast.error('Failed to export projects');
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'completed': return 'primary';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'inactive': return <ScheduleIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'archived': return <ArchiveIcon />;
      default: return <ScheduleIcon />;
    }
  };

  // Get project health indicator
  const getProjectHealth = (project: Project) => {
    if (project.status === 'completed') return 'success';
    if (project.status === 'archived') return 'default';
    
    const now = new Date();
    if (project.end_date) {
      const endDate = parseISO(project.end_date);
      const daysLeft = differenceInDays(endDate, now);
      
      if (daysLeft < 0) return 'error'; // Overdue
      if (daysLeft < 7) return 'warning'; // Due soon
    }
    
    return 'success'; // On track
  };

  // Column definitions
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'code',
      headerName: 'Code',
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Project Name',
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
      field: 'status',
      headerName: 'Status',
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
      field: 'manager',
      headerName: 'Manager',
      width: 150,
      valueGetter: (params) => params.row.manager ? `${params.row.manager.first_name} ${params.row.manager.last_name}` : 'Unassigned',
      renderCell: (params) => (
        params.row.manager ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {params.row.manager.first_name[0]}{params.row.manager.last_name[0]}
            </Avatar>
            <Typography variant="body2" noWrap>
              {params.row.manager.first_name} {params.row.manager.last_name}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Unassigned
          </Typography>
        )
      ),
    },
    {
      field: 'team_lead',
      headerName: 'Team Lead',
      width: 150,
      valueGetter: (params) => params.row.team_lead ? `${params.row.team_lead.first_name} ${params.row.team_lead.last_name}` : 'Unassigned',
      renderCell: (params) => (
        params.row.team_lead ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {params.row.team_lead.first_name[0]}{params.row.team_lead.last_name[0]}
            </Avatar>
            <Typography variant="body2" noWrap>
              {params.row.team_lead.first_name} {params.row.team_lead.last_name}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Unassigned
          </Typography>
        )
      ),
    },
    {
      field: 'client',
      headerName: 'Client',
      width: 150,
      valueGetter: (params) => params.row.client?.name || 'Internal',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.client?.name || 'Internal'}
          variant="outlined"
          color={params.row.client ? 'secondary' : 'default'}
          icon={<BusinessIcon />}
        />
      ),
    },
    {
      field: 'members_count',
      headerName: 'Team',
      width: 100,
      valueGetter: (params) => params.row.members?.length || 0,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.row.members?.length || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'requirements_count',
      headerName: 'Requirements',
      width: 120,
      valueGetter: (params) => params.row.requirements?.length || 0,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <RequirementsIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.row.requirements?.length || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'releases_count',
      headerName: 'Releases',
      width: 100,
      valueGetter: (params) => params.row.releases?.length || 0,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <ReleasesIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.row.releases?.length || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'health',
      headerName: 'Health',
      width: 100,
      renderCell: (params) => {
        const health = getProjectHealth(params.row);
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 
                  health === 'success' ? 'success.main' :
                  health === 'warning' ? 'warning.main' :
                  health === 'error' ? 'error.main' : 'grey.400'
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {health === 'success' ? 'On Track' :
               health === 'warning' ? 'At Risk' :
               health === 'error' ? 'Overdue' : 'Unknown'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: params.row.currency || 'USD'
        }).format(params.value);
      },
      renderCell: (params) => (
        params.value ? (
          <Box display="flex" alignItems="center" gap={1}>
            <BudgetIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: params.row.currency || 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(params.value)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            N/A
          </Typography>
        )
      ),
    },
    {
      field: 'end_date',
      headerName: 'Due Date',
      width: 120,
      valueFormatter: (params) => params.value ? format(parseISO(params.value), 'MMM dd, yyyy') : '',
      renderCell: (params) => {
        if (!params.value) return null;
        const isOverdue = isAfter(new Date(), parseISO(params.value));
        const daysLeft = differenceInDays(parseISO(params.value), new Date());
        
        return (
          <Box>
            <Typography
              variant="body2"
              color={isOverdue ? 'error' : daysLeft < 7 ? 'warning.main' : 'text.primary'}
              fontWeight={isOverdue ? 600 : 400}
            >
              {format(parseISO(params.value), 'MMM dd, yyyy')}
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
      field: 'updated_at',
      headerName: 'Updated',
      width: 120,
      valueFormatter: (params) => format(parseISO(params.value), 'MMM dd, yyyy'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
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
  ], [navigate]);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and oversee project portfolio
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/projects/import')}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/create')}
          >
            Create Project
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
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
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Projects
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {(projects || []).filter(p => p.status === 'active').length}
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
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {(projects || []).filter(p => p.status === 'completed').length}
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
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    At Risk
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {(projects || []).filter(p => getProjectHealth(p) === 'warning' || getProjectHealth(p) === 'error').length}
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
        <Box display="flex" gap={2} alignItems="center" mb={showFilters ? 2 : 0}>
          <TextField
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <Badge badgeContent={activeFiltersCount} color="primary">
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
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
                options={Object.values(ProjectStatus)}
                value={filters.status}
                onChange={(_, value) => handleFilterChange('status', value)}
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
                    onChange={(e) => handleFilterChange('isPublic', e.target.checked ? true : null)}
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
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
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
                <MenuItem onClick={() => {/* TODO: Bulk status change */}}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText>Change Status</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {/* TODO: Bulk archive */}}>
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
        <Paper sx={{ p: 3, mb: 2 }}>
          <Alert severity="error" action={
            <Button size="small" onClick={loadProjects}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Paper>
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
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          checkboxSelection
          disableSelectionOnClick
          onSelectionModelChange={setSelectedRows}
          selectionModel={selectedRows}
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          // Add error handling for empty state
          noRowsOverlay={() => (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              p={3}
            >
              <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {error ? 'Failed to load projects' : loading ? 'Loading projects...' : 'No projects found'}
              </Typography>
              {!loading && !error && (
                <Typography variant="body2" color="text.secondary" align="center">
                  {filters.search || activeFiltersCount > 0 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first project.'
                  }
                </Typography>
              )}
              {!loading && !error && !filters.search && activeFiltersCount === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/projects/create')}
                  sx={{ mt: 2 }}
                >
                  Create Project
                </Button>
              )}
            </Box>
          )}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This will also delete all associated requirements, releases, and data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => itemToDelete && handleDelete(itemToDelete)} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/projects/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ProjectsPage; 