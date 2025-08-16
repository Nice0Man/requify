/**
 * TestPlanCard - Карточка тестового плана (MUI версия)
 * UI компонент для отображения краткой информации о тестовом плане
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  LinearProgress,
  IconButton,
  Fade,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PlayArrow as ExecuteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as PlanIcon,
  CheckCircle as PassedIcon,
  Cancel as FailedIcon,
  Block as BlockedIcon,
  Schedule as PendingIcon,
  Folder as ProjectIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { 
  TestPlan, 
  getTestPlanStatusText,
  getTestPlanStatusColor,
  getTestPlanProgress,
  isTestPlanActive,
  canExecuteTestPlan,
  canEditTestPlan 
} from '../model';
import { 
  APP_COLORS, 
  cardStyles, 
  buttonStyles, 
  badgeStyles, 
  progressStyles,
  iconStyles,
  createGradientBackground,
  animations,
} from '@/shared/styles/commonStyles';

// =============================================================================
// Types
// =============================================================================

export interface TestPlanCardProps {
  testPlan: TestPlan;
  onView?: (testPlan: TestPlan) => void;
  onEdit?: (testPlan: TestPlan) => void;
  onExecute?: (testPlan: TestPlan) => void;
  onDelete?: (testPlan: TestPlan) => void;
  showActions?: boolean;
  showProgress?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

// =============================================================================
// Configurations
// =============================================================================

const STATUS_CONFIG = {
  active: {
    color: APP_COLORS.status.active,
    label: 'Активный',
  },
  inactive: {
    color: APP_COLORS.status.inactive,
    label: 'Неактивный',
  },
  draft: {
    color: APP_COLORS.status.pending,
    label: 'Черновик',
  },
  completed: {
    color: APP_COLORS.status.completed,
    label: 'Завершен',
  },
  archived: {
    color: APP_COLORS.accent.secondary,
    label: 'Архивирован',
  },
} as const;

// =============================================================================
// Component
// =============================================================================

export const TestPlanCard: React.FC<TestPlanCardProps> = ({
  testPlan,
  onView,
  onEdit,
  onExecute,
  onDelete,
  showActions = true,
  showProgress = true,
  variant = 'default',
  className,
}) => {
  const theme = useTheme();
  const statusText = getTestPlanStatusText(testPlan.status);
  const statusColor = getTestPlanStatusColor(testPlan.status);
  const isActive = isTestPlanActive(testPlan);
  const canExecute = canExecuteTestPlan(testPlan);
  const canEdit = canEditTestPlan(testPlan);
  const progress = getTestPlanProgress(testPlan);

  const statusConfig = STATUS_CONFIG[testPlan.status] || STATUS_CONFIG.inactive;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return APP_COLORS.status.active;
    if (percentage >= 60) return APP_COLORS.status.pending;
    if (percentage >= 40) return APP_COLORS.accent.warning;
    return APP_COLORS.status.failed;
  };

  if (variant === 'compact') {
    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            ...cardStyles.base,
            ...cardStyles.hover,
            p: 2,
            opacity: isActive ? 1 : 0.7,
            ...animations.fadeIn,
            cursor: onView ? 'pointer' : 'default',
          }}
          onClick={onView ? () => onView(testPlan) : undefined}
          className={className}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                ...iconStyles.small(APP_COLORS.accent.info),
                borderRadius: 1.5,
              }}
            >
              <PlanIcon sx={{ fontSize: '1.25rem', color: 'white' }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {testPlan.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                {testPlan.test_cases_count || 0} тест-кейсов
              </Typography>
            </Box>

            <Chip
              label={statusConfig.label}
              size="small"
              sx={badgeStyles.colored(statusConfig.color)}
            />

            {showActions && canExecute && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onExecute?.(testPlan);
                }}
                sx={{
                  color: APP_COLORS.accent.success,
                  '&:hover': {
                    backgroundColor: alpha(APP_COLORS.accent.success, 0.1),
                  },
                }}
              >
                <ExecuteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Paper>
      </Fade>
    );
  }

  return (
    <Fade in timeout={300}>
      <Paper
        elevation={0}
        sx={{
          ...cardStyles.base,
          ...cardStyles.hover,
          opacity: isActive ? 1 : 0.7,
          ...animations.fadeIn,
        }}
        className={className}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                ...iconStyles.medium(APP_COLORS.accent.info),
                borderRadius: 2,
              }}
            >
              <PlanIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {testPlan.name}
              </Typography>
              
              {testPlan.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    mb: 1,
                  }}
                >
                  {testPlan.description}
                </Typography>
              )}
              
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                  label={statusConfig.label}
                  size="small"
                  sx={badgeStyles.colored(statusConfig.color)}
                />
                {testPlan.pass_rate !== undefined && (
                  <Chip
                    label={`${testPlan.pass_rate}% успешных`}
                    size="small"
                    variant="outlined"
                    sx={{
                      ...badgeStyles.base,
                      borderColor: alpha(theme.palette.text.secondary, 0.2),
                      color: theme.palette.text.secondary,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack spacing={2}>
            {/* Project Info */}
            {testPlan.project && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ProjectIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    color: theme.palette.text.secondary 
                  }} 
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {testPlan.project.name} ({testPlan.project.code})
                </Typography>
              </Stack>
            )}

            {/* Statistics */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.background.default, 0.3),
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary, display: 'block' }}
                >
                  Тест-кейсы
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  {testPlan.test_cases_count || 0}
                </Typography>
              </Box>
              
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary, display: 'block' }}
                >
                  Выполнений
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  {testPlan.total_executions || 0}
                </Typography>
              </Box>
              
              {testPlan.passed_executions !== undefined && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, display: 'block' }}
                  >
                    Пройдено
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PassedIcon sx={{ fontSize: '1rem', color: APP_COLORS.status.active }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: APP_COLORS.status.active }}
                    >
                      {testPlan.passed_executions}
                    </Typography>
                  </Stack>
                </Box>
              )}
              
              {testPlan.failed_executions !== undefined && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, display: 'block' }}
                  >
                    Провалено
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FailedIcon sx={{ fontSize: '1rem', color: APP_COLORS.status.failed }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: APP_COLORS.status.failed }}
                    >
                      {testPlan.failed_executions}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Progress */}
            {showProgress && progress.total > 0 && (
              <Box>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
                  >
                    Прогресс выполнения
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    {progress.percentage}% ({progress.completed}/{progress.total})
                  </Typography>
                </Stack>
                
                <LinearProgress
                  variant="determinate"
                  value={progress.percentage}
                  sx={{
                    ...progressStyles.colored(getProgressColor(progress.percentage)),
                    mb: 1,
                  }}
                />
                
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PassedIcon sx={{ fontSize: '0.875rem', color: APP_COLORS.status.active }} />
                    <Typography variant="caption" sx={{ color: APP_COLORS.status.active }}>
                      {progress.passed} пройдено
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FailedIcon sx={{ fontSize: '0.875rem', color: APP_COLORS.status.failed }} />
                    <Typography variant="caption" sx={{ color: APP_COLORS.status.failed }}>
                      {progress.failed} провалено
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            )}

            {/* Creator */}
            {testPlan.created_by && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    color: theme.palette.text.secondary 
                  }} 
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Создал: {testPlan.created_by.full_name || testPlan.created_by.username}
                </Typography>
              </Stack>
            )}

            {/* Actions */}
            {showActions && (
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  pt: 1, 
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
                }}
              >
                {onView && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => onView(testPlan)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.primary)}
                  >
                    Просмотр
                  </Button>
                )}
                {onExecute && canExecute && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ExecuteIcon />}
                    onClick={() => onExecute(testPlan)}
                    sx={{
                      ...buttonStyles.primary,
                      background: createGradientBackground(
                        APP_COLORS.accent.success, 
                        APP_COLORS.accent.info
                      ),
                    }}
                  >
                    Выполнить
                  </Button>
                )}
                {onEdit && canEdit && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(testPlan)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.secondary)}
                  >
                    Редактировать
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(testPlan)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.error)}
                  >
                    Удалить
                  </Button>
                )}
              </Stack>
            )}

            {/* Footer */}
            <Box sx={{ pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                }}
              >
                Создан: {new Date(testPlan.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Fade>
  );
};