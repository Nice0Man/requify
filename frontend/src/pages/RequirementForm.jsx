import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import {
  createRequirement,
  updateRequirement,
  fetchRequirementById,
  clearCurrentRequirement,
} from '../redux/slices/requirementsSlice';
import { fetchProjects } from '../redux/slices/projectsSlice';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  project: Yup.string().required('Project is required'),
  type: Yup.string().required('Type is required'),
  priority: Yup.string().required('Priority is required'),
  status: Yup.string().required('Status is required'),
});

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'completed', label: 'Completed' },
];

const typeOptions = [
  { value: 'functional', label: 'Functional' },
  { value: 'non_functional', label: 'Non-Functional' },
  { value: 'business', label: 'Business' },
  { value: 'user', label: 'User' },
  { value: 'system', label: 'System' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const RequirementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRequirement, loading } = useSelector((state) => state.requirements);
  const { projects } = useSelector((state) => state.projects);
  const isEditMode = Boolean(id);

  useEffect(() => {
    dispatch(fetchProjects());
    if (isEditMode) {
      dispatch(fetchRequirementById(id));
    }
    return () => {
      dispatch(clearCurrentRequirement());
    };
  }, [dispatch, id, isEditMode]);

  const formik = useFormik({
    initialValues: {
      title: currentRequirement?.title || '',
      description: currentRequirement?.description || '',
      project: currentRequirement?.project || '',
      type: currentRequirement?.type || '',
      priority: currentRequirement?.priority || '',
      status: currentRequirement?.status || 'draft',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await dispatch(updateRequirement({ id, requirement: values })).unwrap();
          toast.success('Requirement updated successfully');
        } else {
          await dispatch(createRequirement(values)).unwrap();
          toast.success('Requirement created successfully');
        }
        navigate('/requirements');
      } catch (error) {
        toast.error(error.message || 'An error occurred');
      }
    },
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {isEditMode ? 'Edit Requirement' : 'Create Requirement'}
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="project"
                  name="project"
                  label="Project"
                  value={formik.values.project}
                  onChange={formik.handleChange}
                  error={formik.touched.project && Boolean(formik.errors.project)}
                  helperText={formik.touched.project && formik.errors.project}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="type"
                  name="type"
                  label="Type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                >
                  {typeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="priority"
                  name="priority"
                  label="Priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={formik.touched.priority && formik.errors.priority}
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="status"
                  name="status"
                  label="Status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/requirements')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequirementForm; 