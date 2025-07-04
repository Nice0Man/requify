import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import type { TestCase } from '../model/types';
import { getTestStatusColor, getTestPriorityColor } from '../model/types';

const { Text, Title } = Typography;

interface TestCaseCardProps {
  testCase: TestCase;
  size?: 'small' | 'default' | 'large';
  onClick?: (testCase: TestCase) => void;
  className?: string;
}

export const TestCaseCard: React.FC<TestCaseCardProps> = ({
  testCase,
  size = 'default',
  onClick,
  className,
}) => {
  return (
    <Card
      size={size}
      hoverable={!!onClick}
      onClick={() => onClick?.(testCase)}
      className={className}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ExperimentOutlined style={{ color: getTestStatusColor(testCase.status) }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              TC-{testCase.id}
            </Text>
          </Space>
        </div>

        <Title level={4} style={{ margin: 0 }} ellipsis={{ tooltip: testCase.name }}>
          {testCase.name}
        </Title>

        {testCase.description && (
          <Text type="secondary" style={{ fontSize: '12px' }} ellipsis={{ rows: 2 }}>
            {testCase.description}
          </Text>
        )}

        <Space size="small" wrap>
          <Tag color={getTestStatusColor(testCase.status)}>
            {testCase.status}
          </Tag>
          <Tag color={getTestPriorityColor(testCase.priority)}>
            {testCase.priority}
          </Tag>
          <Tag>{testCase.type}</Tag>
        </Space>
      </Space>
    </Card>
  );
}; 