/**
 * Requirement Priority UI Component
 * Компонент для отображения приоритета требования
 */

import React, { memo } from 'react';
import { Chip, ChipProps } from '@mui/material';
import type { RequirementPriority } from '../model/types';

export interface RequirementPriorityProps extends Omit<ChipProps, 'label'> {
  priority: RequirementPriority;
  showIcon?: boolean;
}

/**
 * Получить цвет для приоритета
 */
const getPriorityColor = (priority: RequirementPriority): string => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800', 
    high: '#f44336',
    critical: '#9c27b0',
  };
  return colors[priority];
};

/**
 * Получить перевод приоритета
 */
const getPriorityLabel = (priority: RequirementPriority): string => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  };
  return labels[priority];
};

/**
 * Получить иконку для приоритета (emoji)
 */
const getPriorityIcon = (priority: RequirementPriority): string => {
  const icons = {
    low: '⬇️',
    medium: '➡️',
    high: '⬆️',
    critical: '🔥',
  };
  return icons[priority];
};

export const RequirementPriority = memo<RequirementPriorityProps>(({
  priority,
  showIcon = false,
  size = 'small',
  ...props
}) => {
  const label = showIcon 
    ? `${getPriorityIcon(priority)} ${getPriorityLabel(priority)}`
    : getPriorityLabel(priority);

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        backgroundColor: getPriorityColor(priority),
        color: 'white',
        fontWeight: 500,
        ...props.sx,
      }}
      {...props}
    />
  );
});

RequirementPriority.displayName = 'RequirementPriority'; 