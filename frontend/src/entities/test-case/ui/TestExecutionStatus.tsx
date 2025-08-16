import React, { memo } from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  CheckCircle as PassedIcon,
  Cancel as FailedIcon,
  Block as BlockedIcon,
  SkipNext as SkippedIcon,
  Schedule as InProgressIcon,
  HelpOutline as NotExecutedIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import type { 
  TestExecutionStatus as TExecutionStatus,
  TestExecution,
  TestCaseStats 
} from '../model/types';

export interface TestExecutionStatusProps {
  /** Статус выполнения */
  status: TExecutionStatus;
  /** Данные выполнения (опционально) */
  execution?: TestExecution;
  /** Показывать ли иконку */
  showIcon?: boolean;
  /** Показывать ли текст */
  showText?: boolean;
  /** Размер компонента */
  size?: 'small' | 'medium' | 'large';
  /** Режим отображения */
  variant?: 'chip' | 'badge' | 'text' | 'progress';
  /** Компактный режим */
  compact?: boolean;
}

export interface TestExecutionProgressProps {
  /** Статистика тестов */
  stats: TestCaseStats;
  /** Показывать ли проценты */
  showPercentages?: boolean;
  /** Показывать ли детали */
  showDetails?: boolean;
  /** Компактный режим */
  compact?: boolean;
}

/**
 * Получение свойств статуса выполнения
 */
const getExecutionStatusProps = (status: TExecutionStatus) => {
  switch (status) {
    case 'passed':
      return { 
        icon: PassedIcon, 
        color: 'success' as const, 
        label: 'Прошел',
        description: 'Тест выполнен успешно',
      };
    case 'failed':
      return { 
        icon: FailedIcon, 
        color: 'error' as const, 
        label: 'Провалился',
        description: 'Тест провалился',
      };
    case 'blocked':
      return { 
        icon: BlockedIcon, 
        color: 'warning' as const, 
        label: 'Заблокирован',
        description: 'Выполнение заблокировано',
      };
    case 'skipped':
      return { 
        icon: SkippedIcon, 
        color: 'info' as const, 
        label: 'Пропущен',
        description: 'Тест пропущен',
      };
    case 'in_progress':
      return { 
        icon: InProgressIcon, 
        color: 'primary' as const, 
        label: 'Выполняется',
        description: 'Тест в процессе выполнения',
      };
    case 'not_executed':
    default:
      return { 
        icon: NotExecutedIcon, 
        color: 'default' as const, 
        label: 'Не выполнен',
        description: 'Тест еще не выполнялся',
      };
  }
};

/**
 * Форматирование длительности
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}с`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}м ${remainingSeconds}с`;
};

/**
 * Компонент статуса выполнения тест-кейса
 * Отображает текущий статус с иконкой и дополнительной информацией
 */
