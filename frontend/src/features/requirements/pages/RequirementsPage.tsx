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
  Tooltip,
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
  Divider,
  Badge,
  LinearProgress,
  Autocomplete,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  AvatarGroup,
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
  Assignment as AssignmentIcon,
  BugReport as BugIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as HighPriorityIcon,
  Label as TagIcon,
  AccountTree as RelationIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, isAfter, parseISO } from 'date-fns';
import { 
  Requirement, 
  RequirementFilters, 
  RequirementListParams,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRiskLevel,
  RequirementComplexity
} from '../types/requirements.types';
import { requirementsApi } from '../api/requirements.api';
import { projectsApi } from '../../projects/api/projects.api';
import { referenceApi } from '@/shared/api/reference.api';
import { useAuth } from '../../auth/context/auth.context';

const RequirementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortModel, setSortModel] = useState([{ field: 'updated_at', sort: 'desc' as const }]);
  
  // Filters
  const [filters, setFilters] = useState<RequirementFilters>({
    search: '',
    projectId: null,
    statusIds: [],
    priorityIds: [],
    typeIds: [],
    assigneeIds: [],
    authorIds: [],
    riskLevels: [],
    complexities: [],
    tags: [],
    hasParent: null,
    isOverdue: null,
    dateRange: { start: null, end: null }
  });
  
  // Reference data
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState<RequirementType[]>([]);
  const [priorities, setPriorities] = useState<RequirementPriority[]>([]);
  const [statuses, setStatuses] = useState<RequirementStatus[]>([]);
  const [users, setUsers] = useState([]);
  
  // UI State
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [bulkActionsAnchor, setBulkActionsAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load data
  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const params: RequirementListParams = {
        skip: page * pageSize,
        limit: pageSize,
        sort_by: sortModel[0]?.field,
        sort_order: sortModel[0]?.sort,
        search: filters.search || undefined,
        project_id: filters.projectId || undefined,
        status_id: filters.statusIds.length === 1 ? filters.statusIds[0] : undefined,
        priority_id: filters.priorityIds.length === 1 ? filters.priorityIds[0] : undefined,
        type_id: filters.typeIds.length === 1 ? filters.typeIds[0] : undefined,
        assignee_id: filters.assigneeIds.length === 1 ? filters.assigneeIds[0] : undefined,
        author_id: filters.authorIds.length === 1 ? filters.authorIds[0] : undefined,
        risk_level: filters.riskLevels.length === 1 ? filters.riskLevels[0] : undefined,
        complexity: filters.complexities.length === 1 ? filters.complexities[0] : undefined,
        has_parent: filters.hasParent,
        is_overdue: filters.isOverdue,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
      };

      const response = await requirementsApi.getRequirements(params);
      setRequirements(response.data?.items || []);
      setTotalCount(response.data?.total || 0);
    } catch (error: any) {
      console.error('Failed to load requirements:', error);
      setRequirements([]); // Ensure array is never undefined
      setTotalCount(0);
      toast.error(error.message || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, filters]);

  const loadReferenceData = useCallback(async () => {
    try {
      const [projectsRes, typesRes, prioritiesRes, statusesRes] = await Promise.all([
        projectsApi.getProjects({ limit: 1000 }),
        referenceApi.getRequirementTypes(),
        referenceApi.getRequirementPriorities(),
        referenceApi.getRequirementStatuses(),
      ]);

      setProjects(projectsRes.data.items || []);
      setTypes(typesRes.data || []);
      setPriorities(prioritiesRes.data || []);
      setStatuses(statusesRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load reference data');
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  // Handlers
  const handleFilterChange = (key: keyof RequirementFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      projectId: null,
      statusIds: [],
      priorityIds: [],
      typeIds: [],
      assigneeIds: [],
      authorIds: [],
      riskLevels: [],
      complexities: [],
      tags: [],
      hasParent: null,
      isOverdue: null,
      dateRange: { start: null, end: null }
    });
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      await requirementsApi.deleteRequirement(id);
      setSnackbar({ open: true, message: 'Requirement deleted successfully', severity: 'success' });
      loadRequirements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete requirement');
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => requirementsApi.deleteRequirement(id)));
      setSnackbar({ open: true, message: `${selectedRows.length} requirements deleted`, severity: 'success' });
      setSelectedRows([]);
      loadRequirements();
    } catch (error: any) {
      toast.error('Failed to delete requirements');
    }
    setBulkActionsAnchor(null);
  };

  const handleExport = async () => {
    try {
      const params = {
        project_id: filters.projectId || undefined,
        status_ids: filters.statusIds.length > 0 ? filters.statusIds : undefined,
        priority_ids: filters.priorityIds.length > 0 ? filters.priorityIds : undefined,
        type_ids: filters.typeIds.length > 0 ? filters.typeIds : undefined,
        include_relationships: true,
        include_test_results: true,
        include_comments: false,
        format: 'excel' as const
      };
      
      await requirementsApi.exportRequirements(params);
      setSnackbar({ open: true, message: 'Export started. Download will begin shortly.', severity: 'info' });
    } catch (error: any) {
      toast.error('Failed to export requirements');
    }
  };

  // Risk level color mapping
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Priority level color mapping  
  const getPriorityColor = (priority: RequirementPriority) => {
    if (priority.level >= 90) return 'error';
    if (priority.level >= 70) return 'warning';
    if (priority.level >= 40) return 'info';
    return 'success';
  };

  // Column definitions
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      filterable: false,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.value}
          </Typography>
          {params.row.external_id && (
            <Typography variant="caption" color="text.secondary">
              {params.row.external_id}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'project',
      headerName: 'Project',
      width: 150,
      valueGetter: (params) => params.row.project?.name || '',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.project?.name}
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      valueGetter: (params) => params.row.type?.name || '',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.type?.name}
          style={{ backgroundColor: params.row.type?.color }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      valueGetter: (params) => params.row.priority?.name || '',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.priority?.name}
          color={getPriorityColor(params.row.priority)}
          icon={params.row.priority?.level >= 70 ? <HighPriorityIcon /> : undefined}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      valueGetter: (params) => params.row.status?.name || '',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.status?.name}
          style={{ backgroundColor: params.row.status?.color }}
          icon={params.row.status?.is_final ? <CheckCircleIcon /> : <ScheduleIcon />}
        />
      ),
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      width: 150,
      valueGetter: (params) => params.row.assignee ? `${params.row.assignee.first_name} ${params.row.assignee.last_name}` : 'Unassigned',
      renderCell: (params) => (
        params.row.assignee ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {params.row.assignee.first_name[0]}{params.row.assignee.last_name[0]}
            </Avatar>
            <Typography variant="body2" noWrap>
              {params.row.assignee.first_name} {params.row.assignee.last_name}
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
      field: 'risk_level',
      headerName: 'Risk',
      width: 100,
      renderCell: (params) => (
        params.value && (
          <Chip
            size="small"
            label={params.value.toUpperCase()}
            color={getRiskColor(params.value)}
          />
        )
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {params.value?.slice(0, 3).map((tag: string, index: number) => (
            <Chip
              key={index}
              size="small"
              label={tag}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          ))}
          {params.value?.length > 3 && (
            <Chip
              size="small"
              label={`+${params.value.length - 3}`}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
      width: 120,
      valueFormatter: (params) => params.value ? format(parseISO(params.value), 'MMM dd, yyyy') : '',
      renderCell: (params) => {
        if (!params.value) return null;
        const isOverdue = isAfter(new Date(), parseISO(params.value));
        return (
          <Typography
            variant="body2"
            color={isOverdue ? 'error' : 'text.primary'}
            fontWeight={isOverdue ? 600 : 400}
          >
            {format(parseISO(params.value), 'MMM dd, yyyy')}
          </Typography>
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
          onClick={() => navigate(`/requirements/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => navigate(`/requirements/${params.id}/edit`)}
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
    if (filters.projectId) count++;
    if (filters.statusIds.length > 0) count++;
    if (filters.priorityIds.length > 0) count++;
    if (filters.typeIds.length > 0) count++;
    if (filters.assigneeIds.length > 0) count++;
    if (filters.authorIds.length > 0) count++;
    if (filters.riskLevels.length > 0) count++;
    if (filters.complexities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.hasParent !== null) count++;
    if (filters.isOverdue !== null) count++;
    return count;
  }, [filters]);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Requirements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track project requirements
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/requirements/import')}
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
            onClick={() => navigate('/requirements/create')}
          >
            Create Requirement
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
                    Total Requirements
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {totalCount}
                  </Typography>
                </Box>
                <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
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
                    In Progress
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {requirements?.filter(r => r && r.status && !r.status.is_final).length || 0}
                  </Typography>
                </Box>
                <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
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
                    {requirements?.filter(r => r && r.status && r.status.is_final).length || 0}
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
                    High Risk
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {requirements?.filter(r => r && (r.risk_level === 'high' || r.risk_level === 'critical')).length || 0}
                  </Typography>
                </Box>
                <BugIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center" mb={showFilters ? 2 : 0}>
          <TextField
            placeholder="Search requirements..."
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
          
          <IconButton onClick={loadRequirements}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={filters.projectId || ''}
                  onChange={(e) => handleFilterChange('projectId', e.target.value || null)}
                  label="Project"
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((project: any) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={statuses}
                getOptionLabel={(option) => option.name}
                value={statuses.filter(s => filters.statusIds.includes(s.id))}
                onChange={(_, value) => handleFilterChange('statusIds', value.map(v => v.id))}
                renderInput={(params) => (
                  <TextField {...params} label="Status" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      size="small"
                      label={option.name}
                      style={{ backgroundColor: option.color }}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={priorities}
                getOptionLabel={(option) => option.name}
                value={priorities.filter(p => filters.priorityIds.includes(p.id))}
                onChange={(_, value) => handleFilterChange('priorityIds', value.map(v => v.id))}
                renderInput={(params) => (
                  <TextField {...params} label="Priority" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      size="small"
                      label={option.name}
                      color={getPriorityColor(option)}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={Object.values(RequirementRiskLevel)}
                value={filters.riskLevels}
                onChange={(_, value) => handleFilterChange('riskLevels', value)}
                renderInput={(params) => (
                  <TextField {...params} label="Risk Level" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      size="small"
                      label={option.toUpperCase()}
                      color={getRiskColor(option)}
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
                    checked={filters.isOverdue === true}
                    onChange={(e) => handleFilterChange('isOverdue', e.target.checked ? true : null)}
                  />
                }
                label="Overdue Only"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasParent === false}
                    onChange={(e) => handleFilterChange('hasParent', e.target.checked ? false : null)}
                  />
                }
                label="Top Level Only"
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
              {selectedRows.length} requirement(s) selected
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
                <MenuItem onClick={() => {/* TODO: Bulk assignment */}}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText>Assign To</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={requirements || []}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(newModel) => {
            setPage(newModel.page);
            setPageSize(newModel.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(newModel) => setSortModel(newModel as any)}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection as number[])}
          rowSelectionModel={selectedRows}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
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
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Requirement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this requirement? This action cannot be undone.
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
        onClick={() => navigate('/requirements/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default RequirementsPage; 