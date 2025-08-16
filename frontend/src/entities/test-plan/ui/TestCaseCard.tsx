/**
 * TestCaseCard - Карточка тест-кейса (MUI версия)
 * UI компонент для отображения краткой информации о тест-кейсе
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  IconButton,
  Fade,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Assignment as TestCaseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as ExecuteIcon,
  Schedule as TimeIcon,
  Folder as PlanIcon,
  Person as PersonIcon,
  Label as TagIcon,
  Link as RequirementIcon,
} from '@mui/icons-material';
import { 
  TestCase, 
  getTestCaseStatusText,
  getTestCaseStatusColor,
  getPriorityText,
  getPriorityColor,
  getPriorityIcon,
  getTestCaseStats,
  getLastTestCaseResult,
  isTestCaseActive,
  canExecuteTestCase,
  formatExecutionDuration 
} from '../model';
import { TestExecutionStatusBadge } from './TestExecutionStatusBadge';
import { 
  APP_COLORS, 
  cardStyles, 
  buttonStyles, 
  badgeStyles,
  iconStyles,
  animations,
} from '@/shared/styles/commonStyles';

// =============================================================================
// Types
// =============================================================================

export interface TestCaseCardProps {
  testCase: TestCase;
  onView?: (testCase: TestCase) => void;
  onEdit?: (testCase: TestCase) => void;
  onExecute?: (testCase: TestCase) => void;
  onDelete?: (testCase: TestCase) => void;
  showActions?: boolean;
  showStatistics?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export const TestCaseCard: React.FC<TestCaseCardProps> = ({
  testCase,
  onView,
  onEdit,
  onExecute,
  onDelete,
  showActions = true,
  showStatistics = true,
  variant = 'default',
  className,
}) => {
  const theme = useTheme();
  const statusText = getTestCaseStatusText(testCase.status);
  const statusColor = getTestCaseStatusColor(testCase.status);
  const isActive = isTestCaseActive(testCase);
  const canExecute = canExecuteTestCase(testCase);
  const stats = getTestCaseStats(testCase);
  const lastResult = getLastTestCaseResult(testCase);

  const priorityText = testCase.priority ? getPriorityText(testCase.priority) : null;
  const priorityColor = testCase.priority ? getPriorityColor(testCase.priority) : null;
  const priorityIcon = testCase.priority ? getPriorityIcon(testCase.priority) : null;

  const STATUS_CONFIG = {
    active: { color: APP_COLORS.status.active, label: 'Активный' },
    inactive: { color: APP_COLORS.status.inactive, label: 'Неактивный' },
    draft: { color: APP_COLORS.status.pending, label: 'Черновик' },
    approved: { color: APP_COLORS.accent.primary, label: 'Утвержден' },
    deprecated: { color: APP_COLORS.status.failed, label: 'Устарел' },
  } as const;

  const statusConfig = STATUS_CONFIG[testCase.status] || STATUS_CONFIG.inactive;

  const PRIORITY_COLORS = {
    low: APP_COLORS.status.inactive,
    medium: APP_COLORS.accent.info,
    high: APP_COLORS.accent.warning,
    critical: APP_COLORS.status.failed,
  } as const;

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
          onClick={onView ? () => onView(testCase) : undefined}
          className={className}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                ...iconStyles.small(APP_COLORS.accent.success),
                borderRadius: 1.5,
              }}
            >
              <TestCaseIcon sx={{ fontSize: '1.25rem', color: 'white' }} />
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
                {testCase.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                {stats.total_executions} выполнений
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
                  onExecute?.(testCase);
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
                ...iconStyles.medium(APP_COLORS.accent.success),
                borderRadius: 2,
              }}
            >
              <TestCaseIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
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
                {testCase.name}
              </Typography>
              
              {testCase.description && (
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
                  {testCase.description}
                </Typography>
              )}
              
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                  label={statusConfig.label}
                  size="small"
                  sx={badgeStyles.colored(statusConfig.color)}
                />
                {testCase.priority && priorityColor && (
                  <Chip
                    label={`${priorityIcon} ${priorityText}`}
                    size="small"
                    variant="outlined"
                    sx={badgeStyles.colored(PRIORITY_COLORS[testCase.priority], 'outlined')}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack spacing={2}>
            {/* Test Plan */}
            {testCase.test_plan && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PlanIcon 
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
                  План: {testCase.test_plan.name}
                </Typography>
              </Stack>
            )}

            {/* Duration */}
            {testCase.estimated_duration && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TimeIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    color: theme.palette.text.secondary 
                  }} 
                />
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Ожидаемая длительность: {formatExecutionDuration(testCase.estimated_duration * 60)}
                </Typography>
              </Stack>
            )}

            {/* Last Result */}
            {lastResult && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Последний результат:
                </Typography>
                <TestExecutionStatusBadge 
                  status={lastResult.status} 
                  size="small"
                  showTooltip={false}
                />
              </Stack>
            )}

            {/* Statistics */}
            {showStatistics && stats.total_executions > 0 && (
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
                    Выполнений
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    {stats.total_executions}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, display: 'block' }}
                  >
                    Успешность
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: APP_COLORS.status.active }}
                  >
                    {stats.pass_rate}%
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, display: 'block' }}
                  >
                    Пройдено
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: APP_COLORS.status.active }}
                  >
                    {stats.passed}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, display: 'block' }}
                  >
                    Провалено
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: APP_COLORS.status.failed }}
                  >
                    {stats.failed}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Average Duration */}
            {stats.avg_duration > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Средняя длительность:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  {formatExecutionDuration(stats.avg_duration)}
                </Typography>
              </Stack>
            )}

            {/* Requirements */}
            {testCase.requirements && testCase.requirements.length > 0 && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <RequirementIcon 
                    sx={{ 
                      fontSize: '1rem', 
                      color: theme.palette.text.secondary 
                    }} 
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Связанные требования:
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {testCase.requirements.slice(0, 3).map((req) => (
                    <Chip
                      key={req.id}
                      label={req.title}
                      variant="outlined"
                      size="small"
                      sx={{
                        ...badgeStyles.base,
                        borderColor: alpha(theme.palette.text.secondary, 0.2),
                        color: theme.palette.text.secondary,
                      }}
                    />
                  ))}
                  {testCase.requirements.length > 3 && (
                    <Chip
                      label={`+${testCase.requirements.length - 3} еще`}
                      variant="outlined"
                      size="small"
                      sx={{
                        ...badgeStyles.base,
                        borderColor: alpha(theme.palette.text.secondary, 0.2),
                        color: theme.palette.text.secondary,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}

            {/* Tags */}
            {testCase.tags && testCase.tags.length > 0 && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TagIcon 
                    sx={{ 
                      fontSize: '1rem', 
                      color: theme.palette.text.secondary 
                    }} 
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Теги:
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {testCase.tags.slice(0, 5).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                      size="small"
                      sx={{
                        ...badgeStyles.base,
                        borderColor: alpha(APP_COLORS.accent.info, 0.3),
                        color: APP_COLORS.accent.info,
                        backgroundColor: alpha(APP_COLORS.accent.info, 0.05),
                      }}
                    />
                  ))}
                  {testCase.tags.length > 5 && (
                    <Chip
                      label={`+${testCase.tags.length - 5}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        ...badgeStyles.base,
                        borderColor: alpha(APP_COLORS.accent.info, 0.3),
                        color: APP_COLORS.accent.info,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}

            {/* Creator */}
            {testCase.created_by && (
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
                  Создал: {testCase.created_by.full_name || testCase.created_by.username}
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
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {onView && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => onView(testCase)}
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
                    onClick={() => onExecute(testCase)}
                    sx={buttonStyles.primary}
                  >
                    Выполнить
                  </Button>
                )}
                {onEdit && isActive && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(testCase)}
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
                    onClick={() => onDelete(testCase)}
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
                Создан: {new Date(testCase.created_at).toLocaleDateString('ru-RU', {
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