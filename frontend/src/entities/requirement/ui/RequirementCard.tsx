import React from 'react';
import { Card, Typography, Tag, Space, Avatar } from 'antd';
import { FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Requirement } from '../model/types';

const { Text, Title } = Typography;

interface RequirementCardProps {
  requirement: Requirement;
  size?: 'small' | 'default' | 'large';
  showPriority?: boolean;
  showStatus?: boolean;
  showDeadline?: boolean;
  onClick?: (requirement: Requirement) => void;
  className?: string;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  size = 'default',
  showPriority = true,
  showStatus = true,
  showDeadline = true,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(requirement);
    }
  };

  return (
    <Card
      size={size}
      hoverable={!!onClick}
      onClick={handleClick}
      className={className}
      bodyStyle={{ padding: size === 'small' ? 12 : 16 }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Space>
            <Avatar 
              icon={<FileTextOutlined />} 
              size="small" 
              style={{ backgroundColor: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              REQ-{requirement.id}
            </Text>
          </Space>
        </div>

        <Title 
          level={size === 'small' ? 5 : 4} 
          style={{ margin: 0, marginBottom: 8 }}
          ellipsis={{ tooltip: requirement.title }}
        >
          {requirement.title}
        </Title>

        {requirement.description && (
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {requirement.description}
          </Text>
        )}

        <div style={{ marginTop: 12 }}>
          <Space size="small" wrap>
            {showStatus && (
              <Tag color="blue">
                Статус: {requirement.status_id}
              </Tag>
            )}
            
            {showPriority && (
              <Tag color="orange">
                Приоритет: {requirement.priority_id}
              </Tag>
            )}
          </Space>
        </div>

        {showDeadline && requirement.deadline && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 4, color: '#999' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Срок: {new Date(requirement.deadline).toLocaleDateString('ru-RU')}
            </Text>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Создано: {new Date(requirement.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </div>
      </div>
    </Card>
  );
}; 