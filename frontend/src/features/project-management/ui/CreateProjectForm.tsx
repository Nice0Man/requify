import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useCreateProject } from '../model/useProjectQuery';
import { useQueryUtils } from '@/shared/hooks/useQueryUtils';
import { projectQueryKeys } from '../model/useProjectQuery';

interface CreateProjectFormProps {
  open: boolean;
  onClose: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export const CreateProjectForm = ({ open, onClose }: CreateProjectFormProps) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  const { performOptimisticUpdate } = useQueryUtils();
  const createProjectMutation = useCreateProject();

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название проекта обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание проекта обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Оптимистическое обновление - сразу показываем новый проект в списке
      const optimisticProject = {
        id: `temp-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { rollback, invalidate } = performOptimisticUpdate(
        projectQueryKeys.lists(),
        (oldData: any) => {
          if (!oldData) return [optimisticProject];
          return [optimisticProject, ...oldData];
        }
      );

      // Создаем проект на сервере
      await createProjectMutation.mutateAsync(formData);

      // Инвалидируем кэш для получения актуальных данных
      invalidate();

      // Закрываем форму и очищаем данные
      onClose();
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
      });
      setErrors({});

    } catch (error) {
      // При ошибке откатываем оптимистическое обновление
      console.error('Failed to create project:', error);
    }
  };

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Создать новый проект</DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {createProjectMutation.isError && (
            <Alert severity="error">
              Ошибка при создании проекта: {createProjectMutation.error?.message}
            </Alert>
          )}

          <TextField
            label="Название проекта"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            disabled={createProjectMutation.isPending}
          />

          <TextField
            label="Описание"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={4}
            fullWidth
            disabled={createProjectMutation.isPending}
          />

          <FormControl fullWidth disabled={createProjectMutation.isPending}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Статус"
            >
              <MenuItem value="planning">Планирование</MenuItem>
              <MenuItem value="active">Активный</MenuItem>
              <MenuItem value="completed">Завершенный</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={createProjectMutation.isPending}>
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              label="Приоритет"
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={createProjectMutation.isPending}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={createProjectMutation.isPending}
          startIcon={createProjectMutation.isPending ? <CircularProgress size={20} /> : null}
        >
          {createProjectMutation.isPending ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 
