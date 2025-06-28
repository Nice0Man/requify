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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  BugReport as BugIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import {
  fetchTests,
  createTest,
  updateTest,
  deleteTest,
} from '../redux/slices/testingSlice';

const TestForm = ({ open, handleClose, test, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FUNCTIONAL',
    priority: 'MEDIUM',
    status: 'PLANNED',
    requirementId: '',
    projectId: '',
    releaseId: '',
    assignedTo: '',
    environment: 'DEVELOPMENT',
  });

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name || '',
        description: test.description || '',
        type: test.type || 'FUNCTIONAL',
        priority: test.priority || 'MEDIUM',
        status: test.status || 'PLANNED',
        requirementId: test.requirementId || '',
        projectId: test.projectId || '',
        releaseId: test.releaseId || '',
        assignedTo: test.assignedTo || '',
        environment: test.environment || 'DEVELOPMENT',
      });
    }
  }, [test]);

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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {test ? 'Edit Test Case' : 'Create New Test Case'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
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
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  required
                >
                  <MenuItem value="FUNCTIONAL">Functional</MenuItem>
                  <MenuItem value="PERFORMANCE">Performance</MenuItem>
                  <MenuItem value="SECURITY">Security</MenuItem>
                  <MenuItem value="INTEGRATION">Integration</MenuItem>
                  <MenuItem value="REGRESSION">Regression</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  required
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  required
                >
                  <MenuItem value="PLANNED">Planned</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="PASSED">Passed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="BLOCKED">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  name="environment"
                  value={formData.environment}
                  onChange={handleChange}
                  label="Environment"
                  required
                >
                  <MenuItem value="DEVELOPMENT">Development</MenuItem>
                  <MenuItem value="STAGING">Staging</MenuItem>
                  <MenuItem value="PRODUCTION">Production</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Requirement ID"
                name="requirementId"
                type="number"
                value={formData.requirementId}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Release ID"
                name="releaseId"
                type="number"
                value={formData.releaseId}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {test ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Testing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tests, loading } = useSelector((state) => state.testing);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchTests());
  }, [dispatch]);

  const handleCreateTest = async (formData) => {
    try {
      await dispatch(createTest(formData)).unwrap();
      toast.success('Test case created successfully');
      setOpenForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create test case');
    }
  };

  const handleUpdateTest = async (formData) => {
    try {
      await dispatch(updateTest({ ...selectedTest, ...formData })).unwrap();
      toast.success('Test case updated successfully');
      setOpenForm(false);
      setSelectedTest(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update test case');
    }
  };

  const handleDeleteTest = async () => {
    try {
      await dispatch(deleteTest(selectedTest.id)).unwrap();
      toast.success('Test case deleted successfully');
      setDeleteConfirm(false);
      setSelectedTest(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete test case');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASSED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'BLOCKED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'FUNCTIONAL':
        return <BugIcon />;
      case 'PERFORMANCE':
        return <SpeedIcon />;
      case 'SECURITY':
        return <SecurityIcon />;
      default:
        return <BuildIcon />;
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 250 },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getTypeIcon(params.value)}
          <Typography sx={{ ml: 1 }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'environment',
      headerName: 'Environment',
      width: 120,
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
    },
    {
      field: 'steps',
      headerName: 'Steps',
      width: 100,
      valueGetter: (params) => params.row.steps.length,
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
              onClick={() => navigate(`/testing/${params.row.id}`)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedTest(params.row);
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
                setSelectedTest(params.row);
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
        <Typography>Loading test cases...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Test Cases
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              New Test Case
            </Button>
          </Box>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={tests}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
            />
          </div>
        </CardContent>
      </Card>

      <TestForm
        open={openForm}
        handleClose={() => {
          setOpenForm(false);
          setSelectedTest(null);
        }}
        test={selectedTest}
        onSubmit={selectedTest ? handleUpdateTest : handleCreateTest}
      />

      <Dialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete test case "{selectedTest?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteTest} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Testing; 