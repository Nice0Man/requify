import React from 'react';
import { Tag, Badge } from 'antd';

interface RequirementPriorityProps {
  priorityId: number;
  priorityName?: string;
  type?: 'tag' | 'badge' | 'dot';
  size?: 'small' | 'default';
  showText?: boolean;
  className?: string;
}

export const RequirementPriority: React.FC<RequirementPriorityProps> = ({
  priorityId,
  priorityName,
  type = 'tag',
  size = 'default',
  showText = true,
  className,
}) => {
  const getPriorityColor = () => {
    // Priority color mapping: low to critical
    const colors = ['#52c41a', '#fadb14', '#fa8c16', '#ff4d4f'];
    return colors[priorityId % colors.length] || '#d9d9d9';
  };

  const priorityLabel = priorityName || `Приоритет ${priorityId}`;
  const priorityColor = getPriorityColor();

  if (type === 'tag') {
    return (
      <Tag color={priorityColor} className={className} style={{ fontSize: size === 'small' ? '11px' : '12px', margin: 0 }}>
        {showText ? priorityLabel : ''}
      </Tag>
    );
  }

  if (type === 'badge') {
    return (
      <Badge color={priorityColor} text={showText ? priorityLabel : ''} className={className} />
    );
  }

  if (type === 'dot') {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: size === 'small' ? 6 : 8, height: size === 'small' ? 6 : 8, borderRadius: '50%', backgroundColor: priorityColor }} />
        {showText && <span style={{ fontSize: size === 'small' ? '11px' : '12px' }}>{priorityLabel}</span>}
      </span>
    );
  }

  return null;
}; 