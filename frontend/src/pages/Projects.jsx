import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { fetchProjects, createProject, updateProject, deleteProject } from '../redux/slices/projectsSlice';

const ProjectForm = ({ open, handleClose, project, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    ...project
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="PLANNING">Planning</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {project ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { projects, loading } = useSelector((state) => state.projects);
  const [openForm, setOpenForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async (projectData) => {
    try {
      await dispatch(createProject(projectData)).unwrap();
      toast.success('Project created successfully');
      setOpenForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      await dispatch(updateProject(projectData)).unwrap();
      toast.success('Project updated successfully');
      setOpenForm(false);
      setSelectedProject(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await dispatch(deleteProject(id)).unwrap();
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Project Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        const statusColors = {
          PLANNING: 'info',
          IN_PROGRESS: 'primary',
          ON_HOLD: 'warning',
          COMPLETED: 'success',
          CANCELLED: 'error'
        };
        return (
          <Chip
            label={params.value.replace('_', ' ')}
            color={statusColors[params.value]}
            size="small"
          />
        );
      }
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 1,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/projects/${params.row.id}`)}
            color="primary"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedProject(params.row);
              setOpenForm(true);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteConfirm(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Create Project
        </Button>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={projects}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
            loading={loading}
          />
        </CardContent>
      </Card>

      <ProjectForm
        open={openForm}
        handleClose={() => {
          setOpenForm(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
      />

      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteProject(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects; 