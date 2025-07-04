import React from "react";
import { Card, Statistic, Row, Col, Progress, Tooltip } from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

interface SystemMetricsProps {
  metrics?: {
    totalUsers?: number;
    activeUsers?: number;
    totalProjects?: number;
    activeProjects?: number;
    totalRequirements?: number;
    completedRequirements?: number;
    inProgressRequirements?: number;
    totalIssues?: number;
    openIssues?: number;
    resolvedIssues?: number;
    criticalIssues?: number;
  };
  loading?: boolean;
  className?: string;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({
  metrics = {},
  loading = false,
  className,
}) => {
  const {
    totalUsers = 0,
    activeUsers = 0,
    totalProjects = 0,
    activeProjects = 0,
    totalRequirements = 0,
    completedRequirements = 0,
    inProgressRequirements = 0,
    totalIssues = 0,
    openIssues = 0,
    resolvedIssues = 0,
    criticalIssues = 0,
  } = metrics;

  const userActivityRate =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const projectActivityRate =
    totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0;
  const requirementCompletionRate =
    totalRequirements > 0
      ? Math.round((completedRequirements / totalRequirements) * 100)
      : 0;
  const issueResolutionRate =
    totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  return (
    <div className={className}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Users"
              value={totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tooltip title={`Active: ${activeUsers} / Total: ${totalUsers}`}>
                <Progress
                  percent={userActivityRate}
                  size="small"
                  format={() => `${userActivityRate}% active`}
                  strokeColor="#52c41a"
                />
              </Tooltip>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
              <TeamOutlined /> {activeUsers} active users
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Projects"
              value={totalProjects}
              prefix={<ProjectOutlined />}
              loading={loading}
              valueStyle={{ color: "#722ed1" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tooltip
                title={`Active: ${activeProjects} / Total: ${totalProjects}`}
              >
                <Progress
                  percent={projectActivityRate}
                  size="small"
                  format={() => `${projectActivityRate}% active`}
                  strokeColor="#722ed1"
                />
              </Tooltip>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
              <CheckCircleOutlined /> {activeProjects} active projects
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Requirements"
              value={totalRequirements}
              prefix={<FileTextOutlined />}
              loading={loading}
              valueStyle={{ color: "#13c2c2" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tooltip
                title={`Completed: ${completedRequirements} / Total: ${totalRequirements}`}
              >
                <Progress
                  percent={requirementCompletionRate}
                  size="small"
                  format={() => `${requirementCompletionRate}% done`}
                  strokeColor="#13c2c2"
                />
              </Tooltip>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
              <ClockCircleOutlined /> {inProgressRequirements} in progress
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Issues"
              value={totalIssues}
              prefix={<BugOutlined />}
              loading={loading}
              valueStyle={{ color: totalIssues > 0 ? "#f5222d" : "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tooltip
                title={`Resolved: ${resolvedIssues} / Total: ${totalIssues}`}
              >
                <Progress
                  percent={issueResolutionRate}
                  size="small"
                  format={() => `${issueResolutionRate}% resolved`}
                  strokeColor="#52c41a"
                />
              </Tooltip>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
              <ExclamationCircleOutlined
                style={{ color: criticalIssues > 0 ? "#f5222d" : "#666" }}
              />{" "}
              {criticalIssues} critical, {openIssues} open
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
