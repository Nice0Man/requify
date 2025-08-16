/**
 * Requirement Status UI Component
 * Компонент для отображения статуса требования
 */

import React, { memo } from 'react';
import { Chip, ChipProps } from '@mui/material';
import type { RequirementStatus } from '../model/types';

export interface RequirementStatusProps extends Omit<ChipProps, 'label'> {
  status: RequirementStatus;
  showIcon?: boolean;
}

/**
 * Получить цвет для статуса
 */
const getStatusColor = (status: RequirementStatus): string => {
  const colors = {
    draft: '#9e9e9e',
    review: '#2196f3',
    approved: '#4caf50',
    in_development: '#ff9800',
    testing: '#9c27b0',
    completed: '#4caf50',
    rejected: '#f44336',
  };
  return colors[status];
};

/**
 * Получить перевод статуса
 */
const getStatusLabel = (status: RequirementStatus): string => {
  const labels = {
    draft: 'Черновик',
    review: 'На проверке',
    approved: 'Утвержден',
    in_development: 'В разработке',
    testing: 'Тестирование',
    completed: 'Выполнен',
    rejected: 'Отклонен',
  };
  return labels[status];
};

/**
 * Получить иконку для статуса (emoji)
 */
const getStatusIcon = (status: RequirementStatus): string => {
  const icons = {
    draft: '📝',
    review: '👁️',
    approved: '✅',
    in_development: '⚙️',
    testing: '🧪',
    completed: '✅',
    rejected: '❌',
  };
  return icons[status];
};

export const RequirementStatus = memo<RequirementStatusProps>(({
  status,
  showIcon = false,
  size = 'small',
  ...props
}) => {
  const label = showIcon 
    ? `${getStatusIcon(status)} ${getStatusLabel(status)}`
    : getStatusLabel(status);

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        backgroundColor: getStatusColor(status),
        color: 'white',
        fontWeight: 500,
        ...props.sx,
      }}
      {...props}
    />
  );
});

RequirementStatus.displayName = 'RequirementStatus'; 