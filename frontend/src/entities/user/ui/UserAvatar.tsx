import React from 'react';
import { Avatar, Badge, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { User } from '../model/types';
import { getUserFullName, getUserInitials, isUserActive } from '../model/types';

interface UserAvatarProps {
  user: User;
  size?: number | 'large' | 'small' | 'default';
  showOnlineStatus?: boolean;
  shape?: 'circle' | 'square';
  showTooltip?: boolean;
  onClick?: (user: User) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * UserAvatar - компонент для отображения аватара пользователя
 * Используется везде, где нужно показать аватар: в комментариях, списках, профилях и т.д.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'default',
  showOnlineStatus = false,
  shape = 'circle',
  showTooltip = true,
  onClick,
  className,
  style,
}) => {
  const fullName = getUserFullName(user);
  const initials = getUserInitials(user);
  const isActive = isUserActive(user);
  
  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  // Определяем цвет аватара на основе статуса пользователя
  const getAvatarColor = () => {
    if (!isActive) return '#d9d9d9';
    
    // Генерируем цвет на основе имени пользователя для консистентности
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#722ed1', '#eb2f96'];
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const avatarElement = (
    <Avatar
      size={size}
      shape={shape}
      icon={<UserOutlined />}
      style={{
        backgroundColor: getAvatarColor(),
        color: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
      onClick={handleClick}
    >
      {initials}
    </Avatar>
  );

  // Оборачиваем в Badge если нужно показать онлайн статус
  const avatarWithStatus = showOnlineStatus ? (
    <Badge
      status={isActive ? 'success' : 'default'}
      dot
      offset={[-8, size === 'small' ? 20 : size === 'large' ? 40 : 30]}
    >
      {avatarElement}
    </Badge>
  ) : (
    avatarElement
  );

  // Оборачиваем в Tooltip если нужно показать подсказку
  if (showTooltip) {
    return (
      <Tooltip 
        title={
          <div>
            <div>{fullName}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{user.email}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {user.role} • {user.status}
            </div>
          </div>
        }
      >
        {avatarWithStatus}
      </Tooltip>
    );
  }

  return avatarWithStatus;
}; 