export const TestExecutionStatus = memo<TestExecutionStatusProps>(({
  status,
  execution,
  showIcon = true,
  showText = true,
  size = 'medium',
  variant = 'chip',
  compact = false,
}) => {
  const statusProps = getExecutionStatusProps(status);
  const IconComponent = statusProps.icon;

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getChipSize = () => {
    switch (size) {
      case 'small': return 'small' as const;
      case 'large': return 'medium' as const;
      default: return 'small' as const;
    }
  };

  // Подготовка дополнительной информации для tooltip
  const getTooltipContent = () => {
    if (!execution && !compact) return statusProps.description;

    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {statusProps.label}
        </Typography>
        {execution?.executedBy && (
          <Typography variant="caption" display="block">
            Выполнил: {execution.executedBy}
          </Typography>
        )}
        {execution?.executedAt && (
          <Typography variant="caption" display="block">
            Дата: {new Date(execution.executedAt).toLocaleString('ru-RU')}
          </Typography>
        )}
        {execution?.duration && (
          <Typography variant="caption" display="block">
            Время: {formatDuration(execution.duration)}
          </Typography>
        )}
        {execution?.notes && (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            {execution.notes}
          </Typography>
        )}
      </Box>
    );
  };

  // Рендер разных вариантов
  switch (variant) {
    case 'chip':
      return (
        <Tooltip title={getTooltipContent()}>
          <Chip
            icon={showIcon ? <IconComponent sx={{ fontSize: `${getIconSize()}px !important` }} /> : undefined}
            label={showText ? statusProps.label : ''}
            size={getChipSize()}
            color={statusProps.color}
            variant="filled"
            sx={{
              cursor: 'help',
              ...(status === 'in_progress' && {
                '& .MuiChip-icon': {
                  animation: 'spin 2s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                },
              }),
            }}
          />
        </Tooltip>
      );

    case 'badge':
      return (
        <Tooltip title={getTooltipContent()}>
          <Badge
            badgeContent={
              <Box
                sx={{
                  width: getIconSize(),
                  height: getIconSize(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${statusProps.color}.main`,
                  borderRadius: '50%',
                  color: 'white',
                }}
              >
                <IconComponent sx={{ fontSize: `${getIconSize() - 4}px` }} />
              </Box>
            }
            sx={{ cursor: 'help' }}
          >
            {showText && (
              <Typography variant="body2" color="text.secondary">
                {statusProps.label}
              </Typography>
            )}
          </Badge>
        </Tooltip>
      );

    case 'text':
      return (
        <Tooltip title={getTooltipContent()}>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'help' }}>
            {showIcon && (
              <IconComponent 
                sx={{ 
                  fontSize: getIconSize(),
                  color: `${statusProps.color}.main`,
                  ...(status === 'in_progress' && {
                    animation: 'spin 2s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }),
                }} 
              />
            )}
            {showText && (
              <Typography 
                variant={size === 'small' ? 'caption' : 'body2'}
                color={`${statusProps.color}.main`}
                sx={{ fontWeight: 500 }}
              >
                {statusProps.label}
              </Typography>
            )}
          </Box>
        </Tooltip>
      );

    case 'progress':
      if (status === 'in_progress') {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={getIconSize()} color={statusProps.color} />
            {showText && (
              <Typography variant="body2" color={`${statusProps.color}.main`}>
                {statusProps.label}
              </Typography>
            )}
          </Box>
        );
      }
      return (
        <TestExecutionStatus
          status={status}
          execution={execution}
          showIcon={showIcon}
          showText={showText}
          size={size}
          variant="text"
          compact={compact}
        />
      );

    default:
      return null;
  }
});

/**
 * Компонент прогресса выполнения тестов
 * Отображает общую статистику выполнения набора тестов
 */
export const TestExecutionProgress = memo<TestExecutionProgressProps>(({
  stats,
  showPercentages = true,
  showDetails = true,
  compact = false,
}) => {
  const total = stats.total;
  const passed = stats.byExecutionStatus.passed || 0;
  const failed = stats.byExecutionStatus.failed || 0;
  const blocked = stats.byExecutionStatus.blocked || 0;
  const skipped = stats.byExecutionStatus.skipped || 0;
  const inProgress = stats.byExecutionStatus.in_progress || 0;
  const notExecuted = stats.byExecutionStatus.not_executed || 0;

  const executed = total - notExecuted;
  const passRate = total > 0 ? (passed / total) * 100 : 0;
  const executionRate = total > 0 ? (executed / total) * 100 : 0;

  if (compact) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" color="text.secondary">
            Выполнено: {executed}/{total}
          </Typography>
          {showPercentages && (
            <Typography variant="caption" color="success.main">
              {passRate.toFixed(1)}% успех
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={executionRate}
          color="primary"
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Основной прогресс */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight={600}>
            Прогресс выполнения
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {executed}/{total} ({executionRate.toFixed(1)}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={executionRate}
          color="primary"
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Прогресс успешности */}
      <Box mb={showDetails ? 2 : 0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight={600}>
            Успешность
          </Typography>
          <Typography variant="body2" color="success.main">
            {passRate.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={passRate}
          color="success"
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Детальная статистика */}
      {showDetails && (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {passed > 0 && (
            <Chip
              icon={<PassedIcon />}
              label={`${passed} прошло`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {failed > 0 && (
            <Chip
              icon={<FailedIcon />}
              label={`${failed} провалено`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
          {blocked > 0 && (
            <Chip
              icon={<BlockedIcon />}
              label={`${blocked} заблокировано`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {skipped > 0 && (
            <Chip
              icon={<SkippedIcon />}
              label={`${skipped} пропущено`}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
          {inProgress > 0 && (
            <Chip
              icon={<InProgressIcon />}
              label={`${inProgress} выполняется`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {notExecuted > 0 && (
            <Chip
              icon={<NotExecutedIcon />}
              label={`${notExecuted} не выполнено`}
              size="small"
              color="default"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Средняя скорость выполнения */}
      {stats.averageDuration > 0 && showDetails && (
        <Box mt={2} display="flex" alignItems="center" gap={1}>
          <SpeedIcon color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            Среднее время: {formatDuration(stats.averageDuration)}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

TestExecutionStatus.displayName = 'TestExecutionStatus';
TestExecutionProgress.displayName = 'TestExecutionProgress'; 