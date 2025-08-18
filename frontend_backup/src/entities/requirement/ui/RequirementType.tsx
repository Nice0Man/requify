/**
 * Requirement Type UI Component
 * Компонент для отображения типа требования
 */

import React, { memo } from 'react';
import { Chip, ChipProps } from '@mui/material';
import type { RequirementType } from '../model/types';

export interface RequirementTypeProps extends Omit<ChipProps, 'label'> {
  type: RequirementType;
  showIcon?: boolean;
}

/**
 * Получить цвет для типа
 */
const getTypeColor = (type: RequirementType): string => {
  const colors = {
    functional: '#2196f3',
    non_functional: '#ff9800',
    business: '#4caf50',
    user_story: '#9c27b0',
    epic: '#f44336',
  };
  return colors[type];
};

/**
 * Получить перевод типа
 */
const getTypeLabel = (type: RequirementType): string => {
  const labels = {
    functional: 'Функциональное',
    non_functional: 'Нефункциональное',
    business: 'Бизнес',
    user_story: 'Пользовательская история',
    epic: 'Эпик',
  };
  return labels[type];
};

/**
 * Получить иконку для типа (emoji)
 */
const getTypeIcon = (type: RequirementType): string => {
  const icons = {
    functional: '⚙️',
    non_functional: '🛡️',
    business: '💼',
    user_story: '👤',
    epic: '🎯',
  };
  return icons[type];
};

export const RequirementType = memo<RequirementTypeProps>(({
  type,
  showIcon = false,
  size = 'small',
  variant = 'outlined',
  ...props
}) => {
  const label = showIcon 
    ? `${getTypeIcon(type)} ${getTypeLabel(type)}`
    : getTypeLabel(type);

  return (
    <Chip
      label={label}
      size={size}
      variant={variant}
      sx={{
        borderColor: getTypeColor(type),
        color: getTypeColor(type),
        '&.MuiChip-filled': {
          backgroundColor: getTypeColor(type),
          color: 'white',
        },
        ...props.sx,
      }}
      {...props}
    />
  );
});

RequirementType.displayName = 'RequirementType'; 