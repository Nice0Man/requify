import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { fetchRequirements } from '../redux/slices/requirementsSlice';
import { requirementsApi } from '../api/requirements';
import { toast } from 'react-toastify';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'completed', label: 'Completed' },
];

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Название обязательно')
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: Yup.string()
    .required('Описание обязательно')
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(1000, 'Описание не должно превышать 1000 символов'),
  status: Yup.string().required('Статус обязателен'),
  priority: Yup.string().required('Приоритет обязателен'),
  type: Yup.string().required('Тип обязателен'),
  projectId: Yup.string().required('Проект обязателен'),
});

const Requirements = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requirements, loading, totalCount } = useSelector((state) => state.requirements);
  const { projects } = useSelector((state) => state.projects);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    priority: 'medium',
    type: 'functional',
    projectId: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    project: '',
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(fetchRequirements({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      ...filters,
    }));
  }, [dispatch, paginationModel, filters]);

  const handleFormSubmit = async (values) => {
    try {
      if (selectedRequirement) {
        await requirementsApi.update(selectedRequirement.id, values);
        toast.success('Требование обновлено');
      } else {
        await requirementsApi.create(values);
        toast.success('Требование создано');
      }
      setOpenForm(false);
      dispatch(fetchRequirements({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...filters,
      }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: selectedRequirement?.title || '',
      description: selectedRequirement?.description || '',
      status: selectedRequirement?.status || 'draft',
      priority: selectedRequirement?.priority || 'medium',
      type: selectedRequirement?.type || 'functional',
      projectId: selectedRequirement?.projectId || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  const handleDelete = async () => {
    try {
      await requirementsApi.delete(selectedRequirement.id);
      toast.success('Требование удалено');
      setOpenDeleteDialog(false);
      dispatch(fetchRequirements({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...filters,
      }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (requirement) => {
    setSelectedRequirement(requirement);
    setFormData({
      title: requirement.title,
      description: requirement.description,
      status: requirement.status,
      priority: requirement.priority,
      type: requirement.type,
      projectId: requirement.projectId,
    });
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedRequirement(null);
    setFormData({
      title: '',
      description: '',
      status: 'draft',
      priority: 'medium',
      type: 'functional',
      projectId: '',
    });
    setOpenForm(true);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'project', headerName: 'Project', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'approved'
              ? 'success'
              : params.value === 'rejected'
              ? 'error'
              : 'default'
          }
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
          color={
            params.value === 'high'
              ? 'error'
              : params.value === 'medium'
              ? 'warning'
              : 'success'
          }
          size="small"
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedRequirement(params.row);
              setOpenDeleteDialog(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search"
            value={filters.search}
            onChange={handleFilterChange('search')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filters.status}
            onChange={handleFilterChange('status')}
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Project"
            value={filters.project}
            onChange={handleFilterChange('project')}
          >
            <MenuItem value="">All</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Create Requirement
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={requirements}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          rowCount={totalCount}
          loading={loading}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/requirements/${params.row.id}`)}
        />
      </Paper>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRequirement ? 'Редактировать требование' : 'Новое требование'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Название"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Описание"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                margin="normal"
                multiline
                rows={4}
              />
              <TextField
                fullWidth
                select
                label="Статус"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
                margin="normal"
              >
                <MenuItem value="draft">Черновик</MenuItem>
                <MenuItem value="review">На проверке</MenuItem>
                <MenuItem value="approved">Утверждено</MenuItem>
                <MenuItem value="rejected">Отклонено</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Приоритет"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
                helperText={formik.touched.priority && formik.errors.priority}
                margin="normal"
              >
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="low">Низкий</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Тип"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
                margin="normal"
              >
                <MenuItem value="functional">Функциональное</MenuItem>
                <MenuItem value="non-functional">Нефункциональное</MenuItem>
                <MenuItem value="business">Бизнес-требование</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Проект"
                name="projectId"
                value={formik.values.projectId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                helperText={formik.touched.projectId && formik.errors.projectId}
                margin="normal"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Отмена</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
              startIcon={<SaveIcon />}
            >
              {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить требование {selectedRequirement?.title}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Requirements; 