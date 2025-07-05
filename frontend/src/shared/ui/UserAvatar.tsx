import React from 'react';
import { Avatar, Badge } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

interface UserAvatarProps {
  user?: {
    id?: number | string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    is_active?: boolean;
  };
  size?: 'small' | 'medium' | 'large';
  showOnlineStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * UserAvatar - компонент для отображения аватара пользователя
 * Поддерживает разные размеры и отображение онлайн статуса
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'medium',
  showOnlineStatus = false,
  onClick,
  className,
}) => {
  // Определяем размеры для разных вариантов
  const sizes = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 56, height: 56 },
  };

  // Получаем инициалы пользователя
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const avatarElement = (
    <Avatar
      src={user?.avatar_url}
      sx={{
        ...sizes[size],
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: 'primary.main',
        fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.25rem' : '1rem',
      }}
      onClick={onClick}
      className={className}
    >
      {user?.avatar_url ? null : user ? getInitials() : <PersonIcon />}
    </Avatar>
  );

  // Если нужно показать онлайн статус, оборачиваем в Badge
  if (showOnlineStatus) {
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-dot': {
            backgroundColor: user?.is_active ? '#44b700' : '#999',
            color: user?.is_active ? '#44b700' : '#999',
            '&::after': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: user?.is_active ? 'ripple 1.2s infinite ease-in-out' : 'none',
              border: '1px solid currentColor',
              content: '""',
            },
          },
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(.8)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(2.4)',
              opacity: 0,
            },
          },
        }}
      >
        {avatarElement}
      </Badge>
    );
  }

  return avatarElement;
}; 