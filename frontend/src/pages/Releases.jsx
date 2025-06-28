import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import {
  fetchReleases,
  createRelease,
  updateRelease,
  deleteRelease,
} from '../redux/slices/releasesSlice';

const ReleaseForm = ({ open, handleClose, release, onSubmit }) => {
  const [formData, setFormData] = useState({
    version: '',
    name: '',
    description: '',
    status: 'PLANNED',
    releaseDate: '',
    projectId: '',
  });

  useEffect(() => {
    if (release) {
      setFormData({
        version: release.version || '',
        name: release.name || '',
        description: release.description || '',
        status: release.status || 'PLANNED',
        releaseDate: release.releaseDate || '',
        projectId: release.projectId || '',
      });
    }
  }, [release]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {release ? 'Edit Release' : 'Create New Release'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                required
                placeholder="e.g., 1.0.0"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
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
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="PLANNED">Planned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="RELEASED">Released</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Release Date"
                name="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project ID"
                name="projectId"
                type="number"
                value={formData.projectId}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {release ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Releases = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { releases, loading } = useSelector((state) => state.releases);
  const [openForm, setOpenForm] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchReleases());
  }, [dispatch]);

  const handleCreateRelease = async (formData) => {
    try {
      await dispatch(createRelease(formData)).unwrap();
      toast.success('Release created successfully');
      setOpenForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create release');
    }
  };

  const handleUpdateRelease = async (formData) => {
    try {
      await dispatch(updateRelease({ ...selectedRelease, ...formData })).unwrap();
      toast.success('Release updated successfully');
      setOpenForm(false);
      setSelectedRelease(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update release');
    }
  };

  const handleDeleteRelease = async () => {
    try {
      await dispatch(deleteRelease(selectedRelease.id)).unwrap();
      toast.success('Release deleted successfully');
      setDeleteConfirm(false);
      setSelectedRelease(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete release');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RELEASED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'PLANNED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    { field: 'version', headerName: 'Version', width: 120 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'releaseDate',
      headerName: 'Release Date',
      width: 150,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      field: 'requirements',
      headerName: 'Requirements',
      width: 120,
      valueGetter: (params) => params.row.requirements.length,
    },
    {
      field: 'changes',
      headerName: 'Changes',
      width: 120,
      valueGetter: (params) => params.row.changes.length,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/releases/${params.row.id}`)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedRelease(params.row);
                setOpenForm(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedRelease(params.row);
                setDeleteConfirm(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading releases...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Releases
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              New Release
            </Button>
          </Box>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={releases}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
            />
          </div>
        </CardContent>
      </Card>

      <ReleaseForm
        open={openForm}
        handleClose={() => {
          setOpenForm(false);
          setSelectedRelease(null);
        }}
        release={selectedRelease}
        onSubmit={selectedRelease ? handleUpdateRelease : handleCreateRelease}
      />

      <Dialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete release "{selectedRelease?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteRelease} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Releases; 