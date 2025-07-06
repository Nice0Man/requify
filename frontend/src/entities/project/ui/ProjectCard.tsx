import React from "react";
import { Card, Typography, Tag, Space, Progress, Avatar } from "antd";
import {
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { Project, ProjectWithStats } from "../model/projects.types";
import {
  getProjectCompletionPercentage,
  isProjectCompleted,
  getProjectHealthScore,
} from "../model/projects.types";

const { Text, Title } = Typography;

interface ProjectCardProps {
  project: Project | ProjectWithStats;
  size?: "small" | "default" | "large";
  showProgress?: boolean;
  showStats?: boolean;
  showOwner?: boolean;
  onClick?: (project: Project | ProjectWithStats) => void;
  className?: string;
}

/**
 * ProjectCard - component for displaying project card
 * Used in lists, dashboard and other places to show basic project information
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  size = "default",
  showProgress = true,
  showStats = true,
  showOwner = false,
  onClick,
  className,
}) => {
  const projectWithStats = project as ProjectWithStats;
  const hasStats = "total_requirements" in projectWithStats;

  const completionPercentage = hasStats
    ? getProjectCompletionPercentage(projectWithStats)
    : 0;
  const isCompleted = hasStats ? isProjectCompleted(projectWithStats) : false;
  const healthScore = hasStats
    ? getProjectHealthScore(projectWithStats)
    : "good";

  const handleClick = () => {
    if (onClick) {
      onClick(project);
    }
  };

  const statusColors = new Map([
    ["active", "#52c41a"],
    ["completed", "#1890ff"],
    ["planning", "#fadb14"],
    ["development", "#13c2c2"],
    ["testing", "#fa8c16"],
    ["inactive", "#8c8c8c"],
    ["archived", "#d9d9d9"],
    ["cancelled", "#ff4d4f"],
  ]);

  const statusLabels = new Map([
    ["active", "Active"],
    ["completed", "Completed"],
    ["planning", "Planning"],
    ["development", "Development"],
    ["testing", "Testing"],
    ["inactive", "Inactive"],
    ["archived", "Archived"],
    ["cancelled", "Cancelled"],
  ]);

  const healthColors = new Map([
    ["good", "#52c41a"],
    ["warning", "#fadb14"],
    ["critical", "#ff4d4f"],
  ]);

  const getStatusColor = () => {
    return statusColors.get(project.status) || "#d9d9d9";
  };

  const getStatusLabel = () => {
    return statusLabels.get(project.status) || project.status;
  };

  const getHealthColor = () => {
    return healthColors.get(healthScore as string) || "#d9d9d9";
  };

  return (
    <Card
      size={size as any}
      hoverable={!!onClick}
      onClick={handleClick}
      className={className}
      styles={{ body: { padding: size === "small" ? 12 : 16 } }}
      actions={
        hasStats && showStats
          ? [
              <div key="requirements" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {projectWithStats.total_requirements}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Requirements
                </div>
              </div>,
              <div key="releases" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {projectWithStats.active_releases}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>Releases</div>
              </div>,
              isCompleted ? (
                <CheckCircleOutlined
                  key="completed"
                  style={{ color: "#52c41a", fontSize: "18px" }}
                />
              ) : (
                <div key="health" style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: getHealthColor(),
                      margin: "0 auto",
                    }}
                  />
                  <div
                    style={{ fontSize: "12px", color: "#999", marginTop: 4 }}
                  >
                    Status
                  </div>
                </div>
              ),
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
            marginBottom: 8,
          }}
        >
          <Space>
            <Avatar
              icon={<ProjectOutlined />}
              size="small"
              style={{ backgroundColor: getStatusColor() }}
            />
            <Tag color={getStatusColor()} style={{ margin: 0 }}>
              {getStatusLabel()}
            </Tag>
          </Space>

          <Text type="secondary" style={{ fontSize: "12px" }}>
            {(project as any).code || "N/A"}
          </Text>
        </div>

        <Title
          level={size === "small" ? 5 : 4}
          style={{ margin: 0, marginBottom: 8 }}
          ellipsis={{ tooltip: project.name }}
        >
          {project.name}
        </Title>

        {project.description && (
          <Text
            type="secondary"
            style={{
              fontSize: "12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.description}
          </Text>
        )}

        {hasStats &&
          showProgress &&
          projectWithStats.total_requirements > 0 && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: "12px" }}>Progress</Text>
                <Text style={{ fontSize: "12px" }}>
                  {completionPercentage}%
                </Text>
              </div>
              <Progress
                percent={completionPercentage}
                showInfo={false}
                size="small"
                strokeColor={getHealthColor()}
              />
            </div>
          )}

        {showOwner && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center" }}>
            <TeamOutlined style={{ marginRight: 4, color: "#999" }} />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Owner: ID {project.owner_id}
            </Text>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            Created: {new Date(project.created_at).toLocaleDateString("en-US")}
          </Text>
        </div>
      </div>
    </Card>
  );
};
