import React from 'react';
import { Tag, Badge } from 'antd';

interface RequirementStatusProps {
  statusId: number;
  statusName?: string;
  type?: 'tag' | 'badge' | 'dot';
  size?: 'small' | 'default';
  showText?: boolean;
  className?: string;
}

export const RequirementStatus: React.FC<RequirementStatusProps> = ({
  statusId,
  statusName,
  type = 'tag',
  size = 'default',
  showText = true,
  className,
}) => {
  const getStatusColor = () => {
    // Simple color mapping based on status ID
    const colors = ['#52c41a', '#1890ff', '#fadb14', '#ff4d4f', '#8c8c8c'];
    return colors[statusId % colors.length] || '#d9d9d9';
  };

  const statusLabel = statusName || `Статус ${statusId}`;
  const statusColor = getStatusColor();

  if (type === 'tag') {
    return (
      <Tag color={statusColor} className={className} style={{ fontSize: size === 'small' ? '11px' : '12px', margin: 0 }}>
        {showText ? statusLabel : ''}
      </Tag>
    );
  }

  if (type === 'badge') {
    return (
      <Badge color={statusColor} text={showText ? statusLabel : ''} className={className} />
    );
  }

  if (type === 'dot') {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: size === 'small' ? 6 : 8, height: size === 'small' ? 6 : 8, borderRadius: '50%', backgroundColor: statusColor }} />
        {showText && <span style={{ fontSize: size === 'small' ? '11px' : '12px' }}>{statusLabel}</span>}
      </span>
    );
  }

  return null;
}; 