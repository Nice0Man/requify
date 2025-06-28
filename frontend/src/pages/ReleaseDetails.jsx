import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  BugReport as BugIcon,
  Build as BuildIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  fetchReleaseById,
  updateRelease,
  deleteRelease,
} from '../redux/slices/releasesSlice';

const ChangeForm = ({ open, handleClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'FEATURE',
    description: '',
    requirementId: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      type: 'FEATURE',
      description: '',
      requirementId: '',
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Change</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <MenuItem value="FEATURE">Feature</MenuItem>
                <MenuItem value="FIX">Bug Fix</MenuItem>
                <MenuItem value="IMPROVEMENT">Improvement</MenuItem>
                <MenuItem value="SECURITY">Security Update</MenuItem>
              </TextField>
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
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirement ID"
                name="requirementId"
                type="number"
                value={formData.requirementId}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ReleaseDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentRelease: release, loading } = useSelector((state) => state.releases);
  const [openForm, setOpenForm] = useState(false);
  const [openChangeForm, setOpenChangeForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    dispatch(fetchReleaseById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (release) {
      setFormData({
        version: release.version,
        name: release.name,
        description: release.description,
        status: release.status,
        releaseDate: release.releaseDate,
        projectId: release.projectId,
      });
    }
  }, [release]);

  const handleUpdateRelease = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateRelease({ ...release, ...formData })).unwrap();
      toast.success('Release updated successfully');
      setOpenForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update release');
    }
  };

  const handleDeleteRelease = async () => {
    try {
      await dispatch(deleteRelease(id)).unwrap();
      toast.success('Release deleted successfully');
      navigate('/releases');
    } catch (error) {
      toast.error(error.message || 'Failed to delete release');
    }
  };

  const handleAddChange = (changeData) => {
    const newChanges = [...release.changes, { id: Date.now(), ...changeData }];
    dispatch(updateRelease({ ...release, changes: newChanges }));
    setOpenChangeForm(false);
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

  const getChangeIcon = (type) => {
    switch (type) {
      case 'FEATURE':
        return <StarIcon color="primary" />;
      case 'FIX':
        return <BugIcon color="error" />;
      case 'IMPROVEMENT':
        return <BuildIcon color="info" />;
      default:
        return <StarIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading release details...</Typography>
      </Box>
    );
  }

  if (!release) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Release not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/releases')}
        sx={{ mb: 2 }}
      >
        Back to Releases
      </Button>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" component="h2">
                {release.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Version {release.version}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Edit Release">
                <IconButton
                  onClick={() => setOpenForm(true)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Release">
                <IconButton
                  onClick={() => setDeleteConfirm(true)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={release.status}
                color={getStatusColor(release.status)}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" color="text.secondary">
                Release Date
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {new Date(release.releaseDate).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography sx={{ mb: 2 }}>{release.description}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Project ID
              </Typography>
              <Typography sx={{ mb: 2 }}>{release.projectId}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Requirements
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {release.requirements.length} requirements
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Changes</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setOpenChangeForm(true)}
            >
              Add Change
            </Button>
          </Box>

          <List>
            {release.changes.map((change) => (
              <ListItem key={change.id}>
                <ListItemIcon>{getChangeIcon(change.type)}</ListItemIcon>
                <ListItemText
                  primary={change.description}
                  secondary={`Type: ${change.type}${
                    change.requirementId
                      ? ` | Requirement ID: ${change.requirementId}`
                      : ''
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Release</DialogTitle>
        <form onSubmit={handleUpdateRelease}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Version"
                  name="version"
                  value={formData?.version || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData?.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData?.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                  value={formData?.status || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
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
                  value={formData?.releaseDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, releaseDate: e.target.value })
                  }
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
                  value={formData?.projectId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ChangeForm
        open={openChangeForm}
        handleClose={() => setOpenChangeForm(false)}
        onSubmit={handleAddChange}
      />

      <Dialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete release "{release.name}"?
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

export default ReleaseDetails; 