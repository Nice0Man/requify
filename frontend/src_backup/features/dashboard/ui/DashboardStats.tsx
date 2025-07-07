import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { useDashboardStats } from '../model';

export interface DashboardStatsProps {
  projectId?: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ projectId }) => {
  const { stats, isLoading } = useDashboardStats(projectId);

  if (isLoading || !stats) {
    return <Card loading={true} />;
  }

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic title="Projects" value={stats.total_projects} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Requirements" value={stats.total_requirements} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Releases" value={stats.total_releases} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Users" value={stats.total_users} />
        </Card>
      </Col>
    </Row>
  );
}; 