import React from 'react';
import { Card, CardContent, Avatar, Typography, Chip, Box } from '@mui/material';
import { Person as UserOutlined } from '@mui/icons-material';
import type { User } from '../model/types';
import { getUserFullName, getUserInitials, getUserStatusColor, getUserRoleColor, isUserActive } from '../model/types';

interface UserCardProps {
  user: User;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  showRole?: boolean;
  showEmail?: boolean;
  onClick?: (user: User) => void;
  className?: string;
}

/**
 * UserCard - компонент для отображения карточки пользователя
 * Используется в списках, селекторах и других местах для показа базовой информации о пользователе
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  size = 'medium',
  showStatus = true,
  showRole = true,
  showEmail = true,
  onClick,
  className,
}) => {
  const fullName = getUserFullName(user);
  const initials = getUserInitials(user);
  const isActive = isUserActive(user);
  
  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  const getAvatarSize = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32 };
      case 'medium': return { width: 48, height: 48 };
      case 'large': return { width: 64, height: 64 };
      default: return { width: 48, height: 48 };
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return 1;
      case 'medium': return 2;
      case 'large': return 3;
      default: return 2;
    }
  };

  return (
    <Card
      className={className}
      onClick={handleClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: 2,
        } : undefined,
      }}
    >
      <CardContent sx={{ padding: getPadding() }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              ...getAvatarSize(),
              backgroundColor: isActive ? 'primary.main' : 'grey.400',
              color: 'white',
            }}
            src={user.avatar_url}
          >
            {user.avatar_url ? null : initials || <UserOutlined />}
          </Avatar>
          
          <Box flex={1} minWidth={0}>
            <Typography 
              variant={size === 'small' ? 'body2' : 'h6'}
              fontWeight={600}
              noWrap
              title={fullName}
            >
              {fullName}
            </Typography>
            
            {showEmail && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                display="block"
              >
                {user.email}
              </Typography>
            )}
            
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              {showStatus && (
                <Chip
                  label={user.status}
                  size="small"
                  sx={{
                    backgroundColor: getUserStatusColor(user.status),
                    color: 'white',
                    fontSize: '11px',
                  }}
                />
              )}
              
              {showRole && (
                <Chip
                  label={user.role}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: getUserRoleColor(user.role),
                    color: getUserRoleColor(user.role),
                    fontSize: '11px',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 