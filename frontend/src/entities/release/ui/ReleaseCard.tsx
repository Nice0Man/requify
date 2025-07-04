import React from 'react';
import { Card, Typography, Tag, Space, Progress } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import type { Release } from '../model/types';
import { getReleaseProgress, formatReleaseDate, getReleaseStatusColor } from '../model/types';

const { Text, Title } = Typography;

interface ReleaseCardProps {
  release: Release;
  size?: 'small' | 'default' | 'large';
  showProgress?: boolean;
  onClick?: (release: Release) => void;
  className?: string;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  size = 'default',
  showProgress = true,
  onClick,
  className,
}) => {
  const hasStats = 'total_requirements' in release;
  const progress = hasStats ? getReleaseProgress(release as any) : 0;

  return (
    <Card
      size={size}
      hoverable={!!onClick}
      onClick={() => onClick?.(release)}
      className={className}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <RocketOutlined style={{ color: getReleaseStatusColor(release.status as any) }} />
            <Tag color={getReleaseStatusColor(release.status as any)}>
              {release.status}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            v{release.version}
          </Text>
        </div>

        <Title level={4} style={{ margin: 0 }} ellipsis={{ tooltip: release.name }}>
          {release.name}
        </Title>

        {release.description && (
          <Text type="secondary" style={{ fontSize: '12px' }} ellipsis={{ rows: 2 }}>
            {release.description}
          </Text>
        )}

        {showProgress && hasStats && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: '12px' }}>Прогресс</Text>
              <Text style={{ fontSize: '12px' }}>{progress}%</Text>
            </div>
            <Progress percent={progress} size="small" />
          </div>
        )}

        {release.release_date && (
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Релиз: {formatReleaseDate(release.release_date)}
          </Text>
        )}
      </Space>
    </Card>
  );
}; 