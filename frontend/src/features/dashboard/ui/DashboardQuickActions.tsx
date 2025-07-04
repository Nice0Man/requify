import React from 'react';
import { Card, Button, Space } from 'antd';
import { PlusOutlined, FileTextOutlined, ProjectOutlined, RocketOutlined } from '@ant-design/icons';

export const DashboardQuickActions: React.FC = () => {
  return (
    <Card title="Quick Actions" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" icon={<ProjectOutlined />} block>
          Create Project
        </Button>
        <Button icon={<FileTextOutlined />} block>
          New Requirement
        </Button>
        <Button icon={<RocketOutlined />} block>
          Create Release
        </Button>
        <Button icon={<PlusOutlined />} block>
          Add Test Case
        </Button>
      </Space>
    </Card>
  );
}; 