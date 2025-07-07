import React from 'react';
import { Descriptions, Space, Typography, Avatar } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { ReleaseStatus } from './ReleaseStatus';
import { ReleaseProgress } from './ReleaseProgress';
import type { Release } from '../model/types';

const { Text, Title } = Typography;

interface ReleaseInfoProps {
  release: Release & { 
    project_name?: string;
    total_requirements?: number;
    completed_requirements?: number;
    progress?: number;
  };
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'default';
  showProgress?: boolean;
  showExtendedInfo?: boolean;
  column?: number;
  className?: string;
}

export const ReleaseInfo: React.FC<ReleaseInfoProps> = ({
  release,
  layout = 'horizontal',
  size = 'default',
  showProgress = true,
  showExtendedInfo = false,
  column = 1,
  className,
}) => {
  const getStatusColor = () => {
    switch (release.status?.toLowerCase()) {
      case 'draft': return '#8c8c8c';
      case 'planned': return '#1890ff';
      case 'in_progress': return '#fadb14';
      case 'testing': return '#fa8c16';
      case 'ready': return '#722ed1';
      case 'published': return '#52c41a';
      case 'released': return '#389e0d';
      case 'cancelled': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const basicItems = [
    {
      key: 'name',
      label: 'Release Name',
      children: release.name,
      span: column > 1 ? column : 1,
    },
    {
      key: 'version',
      label: 'Version',
      children: release.version,
    },
    {
      key: 'status',
      label: 'Status',
      children: <ReleaseStatus status={release.status} />,
    },
    ...(release.description ? [{
      key: 'description',
      label: 'Description',
      children: release.description,
      span: column > 1 ? column : 1,
    }] : []),
    ...(release.project_name ? [{
      key: 'project',
      label: 'Project',
      children: release.project_name,
    }] : []),
  ];

  const extendedItems = showExtendedInfo ? [
    ...basicItems,
    ...(release.planned_date ? [{
      key: 'planned_date',
      label: 'Planned Date',
      children: new Date(release.planned_date).toLocaleDateString(),
    }] : []),
    ...(release.release_date ? [{
      key: 'release_date',
      label: 'Release Date',
      children: new Date(release.release_date).toLocaleDateString(),
    }] : []),
    ...(release.total_requirements ? [{
      key: 'requirements',
      label: 'Requirements',
      children: `${release.completed_requirements || 0} / ${release.total_requirements}`,
    }] : []),
    {
      key: 'created_at',
      label: 'Created',
      children: new Date(release.created_at).toLocaleDateString(),
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      children: new Date(release.updated_at).toLocaleDateString(),
    },
  ] : basicItems;

  return (
    <div className={className}>
      <div
        style={{
          marginBottom: 16,
          textAlign: layout === 'vertical' ? 'center' : 'left',
        }}
      >
        <Space
          direction={layout === 'vertical' ? 'vertical' : 'horizontal'}
          align="center"
          size="large"
        >
          <Avatar
            size={layout === 'vertical' ? 'large' : 'default'}
            icon={<RocketOutlined />}
            style={{ backgroundColor: getStatusColor() }}
          />
          <div>
            <Title level={layout === 'vertical' ? 3 : 4} style={{ margin: 0 }}>
              {release.name}
            </Title>
            <Text type="secondary">v{release.version}</Text>
          </div>
        </Space>
      </div>

      {showProgress && (release.total_requirements || release.progress !== undefined) && (
        <div style={{ marginBottom: 16 }}>
          <ReleaseProgress
            release={release}
            size={size === 'small' ? 'small' : 'default'}
            format="line"
          />
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