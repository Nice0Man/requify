import React from 'react';
import { Tag, Badge } from 'antd';
import type { UserStatus as UserStatusType } from '../model/types';
import { USER_STATUSES, getUserStatusColor } from '../model/types';

interface UserStatusProps {
  status: UserStatusType;
  type?: 'tag' | 'badge' | 'dot';
  size?: 'small' | 'default';
  showText?: boolean;
  className?: string;
}

/**
 * UserStatus - компонент для отображения статуса пользователя
 * Может отображаться как Tag, Badge или просто цветная точка
 */
export const UserStatus: React.FC<UserStatusProps> = ({
  status,
  type = 'tag',
  size = 'default',
  showText = true,
  className,
}) => {
  const statusColor = getUserStatusColor(status);
  
  // Получаем читаемое название статуса
  const getStatusLabel = () => {
    switch (status) {
      case USER_STATUSES.ACTIVE as UserStatusType:
        return 'Активный';
      case USER_STATUSES.INACTIVE as UserStatusType:
        return 'Неактивный';
      case USER_STATUSES.PENDING as UserStatusType:
        return 'Ожидает';
      case USER_STATUSES.SUSPENDED as UserStatusType:
        return 'Заблокирован';
      case USER_STATUSES.DELETED as UserStatusType:
        return 'Удален';
      default:
        return status;
    }
  };

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