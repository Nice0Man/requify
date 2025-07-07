import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import { UserAvatar } from './UserAvatar';
import { UserStatus } from './UserStatus';
import type { User, UserWithDetails } from '../model/types';
import { getUserFullName, formatLastLogin, USER_ROLES } from '../model/types';

interface UserInfoProps {
  user: User | UserWithDetails;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  showAvatar?: boolean;
  showExtendedInfo?: boolean;
  columns?: number;
  className?: string;
}

/**
 * UserInfo - компонент для отображения подробной информации о пользователе
 * Используется в профилях, модальных окнах, карточках с детальной информацией
 */
export const UserInfo: React.FC<UserInfoProps> = ({
  user,
  layout = 'horizontal',
  size = 'medium',
  showAvatar = true,
  showExtendedInfo = false,
  columns = 1,
  className,
}) => {
  const fullName = getUserFullName(user);
  const userWithDetails = user as UserWithDetails;
  
  // Получаем читаемое название роли
  const getRoleLabel = () => {
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'Administrator';
      case USER_ROLES.MANAGER:
        return 'Manager';
      case USER_ROLES.ANALYST:
        return 'Analyst';
      case USER_ROLES.DEVELOPER:
        return 'Developer';
      case USER_ROLES.TESTER:
        return 'Tester';
      case USER_ROLES.CLIENT:
        return 'Client';
      case USER_ROLES.VIEWER:
        return 'Viewer';
      default:
        return user.role;
    }
  };

  const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box mb={layout === 'vertical' ? 2 : 1}>
      <Typography variant="body2" color="text.secondary" component="dt">
        {label}
      </Typography>
      <Typography variant="body1" component="dd" sx={{ mt: 0.5 }}>
        {children}
      </Typography>
    </Box>
  );

  const basicItems = [
    { label: 'Name', value: fullName },
    { label: 'Email', value: user.email },
    { label: 'Role', value: getRoleLabel() },
    { label: 'Status', value: <UserStatus user={user} variant="chip" size={size === 'small' ? 'small' : 'medium'} /> },
  ];

  const extendedItems = showExtendedInfo && userWithDetails ? [
    ...basicItems,
    ...(userWithDetails.department ? [{ label: 'Department', value: userWithDetails.department }] : []),
    ...(userWithDetails.last_login ? [{ label: 'Last Login', value: formatLastLogin(userWithDetails.last_login) }] : []),
    ...(userWithDetails.projects_managed !== undefined ? [{ label: 'Managed Projects', value: userWithDetails.projects_managed }] : []),
    ...(userWithDetails.projects_participating !== undefined ? [{ label: 'Participating Projects', value: userWithDetails.projects_participating }] : []),
    ...(userWithDetails.requirements_created !== undefined ? [{ label: 'Created Requirements', value: userWithDetails.requirements_created }] : []),
    { label: 'Registration Date', value: new Date(user.created_at).toLocaleDateString() },
  ] : basicItems;

  return (
    <Box className={className}>
      {showAvatar && (
        <Box mb={2} textAlign={layout === 'vertical' ? 'center' : 'left'}>
          <Box 
            display="flex" 
            flexDirection={layout === 'vertical' ? 'column' : 'row'} 
            alignItems="center" 
            gap={2}
          >
            <UserAvatar user={user} size="large" />
            <Box textAlign={layout === 'vertical' ? 'center' : 'left'}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}
      
      <Box component="dl" sx={{ margin: 0 }}>
        <Grid container spacing={layout === 'vertical' ? 2 : 1}>
          {extendedItems.map((item, index) => (
            <Grid item xs={12} sm={columns > 1 ? 12 / columns : 12} key={index}>
              <InfoItem label={item.label}>
                {item.value}
              </InfoItem>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}; 