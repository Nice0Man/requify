import React from "react";
import {
  Card,
  Typography,
  Tag,
  Space,
  Avatar,
  Button,
  Dropdown,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { UserManagement } from "../model/types";
import type { UserRole, UserStatus } from "@/entities/user";
import { CardSize } from "antd/es/card/Card";

const { Text, Title } = Typography;

// Карты для цветов статусов пользователей
const USER_STATUS_COLORS = new Map<UserStatus, string>([
  ["active" as unknown as UserStatus, "#52c41a"],
  ["inactive" as unknown as UserStatus, "#8c8c8c"],
  ["pending" as unknown as UserStatus, "#fadb14"],
  ["suspended" as unknown as UserStatus, "#ff4d4f"],
  ["deleted" as unknown as UserStatus, "#f5222d"],  
]);

// Карты для цветов ролей пользователей
const USER_ROLE_COLORS = new Map<UserRole, string>([
  ["admin" as unknown as UserRole, "#722ed1"],
  ["manager" as unknown as UserRole, "#13c2c2"],
  ["analyst" as unknown as UserRole, "#1890ff"],
  ["developer" as unknown as UserRole, "#52c41a"],
  ["tester" as unknown as UserRole, "#fa8c16"],
  ["client" as unknown as UserRole, "#eb2f96"],
  ["viewer" as unknown as UserRole, "#8c8c8c"],
]);

// Карта для иконок статусов
const STATUS_ICONS = new Map<UserStatus, React.ReactNode>([
  ["active" as unknown as UserStatus, <CheckCircleOutlined style={{ color: "#52c41a" }} />],
  ["suspended" as unknown as UserStatus, <CloseCircleOutlined style={{ color: "#ff4d4f" }} />],
  ["deleted" as unknown as UserStatus, <CloseCircleOutlined style={{ color: "#ff4d4f" }} />],
]);

interface UserManagementCardProps {
  user: UserManagement;
  size?: "small" | "default" | "large";
  showActions?: boolean;
  onEdit?: (user: UserManagement) => void;
  onDelete?: (user: UserManagement) => void;
  onToggleStatus?: (user: UserManagement) => void;
  onSendEmail?: (user: UserManagement) => void;
  className?: string;
}

export const UserManagementCard: React.FC<UserManagementCardProps> = ({
  user,
  size = "default",
  showActions = true,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendEmail,
  className,
}) => {
  const getUserStatusColor = (status: UserStatus): string => {
    return USER_STATUS_COLORS.get(status) || "#d9d9d9";
  };

  const getUserRoleColor = (role: UserRole): string => {
    return USER_ROLE_COLORS.get(role) || "#d9d9d9";
  };

  const getStatusIcon = (): React.ReactNode => {
    return STATUS_ICONS.get(user.status) || <UserOutlined style={{ color: "#8c8c8c" }} />;
  };

  const actionItems = [
    {
      key: "edit",
      label: "Edit User",
      icon: <EditOutlined />,
      onClick: () => onEdit?.(user),
    },
    {
      key: "toggle-status",
      label: user.status.is_active ? "Deactivate" : "Activate",
      icon: user.status.is_active ? <LockOutlined /> : <UnlockOutlined />,
      onClick: () => onToggleStatus?.(user),
    },
    {
      key: "send-email",
      label: "Send Email",
      icon: <MailOutlined />,
      onClick: () => onSendEmail?.(user),
    },
    {
      type: "divider" as const,
    },
    {
      key: "delete",
      label: "Delete User",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete?.(user),
    },
  ];

  return (
    <Card
      size={size as CardSize}
      className={className}
      styles={{ body: { padding: size === "small" ? 12 : 16 } }}
      actions={
        showActions
          ? [
              <Tooltip key="edit" title="Edit User">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit?.(user)}
                />
              </Tooltip>,
              <Tooltip
                key="status"
                title={user.status.is_active ? "Deactivate" : "Activate"}
              >
                <Button
                  type="text"
                  icon={
                    user.status.is_active ? (
                      <LockOutlined />
                    ) : (
                      <UnlockOutlined />
                    )
                  }
                  onClick={() => onToggleStatus?.(user)}
                />
              </Tooltip>,
              <Dropdown
                key="more"
                menu={{ items: actionItems }}
                trigger={["click"]}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>,
            ]
          : undefined
      }
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Space>
            <Avatar
              size={size === "small" ? "small" : "default"}
              icon={<UserOutlined />}
              style={{ backgroundColor: getUserRoleColor(user.role) }}
            >
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </Avatar>
            {getStatusIcon()}
          </Space>

          <Space>
            <Tag color={getUserStatusColor(user.status)}>
              {user.status.name?.toUpperCase()}
            </Tag>
            {user.is_superuser && <Tag color="gold">SUPER</Tag>}
          </Space>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Title
            level={size === "small" ? 5 : 4}
            style={{ margin: 0 }}
            ellipsis={{ tooltip: `${user.first_name} ${user.last_name}` }}
          >
            {user.first_name} {user.last_name}
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            @{user.username}
          </Text>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text
            type="secondary"
            style={{ fontSize: "12px" }}
            ellipsis={{ tooltip: user.email }}
          >
            {user.email}
          </Text>
          {!user.email_verified && (
            <Tag color="orange" style={{ marginLeft: 4, fontSize: "10px" }}>
              Unverified
            </Tag>
          )}
        </div>

        <Space size="small" wrap style={{ marginBottom: 8 }}>
          <Tag color={getUserRoleColor(user.role)}>
            {user.role.name?.toUpperCase()}
          </Tag>

          {user.department && <Tag>{user.department}</Tag>}
        </Space>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#999",
          }}
        >
          <div>
            <div>Projects: {user.projects_count || 0}</div>
            <div>Requirements: {user.requirements_count || 0}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>Logins: {user.login_count || 0}</div>
            <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {user.account_locked_until &&
          new Date(user.account_locked_until) > new Date() && (
            <div style={{ marginTop: 8 }}>
              <Tag color="red" style={{ fontSize: "10px" }}>
                LOCKED until{" "}
                {new Date(user.account_locked_until).toLocaleString()}
              </Tag>
            </div>
          )}
      </div>
    </Card>
  );
};
