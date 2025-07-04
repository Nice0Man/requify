import React from "react";
import { Descriptions, Space, Typography, Avatar } from "antd";
import { ProjectOutlined } from "@ant-design/icons";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectProgress } from "./ProjectProgress";
import type {
  Project,
  ProjectWithDetails,
  ProjectStatus as ProjectStatusType,
} from "../model/types";

const { Text, Title } = Typography;

interface ProjectInfoProps {
  project: Project | ProjectWithDetails;
  layout?: "horizontal" | "vertical";
  size?: "small" | "middle" | "default";
  showProgress?: boolean;
  showExtendedInfo?: boolean;
  column?: number;
  className?: string;
}

/**
 * ProjectInfo - component for displaying detailed project information
 * Used in project profiles, modal windows, cards with detailed information
 */
export const ProjectInfo: React.FC<ProjectInfoProps> = ({
  project,
  layout = "horizontal",
  size = "default",
  showProgress = true,
  showExtendedInfo = false,
  column = 1,
  className,
}) => {
  const projectWithDetails = project as ProjectWithDetails;
  const hasStats = "total_requirements" in projectWithDetails;

  const statusColorMap = new Map([
    ["active", "#52c41a"],
    ["completed", "#1890ff"],
    ["planning", "#fadb14"],
    ["development", "#13c2c2"],
    ["testing", "#fa8c16"],
    ["inactive", "#8c8c8c"],
    ["archived", "#d9d9d9"],
    ["cancelled", "#ff4d4f"],
  ]);

  const getStatusColor = () => {
    return statusColorMap.get(project.status) || "#d9d9d9";
  };

  const basicItems = [
    {
      key: "name",
      label: "Name",
      children: project.name,
    },
    {
      key: "code",
      label: "Project Code",
      children: (project as any).code || "N/A",
    },
    {
      key: "description",
      label: "Description",
      children: project.description || "Not specified",
      span: column > 1 ? column : 1,
    },
    {
      key: "status",
      label: "Status",
      children: <ProjectStatus status={project.status as ProjectStatusType} />,
    },
    {
      key: "owner",
      label: "Owner",
      children: projectWithDetails.owner_name || `ID: ${project.owner_id}`,
    },
  ];

  const extendedItems =
    showExtendedInfo && projectWithDetails
      ? [
          ...basicItems,
          ...(projectWithDetails.manager
            ? [
                {
                  key: "manager",
                  label: "Manager",
                  children: `${projectWithDetails.manager.first_name} ${projectWithDetails.manager.last_name}`,
                },
              ]
            : []),
          ...(projectWithDetails.team_lead
            ? [
                {
                  key: "teamLead",
                  label: "Team Lead",
                  children: `${projectWithDetails.team_lead.first_name} ${projectWithDetails.team_lead.last_name}`,
                },
              ]
            : []),
          ...(projectWithDetails.client
            ? [
                {
                  key: "client",
                  label: "Client",
                  children: projectWithDetails.client.name,
                },
              ]
            : []),
          ...(hasStats
            ? [
                {
                  key: "totalRequirements",
                  label: "Total Requirements",
                  children: projectWithDetails.total_requirements || 0,
                },
                {
                  key: "completedRequirements",
                  label: "Completed Requirements",
                  children: projectWithDetails.requirements_completed || 0,
                },
                {
                  key: "activeReleases",
                  label: "Active Releases",
                  children: projectWithDetails.active_releases || 0,
                },
                {
                  key: "specsCount",
                  label: "Specifications",
                  children: projectWithDetails.specs_count || 0,
                },
              ]
            : []),
          {
            key: "createdAt",
            label: "Created Date",
            children: new Date(project.created_at).toLocaleDateString("en-US"),
          },
        ]
      : basicItems;

  return (
    <div className={className}>
      <div
        style={{
          marginBottom: 16,
          textAlign: layout === "vertical" ? "center" : "left",
        }}
      >
        <Space
          direction={layout === "vertical" ? "vertical" : "horizontal"}
          align="center"
          size="large"
        >
          <Avatar
            size={layout === "vertical" ? "large" : "default"}
            icon={<ProjectOutlined />}
            style={{ backgroundColor: getStatusColor() }}
          />
          <div>
            <Title level={layout === "vertical" ? 3 : 4} style={{ margin: 0 }}>
              {project.name}
            </Title>
            <Text type="secondary">{(project as any).code || "N/A"}</Text>
          </div>
        </Space>
      </div>

      {hasStats && showProgress && (
        <div style={{ marginBottom: 16 }}>
          <ProjectProgress
            project={projectWithDetails}
            size={size === "small" ? "small" : "default"}
            format="line"
          />
        </div>
      )}

      <Descriptions
        layout={layout}
        size={size}
        column={column}
        items={extendedItems}
        bordered={layout === "vertical"}
      />
    </div>
  );
};
