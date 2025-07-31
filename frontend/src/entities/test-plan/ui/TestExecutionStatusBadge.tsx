/**
 * TestExecutionStatusBadge - Бейдж статуса выполнения теста (MUI версия)
 * UI компонент для отображения статуса выполнения теста с цветовой индикацией
 */

import React from 'react';
import { Chip, Box, Tooltip, alpha, useTheme } from '@mui/material';
import {
  Pause as NotStartedIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as PassedIcon,
  Cancel as FailedIcon,
  Block as BlockedIcon,
  SkipNext as SkippedIcon,
} from '@mui/icons-material';
import { 
  TestExecutionStatus, 
  getTestExecutionStatusText, 
  getTestExecutionStatusColor,
  getTestExecutionStatusIcon 
} from '../model';
import { APP_COLORS, badgeStyles } from '@/shared/styles/commonStyles';

// =============================================================================
// Types
// =============================================================================

export interface TestExecutionStatusBadgeProps {
  status: TestExecutionStatus;
  variant?: 'filled' | 'outlined' | 'minimal';
  size?: 'small' | 'medium';
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
}

// =============================================================================
// Configurations
// =============================================================================

const STATUS_CONFIG = {
  not_started: {
    icon: NotStartedIcon,
    color: APP_COLORS.status.inactive,
    label: 'Не начат',
    description: 'Тест еще не запускался',
  },
  in_progress: {
    icon: InProgressIcon,
    color: APP_COLORS.accent.info,
    label: 'Выполняется',
    description: 'Тест в процессе выполнения',
  },
  passed: {
    icon: PassedIcon,
    color: APP_COLORS.status.active,
    label: 'Пройден',
    description: 'Тест выполнен успешно',
  },
  failed: {
    icon: FailedIcon,
    color: APP_COLORS.status.failed,
    label: 'Провален',
    description: 'Тест завершился с ошибкой',
  },
  blocked: {
    icon: BlockedIcon,
    color: APP_COLORS.accent.warning,
    label: 'Заблокирован',
    description: 'Тест заблокирован внешними факторами',
  },
  skipped: {
    icon: SkippedIcon,
    color: APP_COLORS.accent.secondary,
    label: 'Пропущен',
    description: 'Тест был пропущен',
  },
} as const;

// =============================================================================
// Component
// =============================================================================

export const TestExecutionStatusBadge: React.FC<TestExecutionStatusBadgeProps> = ({
  status,
  variant = 'filled',
  size = 'small',
  className,
  showIcon = true,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const IconComponent = config.icon;

  const getChipStyles = () => {
    const baseStyles = {
      fontWeight: 600,
      textTransform: 'none' as const,
      height: size === 'small' ? 24 : 32,
      fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      borderRadius: 2,
      '& .MuiChip-icon': {
        fontSize: size === 'small' ? '0.875rem' : '1rem',
        marginLeft: '6px',
      },
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: alpha(config.color, 0.12),
          color: config.color,
          border: `1px solid ${alpha(config.color, 0.2)}`,
          '& .MuiChip-icon': {
            ...baseStyles['& .MuiChip-icon'],
            color: config.color,
          },
        };
      
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: config.color,
          border: `1px solid ${alpha(config.color, 0.3)}`,
          '& .MuiChip-icon': {
            ...baseStyles['& .MuiChip-icon'],
            color: config.color,
          },
        };
      
      case 'minimal':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: config.color,
          border: 'none',
          '& .MuiChip-icon': {
            ...baseStyles['& .MuiChip-icon'],
            color: config.color,
          },
        };
      
      default:
        return baseStyles;
    }
  };

  const chipElement = (
    <Chip
      icon={showIcon ? <IconComponent /> : undefined}
      label={config.label}
      size={size}
      sx={getChipStyles()}
      className={className}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={config.description}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: theme.palette.grey[900],
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: 2,
              boxShadow: APP_COLORS.shadow.lg,
            },
          },
          arrow: {
            sx: {
              color: theme.palette.grey[900],
            },
          },
        }}
      >
        <Box component="span" sx={{ display: 'inline-block' }}>
          {chipElement}
        </Box>
      </Tooltip>
    );
  }

  return chipElement;
};