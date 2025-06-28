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
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  BugReport as BugIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  fetchTestById,
  updateTest,
  deleteTest,
  addTestStep,
  updateTestStep,
  deleteTestStep,
} from '../redux/slices/testingSlice';

const StepForm = ({ open, handleClose, step, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    expectedResult: '',
    actualResult: '',
    status: 'PENDING',
  });

  useEffect(() => {
    if (step) {
      setFormData({
        description: step.description || '',
        expectedResult: step.expectedResult || '',
        actualResult: step.actualResult || '',
        status: step.status || 'PENDING',
      });
    }
  }, [step]);

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
        {step ? 'Edit Test Step' : 'Add Test Step'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Result"
                name="expectedResult"
                value={formData.expectedResult}
                onChange={handleChange}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Actual Result"
                name="actualResult"
                value={formData.actualResult}
                onChange={handleChange}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  required
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PASSED">Passed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {step ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const TestDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentTest: test, loading } = useSelector((state) => state.testing);
  const [openForm, setOpenForm] = useState(false);
  const [openStepForm, setOpenStepForm] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    dispatch(fetchTestById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        description: test.description,
        type: test.type,
        priority: test.priority,
        status: test.status,
        requirementId: test.requirementId,
        projectId: test.projectId,
        releaseId: test.releaseId,
        assignedTo: test.assignedTo,
        environment: test.environment,
      });
    }
  }, [test]);

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateTest({ ...test, ...formData })).unwrap();
      toast.success('Test case updated successfully');
      setOpenForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update test case');
    }
  };

  const handleDeleteTest = async () => {
    try {
      await dispatch(deleteTest(id)).unwrap();
      toast.success('Test case deleted successfully');
      navigate('/testing');
    } catch (error) {
      toast.error(error.message || 'Failed to delete test case');
    }
  };

  const handleAddStep = async (stepData) => {
    try {
      await dispatch(addTestStep({ testId: id, stepData })).unwrap();
      toast.success('Test step added successfully');
      setOpenStepForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add test step');
    }
  };

  const handleUpdateStep = async (stepData) => {
    try {
      await dispatch(updateTestStep({
        testId: id,
        stepId: selectedStep.id,
        stepData,
      })).unwrap();
      toast.success('Test step updated successfully');
      setOpenStepForm(false);
      setSelectedStep(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update test step');
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await dispatch(deleteTestStep({ testId: id, stepId })).unwrap();
      toast.success('Test step deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete test step');
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

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading test details...</Typography>
      </Box>
    );
  }

  if (!test) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Test not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/testing')}
        sx={{ mb: 2 }}
      >
        Back to Tests
      </Button>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" component="h2">
                {test.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {test.description}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Edit Test">
                <IconButton
                  onClick={() => setOpenForm(true)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Test">
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
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Test Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTypeIcon(test.type)}
                      <Typography sx={{ ml: 1 }}>{test.type}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={test.status}
                      color={getStatusColor(test.status)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={test.priority}
                      color={getPriorityColor(test.priority)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Environment
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{test.environment}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Related Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Requirement ID
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{test.requirementId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Project ID
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{test.projectId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Release ID
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{test.releaseId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned To
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{test.assignedTo}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Test Steps</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setOpenStepForm(true)}
            >
              Add Step
            </Button>
          </Box>

          <List>
            {test.steps.map((step) => (
              <ListItem
                key={step.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                secondaryAction={
                  <Box>
                    <Tooltip title="Edit Step">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedStep(step);
                          setOpenStepForm(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Step">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteStep(step.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon>{getStepStatusIcon(step.status)}</ListItemIcon>
                <ListItemText
                  primary={step.description}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Expected: {step.expectedResult}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actual: {step.actualResult}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Test Case</DialogTitle>
        <form onSubmit={handleUpdateTest}>
          <DialogContent>
            <Grid container spacing={2}>
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
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData?.type || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
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
                    value={formData?.priority || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
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
                    value={formData?.status || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
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
                    value={formData?.environment || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, environment: e.target.value })
                    }
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
                  value={formData?.requirementId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, requirementId: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Release ID"
                  name="releaseId"
                  type="number"
                  value={formData?.releaseId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, releaseId: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Assigned To"
                  name="assignedTo"
                  value={formData?.assignedTo || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
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

      <StepForm
        open={openStepForm}
        handleClose={() => {
          setOpenStepForm(false);
          setSelectedStep(null);
        }}
        step={selectedStep}
        onSubmit={selectedStep ? handleUpdateStep : handleAddStep}
      />

      <Dialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete test case "{test.name}"?
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

export default TestDetails; 