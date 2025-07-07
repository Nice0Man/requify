import React from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Tag,
  Badge,
  Button,
  Tooltip,
} from "antd";
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
  BugOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { TestCaseStatus } from "./TestCaseStatus";

const { Title, Text, Paragraph } = Typography;

export interface TestCase {
  id: number;
  title: string;
  description?: string;
  test_plan_id?: number;
  test_plan_name?: string;
  requirement_id?: number;
  requirement_title?: string;
  priority: string;
  type: string;
  status: string;
  estimated_duration?: number;
  actual_duration?: number;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  steps?: Array<{
    id: number;
    step_number: number;
    action: string;
    expected_result: string;
    actual_result?: string;
    status?: string;
  }>;
  tags?: string[];
  attachments?: Array<{
    id: number;
    filename: string;
    size: number;
    url: string;
  }>;
}

export interface TestCaseInfoProps {
  testCase: TestCase;
  variant?: "card" | "inline" | "detailed";
  showActions?: boolean;
  onEdit?: () => void;
  onExecute?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "#ff4d4f";
    case "high":
      return "#fa8c16";
    case "medium":
      return "#faad14";
    case "low":
      return "#52c41a";
    default:
      return "#d9d9d9";
  }
};

const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case "functional":
      return "#1890ff";
    case "integration":
      return "#722ed1";
    case "performance":
      return "#eb2f96";
    case "security":
      return "#f5222d";
    case "usability":
      return "#52c41a";
    case "regression":
      return "#fa8c16";
    default:
      return "#8c8c8c";
  }
};

const formatDuration = (minutes?: number): string => {
  if (!minutes) return "Not set";

  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

export const TestCaseInfo: React.FC<TestCaseInfoProps> = ({
  testCase,
  variant = "card",
  showActions = true,
  onEdit,
  onExecute,
  onViewHistory,
  className,
}) => {
  const renderActions = () => {
    if (!showActions) return null;

    return (
      <Space>
        {onExecute && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onExecute}
            disabled={testCase.status === "running"}
          >
            Execute
          </Button>
        )}
        {onEdit && (
          <Button icon={<InfoCircleOutlined />} onClick={onEdit}>
            Edit
          </Button>
        )}
        {onViewHistory && (
          <Button icon={<HistoryOutlined />} onClick={onViewHistory}>
            History
          </Button>
        )}
      </Space>
    );
  };

  const renderBasicInfo = () => (
    <Descriptions column={variant === "detailed" ? 2 : 1} size="small">
      <Descriptions.Item label="Status">
        <TestCaseStatus status={testCase.status} />
      </Descriptions.Item>

      <Descriptions.Item label="Priority">
        <Tag color={getPriorityColor(testCase.priority)}>
          {testCase.priority}
        </Tag>
      </Descriptions.Item>

      <Descriptions.Item label="Type">
        <Tag color={getTypeColor(testCase.type)}>{testCase.type}</Tag>
      </Descriptions.Item>

      {testCase.assigned_to_name && (
        <Descriptions.Item label="Assigned To">
          <Space>
            <UserOutlined />
            <Text>{testCase.assigned_to_name}</Text>
          </Space>
        </Descriptions.Item>
      )}

      <Descriptions.Item label="Duration">
        <Space>
          <ClockCircleOutlined />
          <Text>Est: {formatDuration(testCase.estimated_duration)}</Text>
          {testCase.actual_duration && (
            <Text type="secondary">
              | Act: {formatDuration(testCase.actual_duration)}
            </Text>
          )}
        </Space>
      </Descriptions.Item>

      {testCase.requirement_title && (
        <Descriptions.Item label="Requirement">
          <Text strong>{testCase.requirement_title}</Text>
        </Descriptions.Item>
      )}

      {testCase.test_plan_name && (
        <Descriptions.Item label="Test Plan">
          <Text>{testCase.test_plan_name}</Text>
        </Descriptions.Item>
      )}

      <Descriptions.Item label="Created By">
        <Text type="secondary">{testCase.created_by_name || "Unknown"}</Text>
      </Descriptions.Item>
    </Descriptions>
  );

  const renderSteps = () => {
    if (!testCase.steps || testCase.steps.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>Test Steps</Title>
        {testCase.steps.map((step, index) => (
          <Card
            key={step.id}
            size="small"
            style={{ marginBottom: 8 }}
            title={`Step ${step.step_number}`}
            extra={
              step.status && (
                <TestCaseStatus status={step.status} size="small" />
              )
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Action:</Text>
                <Paragraph style={{ marginBottom: 8, marginLeft: 8 }}>
                  {step.action}
                </Paragraph>
              </div>
              <div>
                <Text strong>Expected Result:</Text>
                <Paragraph style={{ marginBottom: 8, marginLeft: 8 }}>
                  {step.expected_result}
                </Paragraph>
              </div>
              {step.actual_result && (
                <div>
                  <Text strong>Actual Result:</Text>
                  <Paragraph style={{ marginBottom: 0, marginLeft: 8 }}>
                    {step.actual_result}
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>
        ))}
      </div>
    );
  };

  const renderTags = () => {
    if (!testCase.tags || testCase.tags.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Space wrap>
          <TagOutlined />
          {testCase.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Space>
      </div>
    );
  };

  const content = (
    <div className={className}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {testCase.description && <Paragraph>{testCase.description}</Paragraph>}

        {renderBasicInfo()}

        {variant === "detailed" && renderSteps()}
        {variant === "detailed" && renderTags()}

        {testCase.attachments && testCase.attachments.length > 0 && (
          <div>
            <Text strong>Attachments: </Text>
            <Badge count={testCase.attachments.length} />
          </div>
        )}

        {showActions && renderActions()}
      </Space>
    </div>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Card
      title={
        <Space>
          <BugOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {testCase.title}
          </Title>
        </Space>
      }
      extra={<TestCaseStatus status={testCase.status} />}
      className={className}
    >
      {content}
    </Card>
  );
};

export default TestCaseInfo;
