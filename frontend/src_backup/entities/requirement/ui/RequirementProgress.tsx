import React, { useState } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material';

interface RequirementProgressProps {
  progress: number;
  requirementId: number;
  editable?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showEdit?: boolean;
  onProgressUpdate?: (progress: number) => Promise<void>;
  className?: string;
}

export const RequirementProgress: React.FC<RequirementProgressProps> = ({
  progress,
  requirementId,
  editable = false,
  size = 'medium',
  showLabel = true,
  showEdit = true,
  onProgressUpdate,
  className,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(progress);
  const [isLoading, setIsLoading] = useState(false);

  const getProgressColor = (value: number) => {
    if (value >= 100) return theme.palette.success.main;
    if (value >= 75) return theme.palette.info.main;
    if (value >= 50) return theme.palette.warning.main;
    if (value >= 25) return theme.palette.error.main;
    return theme.palette.grey[400];
  };

  const getProgressStatus = (value: number) => {
    if (value >= 100) return 'Завершено';
    if (value >= 75) return 'Почти готово';
    if (value >= 50) return 'В процессе';
    if (value >= 25) return 'Начато';
    return 'Не начато';
  };

  const getTrendIcon = (value: number) => {
    if (value >= 75) return <TrendingUp fontSize="small" />;
    if (value >= 25) return <Remove fontSize="small" />;
    return <TrendingDown fontSize="small" />;
  };

  const handleSave = async () => {
    if (!onProgressUpdate) return;
    
    setIsLoading(true);
    try {
      await onProgressUpdate(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(progress);
    setIsEditing(false);
  };

  const progressColor = getProgressColor(progress);
  const progressStatus = getProgressStatus(progress);

  return (
    <Box className={className}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Progress Bar */}
        <Box sx={{ flexGrow: 1, minWidth: size === 'small' ? 60 : 120 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: size === 'small' ? 6 : size === 'medium' ? 8 : 12,
              borderRadius: 1,
              backgroundColor: alpha(progressColor, 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: progressColor,
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Progress Label */}
        {showLabel && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant={size === 'small' ? 'caption' : 'body2'}
              color="text.secondary"
              sx={{ minWidth: 35, textAlign: 'right' }}
            >
              {Math.round(progress)}%
            </Typography>
            
            {size !== 'small' && (
              <Chip
                icon={getTrendIcon(progress)}
                label={progressStatus}
                size="small"
                sx={{
                  backgroundColor: alpha(progressColor, 0.1),
                  color: progressColor,
                  '& .MuiChip-icon': {
                    color: progressColor,
                  },
                }}
              />
            )}
          </Stack>
        )}

        {/* Edit Button */}
        {editable && showEdit && (
          <Tooltip title="Редактировать прогресс">
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{
                opacity: 0.7,
                '&:hover': { opacity: 1 },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Обновить прогресс требования
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {/* Slider */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Прогресс выполнения
              </Typography>
              <Slider
                value={editValue}
                onChange={(_, value) => setEditValue(value as number)}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                ]}
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: getProgressColor(editValue),
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: getProgressColor(editValue),
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: alpha(getProgressColor(editValue), 0.2),
                  },
                }}
              />
            </Box>

            {/* Text Input */}
            <TextField
              label="Точное значение (%)"
              type="number"
              value={editValue}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, Number(e.target.value)));
                setEditValue(value);
              }}
              inputProps={{
                min: 0,
                max: 100,
                step: 0.1,
              }}
              size="small"
              sx={{ width: 200 }}
            />

            {/* Preview */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Предварительный просмотр
              </Typography>
              <RequirementProgress
                progress={editValue}
                requirementId={requirementId}
                editable={false}
                showEdit={false}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isLoading || editValue === progress}
            startIcon={isLoading ? undefined : <CheckIcon />}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 