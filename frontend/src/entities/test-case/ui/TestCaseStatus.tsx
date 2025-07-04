import React from "react";
import { Badge, Tag, Button } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { SizeType } from "antd/es/config-provider/SizeContext";

export interface TestCaseStatusProps {
  status: string;
  size?: "small" | "default" | "large";
  variant?: "tag" | "badge" | "button" | "text";
  showIcon?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

const TEST_STATUS_CONFIG = {
  passed: {
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    text: "Passed",
    tagColor: "success",
  },
  failed: {
    color: "#ff4d4f",
    icon: <CloseCircleOutlined />,
    text: "Failed",
    tagColor: "error",
  },
  pending: {
    color: "#faad14",
    icon: <ClockCircleOutlined />,
    text: "Pending",
    tagColor: "warning",
  },
  running: {
    color: "#1890ff",
    icon: <PlayCircleOutlined />,
    text: "Running",
    tagColor: "processing",
  },
  blocked: {
    color: "#8c8c8c",
    icon: <ExclamationCircleOutlined />,
    text: "Blocked",
    tagColor: "default",
  },
  cancelled: {
    color: "#d9d9d9",
    icon: <PauseCircleOutlined />,
    text: "Cancelled",
    tagColor: "default",
  },
  skipped: {
    color: "#bfbfbf",
    icon: <PauseCircleOutlined />,
    text: "Skipped",
    tagColor: "default",
  },
} as const;

export const TestCaseStatus: React.FC<TestCaseStatusProps> = ({
  status,
  size = "default",
  variant = "tag",
  showIcon = true,
  clickable = false,
  onClick,
  className,
}) => {
  const config = TEST_STATUS_CONFIG[
    status as keyof typeof TEST_STATUS_CONFIG
  ] || {
    color: "#d9d9d9",
    icon: <ClockCircleOutlined />,
    text: status || "Unknown",
    tagColor: "default",
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const style = {
    color: config.color,
    cursor: clickable ? "pointer" : "default",
  };

  switch (variant) {
    case "badge":
      return (
        <Badge
          status={config.tagColor as any}
          text={
            <span style={style} onClick={handleClick} className={className}>
              {showIcon && config.icon} {config.text}
            </span>
          }
        />
      );

    case "button":
      return (
        <Button
          size={size as SizeType}
          type="default"
          icon={showIcon ? config.icon : undefined}
          onClick={handleClick}
          className={className}
          style={{ borderColor: config.color, color: config.color }}
        >
          {config.text}
        </Button>
      );

    case "text":
      return (
        <span style={style} onClick={handleClick} className={className}>
          {showIcon && config.icon} {config.text}
        </span>
      );

    case "tag":
    default:
      return (
        <Tag
          color={config.tagColor as any}
          icon={showIcon ? config.icon : undefined}
          style={{ cursor: clickable ? "pointer" : "default" }}
          onClick={handleClick}
          className={className}
        >
          {config.text}
        </Tag>
      );
  }
};

export default TestCaseStatus;
