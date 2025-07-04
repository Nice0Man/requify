import React from 'react';
import { Descriptions, Space, Typography } from 'antd';
import { UserAvatar } from './UserAvatar';
import { UserStatus } from './UserStatus';
import type { User, UserWithDetails } from '../model/types';
import { getUserFullName, formatLastLogin, USER_ROLES } from '../model/types';

const { Text, Title } = Typography;

interface UserInfoProps {
  user: User | UserWithDetails;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'default';
  showAvatar?: boolean;
  showExtendedInfo?: boolean;
  column?: number;
  className?: string;
}

/**
 * UserInfo - компонент для отображения подробной информации о пользователе
 * Используется в профилях, модальных окнах, карточках с детальной информацией
 */
export const UserInfo: React.FC<UserInfoProps> = ({
  user,
  layout = 'horizontal',
  size = 'default',
  showAvatar = true,
  showExtendedInfo = false,
  column = 1,
  className,
}) => {
  const fullName = getUserFullName(user);
  const userWithDetails = user as UserWithDetails;
  
  // Получаем читаемое название роли
  const getRoleLabel = () => {
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'Администратор';
      case USER_ROLES.MANAGER:
        return 'Менеджер';
      case USER_ROLES.ANALYST:
        return 'Аналитик';
      case USER_ROLES.DEVELOPER:
        return 'Разработчик';
      case USER_ROLES.TESTER:
        return 'Тестировщик';
      case USER_ROLES.CLIENT:
        return 'Клиент';
      case USER_ROLES.VIEWER:
        return 'Наблюдатель';
      default:
        return user.role;
    }
  };

  const basicItems = [
    {
      key: 'name',
      label: 'Имя',
      children: fullName,
    },
    {
      key: 'email',
      label: 'Email',
      children: user.email,
    },
    {
      key: 'role',
      label: 'Роль',
      children: getRoleLabel(),
    },
    {
      key: 'status',
      label: 'Статус',
      children: <UserStatus status={user.status} />,
    },
  ];

  const extendedItems = showExtendedInfo && userWithDetails ? [
    ...basicItems,
    ...(userWithDetails.department ? [{
      key: 'department',
      label: 'Отдел',
      children: userWithDetails.department,
    }] : []),
    ...(userWithDetails.last_login ? [{
      key: 'lastLogin',
      label: 'Последний вход',
      children: formatLastLogin(userWithDetails.last_login),
    }] : []),
    ...(userWithDetails.projects_managed !== undefined ? [{
      key: 'projectsManaged',
      label: 'Управляет проектами',
      children: userWithDetails.projects_managed,
    }] : []),
    ...(userWithDetails.projects_participating !== undefined ? [{
      key: 'projectsParticipating',
      label: 'Участвует в проектах',
      children: userWithDetails.projects_participating,
    }] : []),
    ...(userWithDetails.requirements_created !== undefined ? [{
      key: 'requirementsCreated',
      label: 'Создано требований',
      children: userWithDetails.requirements_created,
    }] : []),
    {
      key: 'createdAt',
      label: 'Дата регистрации',
      children: new Date(user.created_at).toLocaleDateString('ru-RU'),
    },
  ] : basicItems;

  return (
    <div className={className}>
      {showAvatar && (
        <div style={{ marginBottom: 16, textAlign: layout === 'vertical' ? 'center' : 'left' }}>
          <Space direction={layout === 'vertical' ? 'vertical' : 'horizontal'} align="center">
            <UserAvatar user={user} size="large" />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {fullName}
              </Title>
              <Text type="secondary">{user.email}</Text>
            </div>
          </Space>
        </div>
      )}
      
      <Descriptions
        layout={layout}
        size={size}
        column={column}
        items={extendedItems}
        bordered={layout === 'vertical'}
      />
    </div>
  );
}; 