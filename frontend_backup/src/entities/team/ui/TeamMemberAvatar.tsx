import React, { memo } from 'react';
import {
  Avatar,
  Badge,
  Tooltip,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { TeamMember } from '../model/types';

export interface TeamMemberAvatarProps {
  /** Данные участника */
  member: TeamMember;
  /** Размер аватара */
  size?: 'small' | 'medium' | 'large';
  /** Показывать ли роль */
  showRole?: boolean;
  /** Показывать ли имя */
  showName?: boolean;
  /** Показывать ли статус онлайн */
  showOnlineStatus?: boolean;
  /** Обработчик клика */
  onClick?: (member: TeamMember) => void;
  /** Компактный режим */
  compact?: boolean;
}

/**
 * Получение иконки роли
 */
const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
    case 'admin':
      return <AdminIcon fontSize="inherit" />;
    case 'editor':
    case 'maintainer':
      return <EditIcon fontSize="inherit" />;
    case 'viewer':
    case 'guest':
      return <ViewIcon fontSize="inherit" />;
    default:
      return <PersonIcon fontSize="inherit" />;
  }
};

/**
 * Получение цвета роли
 */
const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'error';
    case 'admin':
      return 'warning';
    case 'editor':
    case 'maintainer':
      return 'primary';
    case 'viewer':
    case 'guest':
      return 'default';
    default:
      return 'secondary';
  }
};

/**
 * Получение размеров аватара
 */
const getAvatarSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return { width: 32, height: 32 };
    case 'medium':
      return { width: 40, height: 40 };
    case 'large':
      return { width: 56, height: 56 };
    default:
      return { width: 40, height: 40 };
  }
};

/**
 * Компонент аватара участника команды
 * Отображает аватар с ролью, статусом и дополнительной информацией
 */
export const TeamMemberAvatar = memo<TeamMemberAvatarProps>(({
  member,
  size = 'medium',
  showRole = false,
  showName = false,
  showOnlineStatus = false,
  onClick,
  compact = false,
}) => {
  const avatarSize = getAvatarSize(size);
  const isClickable = Boolean(onClick);

  const handleClick = () => {
    if (onClick) {
      onClick(member);
    }
  };

  // Генерация fallback инициалов
  const getInitials = (username: string) => {
    if (!username) return 'U';
    
    const words = username.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const avatarComponent = (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        showOnlineStatus ? (
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              border: '2px solid',
              borderColor: 'background.paper',
            }}
          />
        ) : undefined
      }
    >
      <Avatar
        src={member.avatar_url}
        alt={member.username}
        sx={{
          ...avatarSize,
          cursor: isClickable ? 'pointer' : 'default',
          '&:hover': isClickable ? {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          } : undefined,
        }}
        onClick={handleClick}
      >
        {getInitials(member.username || '')}
      </Avatar>
    </Badge>
  );

  if (compact) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {member.username || 'Участник'}
            </Typography>
            {member.role && (
              <Typography variant="caption" display="block">
                Роль: {member.role}
              </Typography>
            )}
          </Box>
        }
      >
        {avatarComponent}
      </Tooltip>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={showName || showRole ? 1 : 0}
      sx={{ cursor: isClickable ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      <Tooltip
        title={member.username || 'Участник'}
        placement="top"
      >
        {avatarComponent}
      </Tooltip>

      {(showName || showRole) && (
        <Box>
          {showName && (
            <Typography
              variant={size === 'small' ? 'caption' : 'body2'}
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}
            >
              {member.username || 'Участник'}
            </Typography>
          )}

          {showRole && member.role && (
            <Box mt={showName ? 0.5 : 0}>
              <Chip
                icon={getRoleIcon(member.role)}
                label={member.role}
                size="small"
                color={getRoleColor(member.role)}
                variant="outlined"
                sx={{
                  height: size === 'small' ? 20 : 24,
                  fontSize: size === 'small' ? '0.6rem' : '0.75rem',
                  '& .MuiChip-icon': {
                    fontSize: size === 'small' ? 12 : 14,
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

TeamMemberAvatar.displayName = 'TeamMemberAvatar'; 