import React from "react";
import { Card, Descriptions, Tag, Space, Typography, Alert } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
import { SystemInfo as SystemInfoType } from "../model/types";

interface SystemInfoProps {
  systemInfo: SystemInfoType;
  loading?: boolean;
  className?: string;
}

export const SystemInfo: React.FC<SystemInfoProps> = ({
  systemInfo,
  loading = false,
  className,
}) => {
  const getHealthStatus = () => {
    if (systemInfo.error) {
      return { color: "red", icon: <CloseCircleOutlined />, text: "Unhealthy" };
    }

    const memoryUsage = systemInfo.memory?.percent || 0;
    const diskUsage = systemInfo.disk?.percent || 0;

    if (memoryUsage > 90 || diskUsage > 90) {
      return {
        color: "red",
        icon: <ExclamationCircleOutlined />,
        text: "Critical",
      };
    }

    if (memoryUsage > 80 || diskUsage > 80) {
      return {
        color: "orange",
        icon: <ExclamationCircleOutlined />,
        text: "Warning",
      };
    }

    return { color: "green", icon: <CheckCircleOutlined />, text: "Healthy" };
  };

  const health = getHealthStatus();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "Unknown";

    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const items = [
    {
      key: "platform",
      label: "Platform",
      children: (
        <Space>
          {systemInfo.platform}
          {systemInfo.platform_version && (
            <Tag color="blue">{systemInfo.platform_version}</Tag>
          )}
        </Space>
      ),
    },
    {
      key: "python_version",
      label: "Python Version",
      children: <Tag color="green">{systemInfo.python_version}</Tag>,
    },
    {
      key: "app_version",
      label: "Application Version",
      children: <Tag color="purple">{systemInfo.app_version}</Tag>,
    },
    {
      key: "environment",
      label: "Environment",
      children: (
        <Tag color={systemInfo.debug_mode ? "orange" : "blue"}>
          {systemInfo.environment}
          {systemInfo.debug_mode && " (Debug)"}
        </Tag>
      ),
    },
    {
      key: "uptime",
      label: "Uptime",
      children: formatUptime(systemInfo.uptime),
    },
    {
      key: "cpu_count",
      label: "CPU Cores",
      children: systemInfo.cpu_count || "Unknown",
    },
    {
      key: "memory",
      label: "Memory",
      children: systemInfo.memory ? (
        <Space direction="vertical" size="small">
          <div>
            Total: {formatBytes(systemInfo.memory.total * 1024 * 1024 * 1024)}
          </div>
          <div>
            Available:{" "}
            {formatBytes(systemInfo.memory.available * 1024 * 1024 * 1024)}
          </div>
          <div>
            Usage:{" "}
            <Tag color={systemInfo.memory.percent > 80 ? "red" : "green"}>
              {systemInfo.memory.percent}%
            </Tag>
          </div>
        </Space>
      ) : (
        "Unknown"
      ),
    },
    {
      key: "disk",
      label: "Disk",
      children: systemInfo.disk ? (
        <Space direction="vertical" size="small">
          <div>
            Total: {formatBytes(systemInfo.disk.total * 1024 * 1024 * 1024)}
          </div>
          <div>
            Free: {formatBytes(systemInfo.disk.free * 1024 * 1024 * 1024)}
          </div>
          <div>
            Used: {formatBytes(systemInfo.disk.used * 1024 * 1024 * 1024)}
          </div>
          <div>
            Usage:{" "}
            <Tag color={systemInfo.disk.percent > 80 ? "red" : "green"}>
              {systemInfo.disk.percent}%
            </Tag>
          </div>
        </Space>
      ) : (
        "Unknown"
      ),
    },
  ];

  return (
    <div className={className}>
      <Card loading={loading}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              System Information
            </Title>
            <Space>
              {health.icon}
              <Tag color={health.color}>{health.text}</Tag>
            </Space>
          </div>

          {systemInfo.error && (
            <Alert
              message="System Error"
              description={systemInfo.error}
              type="error"
              showIcon
            />
          )}

          <Descriptions bordered size="small" column={2} items={items} />
        </Space>
      </Card>
    </div>
  );
};
