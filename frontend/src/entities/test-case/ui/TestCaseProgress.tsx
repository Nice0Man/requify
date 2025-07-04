import React from 'react';
import { Progress, Card, Row, Col, Statistic, Typography, Space, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface TestResultStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  skipped: number;
  pass_rate: number;
  execution_time?: number;
}

export interface TestCaseProgressProps {
  stats: TestResultStats;
  variant?: 'compact' | 'detailed' | 'dashboard';
  showDetails?: boolean;
  title?: string;
  className?: string;
}

const getProgressColor = (passRate: number): string => {
  if (passRate >= 90) return '#52c41a';
  if (passRate >= 75) return '#faad14';
  if (passRate >= 50) return '#fa8c16';
  return '#ff4d4f';
};

const formatExecutionTime = (seconds?: number): string => {
  if (!seconds) return 'N/A';
  
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

export const TestCaseProgress: React.FC<TestCaseProgressProps> = ({
  stats,
  variant = 'detailed',
  showDetails = true,
  title = 'Test Execution Progress',
  className
}) => {
  const renderProgressBar = () => (
    <Progress
      percent={stats.pass_rate}
      status={stats.pass_rate >= 75 ? 'success' : stats.pass_rate >= 50 ? 'active' : 'exception'}
      strokeColor={getProgressColor(stats.pass_rate)}
      size={variant === 'compact' ? 'small' : 'default'}
      format={(percent) => `${percent?.toFixed(1)}% Pass Rate`}
    />
  );

  const renderStats = () => (
    <Row gutter={[16, 16]}>
      <Col span={variant === 'compact' ? 12 : 6}>
        <Statistic
          title="Total Tests"
          value={stats.total}
          prefix={<TrophyOutlined />}
        />
      </Col>
      <Col span={variant === 'compact' ? 12 : 6}>
        <Statistic
          title="Passed"
          value={stats.passed}
          prefix={<CheckCircleOutlined />}
          valueStyle={{ color: '#52c41a' }}
        />
      </Col>
      <Col span={variant === 'compact' ? 12 : 6}>
        <Statistic
          title="Failed"
          value={stats.failed}
          prefix={<CloseCircleOutlined />}
          valueStyle={{ color: '#ff4d4f' }}
        />
      </Col>
      <Col span={variant === 'compact' ? 12 : 6}>
        <Statistic
          title="Pending"
          value={stats.pending}
          prefix={<ClockCircleOutlined />}
          valueStyle={{ color: '#faad14' }}
        />
      </Col>
      {variant !== 'compact' && (
        <>
          <Col span={6}>
            <Statistic
              title="Blocked"
              value={stats.blocked}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Skipped"
              value={stats.skipped}
              valueStyle={{ color: '#bfbfbf' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Pass Rate"
              value={stats.pass_rate}
              suffix="%"
              precision={1}
              valueStyle={{ color: getProgressColor(stats.pass_rate) }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Execution Time"
              value={formatExecutionTime(stats.execution_time)}
            />
          </Col>
        </>
      )}
    </Row>
  );

  const renderTags = () => (
    <Space wrap>
      <Tag color="success" icon={<CheckCircleOutlined />}>
        {stats.passed} Passed
      </Tag>
      {stats.failed > 0 && (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          {stats.failed} Failed
        </Tag>
      )}
      {stats.pending > 0 && (
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          {stats.pending} Pending
        </Tag>
      )}
      {stats.blocked > 0 && (
        <Tag color="default" icon={<ExclamationCircleOutlined />}>
          {stats.blocked} Blocked
        </Tag>
      )}
      {stats.skipped > 0 && (
        <Tag color="default">
          {stats.skipped} Skipped
        </Tag>
      )}
    </Space>
  );

  if (variant === 'compact') {
    return (
      <div className={className}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>{title}</Text>
          {renderProgressBar()}
          {showDetails && renderTags()}
        </Space>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Card className={className}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Title level={4}>{title}</Title>
          
          <div style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              percent={stats.pass_rate}
              status={stats.pass_rate >= 75 ? 'success' : stats.pass_rate >= 50 ? 'active' : 'exception'}
              strokeColor={getProgressColor(stats.pass_rate)}
              format={(percent) => (
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {percent?.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Pass Rate
                  </div>
                </div>
              )}
              size={120}
            />
          </div>

          {showDetails && (
            <>
              {renderTags()}
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Tests"
                    value={stats.total}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Execution Time"
                    value={formatExecutionTime(stats.execution_time)}
                  />
                </Col>
              </Row>
            </>
          )}
        </Space>
      </Card>
    );
  }

  // Default detailed variant
  return (
    <Card title={title} className={className}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {renderProgressBar()}
        
        {showDetails && (
          <>
            {renderStats()}
            
            <div>
              <Title level={5}>Summary</Title>
              {renderTags()}
            </div>
            
            {stats.execution_time && (
              <Text type="secondary">
                Total execution time: {formatExecutionTime(stats.execution_time)}
              </Text>
            )}
          </>
        )}
      </Space>
    </Card>
  );
};

export default TestCaseProgress; 