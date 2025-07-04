import React from 'react';
import { Row, Col, Card, Statistic, Spin, Alert } from 'antd';
import { 
  ProjectOutlined, 
  FileTextOutlined, 
  RocketOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useDashboard } from '../model';
import { ProjectCard } from '@/entities/project';
import { RequirementCard } from '@/entities/requirement';
import { UserAvatar } from '@/entities/user';

export interface DashboardOverviewProps {
  refreshInterval?: number;
  className?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  refreshInterval,
  className,
}) => {
  const { 
    overview, 
    activity, 
    notifications, 
    isLoading, 
    error, 
    refresh 
  } = useDashboard(refreshInterval);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Failed to load dashboard"
        description={error.message}
        type="error"
        showIcon
        action={
          <button onClick={refresh}>
            Retry
          </button>
        }
      />
    );
  }

  if (!overview) {
    return (
      <Alert
        message="No dashboard data available"
        type="info"
        showIcon
      />
    );
  }

  const { stats, my_projects, my_requirements, quick_stats } = overview;

  return (
    <div className={className}>
      {/* Quick Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.total_projects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Requirements"
              value={stats.total_requirements}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Releases"
              value={stats.total_releases}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats.active_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.requirements_completion_rate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Project Health"
              value={stats.project_health_score}
              suffix="/100"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ 
                color: stats.project_health_score >= 80 ? '#52c41a' : 
                       stats.project_health_score >= 60 ? '#fa8c16' : '#ff4d4f'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Test Coverage"
              value={stats.test_coverage}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Items"
              value={quick_stats.tasks_assigned_to_me}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* My Projects and Requirements */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="My Projects" size="small">
            {my_projects.length > 0 ? (
              my_projects.slice(0, 5).map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  variant="compact"
                  style={{ marginBottom: 8 }}
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                No projects assigned
              </p>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="My Requirements" size="small">
            {my_requirements.length > 0 ? (
              my_requirements.slice(0, 5).map(requirement => (
                <RequirementCard 
                  key={requirement.id} 
                  requirement={requirement}
                  variant="compact"
                  style={{ marginBottom: 8 }}
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                No requirements assigned
              </p>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Recent Activity" size="small">
            {activity.length > 0 ? (
              activity.slice(0, 10).map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <UserAvatar 
                    user={{ 
                      id: item.user_id, 
                      username: item.user_name,
                      avatar: item.user_avatar 
                    } as any}
                    size="small"
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    {item.description && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                No recent activity
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 