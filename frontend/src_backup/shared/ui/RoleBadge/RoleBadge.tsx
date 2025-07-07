import React from 'react';
import { Chip } from '@mui/material';
import {
  AdminPanelSettings,
  PersonOutline,
  Build,
  Analytics,
  BugReport,
  Visibility,
  Business,
} from '@mui/icons-material';

export type UserRole = 'admin' | 'manager' | 'analyst' | 'developer' | 'tester' | 'client' | 'viewer';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showIcon?: boolean;
  className?: string;
}

/**
 * RoleBadge - компонент для отображения роли пользователя
 * Показывает роль с соответствующим цветом и иконкой
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'small',
  variant = 'filled',
  showIcon = true,
  className,
}) => {
  // Конфигурация ролей
  const roleConfig = {
    admin: {
      label: 'Administrator',
      color: '#d32f2f' as const,
      icon: <AdminPanelSettings fontSize="small" />,
    },
    manager: {
      label: 'Manager',
      color: '#7b1fa2' as const,
      icon: <Business fontSize="small" />,
    },
    analyst: {
      label: 'Analyst',
      color: '#1976d2' as const,
      icon: <Analytics fontSize="small" />,
    },
    developer: {
      label: 'Developer',
      color: '#388e3c' as const,
      icon: <Build fontSize="small" />,
    },
    tester: {
      label: 'Tester',
      color: '#f57c00' as const,
      icon: <BugReport fontSize="small" />,
    },
    client: {
      label: 'Client',
      color: '#0288d1' as const,
      icon: <PersonOutline fontSize="small" />,
    },
    viewer: {
      label: 'Viewer',
      color: '#616161' as const,
      icon: <Visibility fontSize="small" />,
    },
  };

  const config = roleConfig[role] || roleConfig.viewer;

  return (
    <Chip
      icon={showIcon ? config.icon : undefined}
      label={config.label}
      size={size}
      variant={variant}
      className={className}
      sx={{
        backgroundColor: variant === 'filled' ? config.color : 'transparent',
        color: variant === 'filled' ? 'white' : config.color,
        borderColor: variant === 'outlined' ? config.color : undefined,
        '& .MuiChip-icon': {
          color: variant === 'filled' ? 'white' : config.color,
        },
        fontWeight: 500,
      }}
    />
  );
}; 