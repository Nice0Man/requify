import React from 'react';
import { Tag, Badge } from 'antd';

interface ReleaseStatusProps {
  status: string;
  type?: 'tag' | 'badge' | 'dot';
  size?: 'small' | 'default';
  showText?: boolean;
  className?: string;
}

export const ReleaseStatus: React.FC<ReleaseStatusProps> = ({
  status,
  type = 'tag',
  size = 'default',
  showText = true,
  className,
}) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'draft': return '#8c8c8c';
      case 'planned': return '#1890ff';
      case 'in_progress': return '#fadb14';
      case 'testing': return '#fa8c16';
      case 'ready': return '#722ed1';
      case 'published': return '#52c41a';
      case 'released': return '#389e0d';
      case 'cancelled': return '#ff4d4f';
      case 'planning': return '#13c2c2';
      default: return '#d9d9d9';
    }
  };

  const getStatusLabel = () => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'Draft';
      case 'planned': return 'Planned';
      case 'in_progress': return 'In Progress';
      case 'testing': return 'Testing';
      case 'ready': return 'Ready';
      case 'published': return 'Published';
      case 'released': return 'Released';
      case 'cancelled': return 'Cancelled';
      case 'planning': return 'Planning';
      default: return status || 'Unknown';
    }
  };

  const statusColor = getStatusColor();
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