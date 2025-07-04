import React from 'react';
import { Tag, Badge } from 'antd';
import type { ProjectStatus as ProjectStatusType } from '../model/types';
import { PROJECT_STATUSES } from '../model/types';

interface ProjectStatusProps {
  status: ProjectStatusType;
  type?: 'tag' | 'badge' | 'dot';
  size?: 'small' | 'default';
  showText?: boolean;
  className?: string;
}

/**
 * ProjectStatus - компонент для отображения статуса проекта
 * Может отображаться как Tag, Badge или просто цветная точка
 */
export const ProjectStatus: React.FC<ProjectStatusProps> = ({
  status,
  type = 'tag',
  size = 'default',
  showText = true,
  className,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return '#52c41a';
      case 'completed': return '#1890ff';
      case 'planning': return '#fadb14';
      case 'development': return '#13c2c2';
      case 'testing': return '#fa8c16';
      case 'inactive': return '#8c8c8c';
      case 'archived': return '#d9d9d9';
      case 'cancelled': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusLabel = () => {
    if (PROJECT_STATUSES[status]) {
      return PROJECT_STATUSES[status];
    }
    
    // Fallback for manual translation
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      case 'planning': return 'Планирование';
      case 'development': return 'Разработка';
      case 'testing': return 'Тестирование';
      case 'inactive': return 'Неактивный';
      case 'archived': return 'Архивирован';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const statusColor = getStatusColor();
  const statusLabel = getStatusLabel();

  if (type === 'tag') {
    return (
      <Tag
        color={statusColor}
        className={className}
        style={{ 
          fontSize: size === 'small' ? '11px' : '12px',
          margin: 0,
        }}
      >
        {showText ? statusLabel : ''}
      </Tag>
    );
  }

  if (type === 'badge') {
    return (
      <Badge
        color={statusColor}
        text={showText ? statusLabel : ''}
        className={className}
        style={{ fontSize: size === 'small' ? '11px' : '12px' }}
      />
    );
  }

  if (type === 'dot') {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span
          style={{
            width: size === 'small' ? 6 : 8,
            height: size === 'small' ? 6 : 8,
            borderRadius: '50%',
            backgroundColor: statusColor,
            display: 'inline-block',
          }}
        />
        {showText && (
          <span style={{ fontSize: size === 'small' ? '11px' : '12px' }}>
            {statusLabel}
          </span>
        )}
      </span>
    );
  }

  return null;
}; 