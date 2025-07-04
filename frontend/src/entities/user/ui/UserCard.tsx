import React from 'react';
import { Card, Avatar, Typography, Tag, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { User } from '../model/types';
import { getUserFullName, getUserInitials, getUserStatusColor, getUserRoleColor, isUserActive } from '../model/types';

const { Text, Title } = Typography;

interface UserCardProps {
  user: User;
  size?: 'small' | 'default' | 'large';
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
  size = 'default',
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

  const avatarSize = size === 'small' ? 32 : size === 'large' ? 64 : 48;

  return (
    <Card
      size={size}
      hoverable={!!onClick}
      onClick={handleClick}
      className={className}
      bodyStyle={{ padding: size === 'small' ? 12 : 16 }}
    >
      <Space direction="horizontal" size="middle" style={{ width: '100%' }}>
        <Avatar
          size={avatarSize}
          icon={<UserOutlined />}
          style={{
            backgroundColor: isActive ? '#1890ff' : '#d9d9d9',
            color: '#fff',
          }}
        >
          {initials}
        </Avatar>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title 
            level={size === 'small' ? 5 : 4} 
            style={{ margin: 0, marginBottom: 4 }}
            ellipsis={{ tooltip: fullName }}
          >
            {fullName}
          </Title>
          
          {showEmail && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {user.email}
            </Text>
          )}
          
          <div style={{ marginTop: 8 }}>
            <Space size="small">
              {showStatus && (
                <Tag
                  color={getUserStatusColor(user.status)}
                  style={{ margin: 0 }}
                >
                  {user.status}
                </Tag>
              )}
              
              {showRole && (
                <Tag
                  color={getUserRoleColor(user.role)}
                  style={{ margin: 0 }}
                >
                  {user.role}
                </Tag>
              )}
            </Space>
          </div>
        </div>
      </Space>
    </Card>
  );
}; 