import React from "react";
import { Progress, Space, Typography, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { ProjectWithStats } from "../model/projects.types";
import {
  getProjectCompletionPercentage,
  getProjectHealthScore,
} from "../model/projects.types";
import { ProgressSize } from "antd/es/progress/progress";

const { Text } = Typography;

interface ProjectProgressProps {
  project: ProjectWithStats;
  size?: "small" | "default" | "large";
  showText?: boolean;
  showTooltip?: boolean;
  format?: "line" | "circle" | "dashboard";
  className?: string;
}

/**
 * ProjectProgress - компонент для отображения прогресса проекта
 * Показывает процент выполнения на основе завершенных требований
 */
export const ProjectProgress: React.FC<ProjectProgressProps> = ({
  project,
  size = "default",
  showText = true,
  showTooltip = true,
  format = "line",
  className,
}) => {
  const completionPercentage = getProjectCompletionPercentage(project);
  const healthScore = getProjectHealthScore(project);

  const getProgressColor = () => {
    switch (healthScore) {
      case 100:
        return "#52c41a";
      case 75:
        return "#fadb14";
      case 50:
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getProgressSize = (format: string) => {
    if (format === "circle" || format === "dashboard") {
      return size === "small" ? 60 : size === "large" ? 120 : 80;
    }
    return size;
  };

  const progressElement = (
    <Progress
      type={format}
      percent={completionPercentage}
      strokeColor={getProgressColor()}
      size={getProgressSize(format) as ProgressSize}
      showInfo={showText && format !== "line"}
      className={className}
    />
  );

  const tooltipContent = showTooltip ? (
    <div>
      <div>
        Completed: {project.requirements_completed} from{" "}
        {project.total_requirements}
      </div>
      <div>Progress: {completionPercentage}%</div>
      <div>
        Status:{" "}
        {healthScore === 100
          ? "Good"
          : healthScore === 75
          ? "Warning"
          : "Critical"}
      </div>
    </div>
  ) : null;

  if (format === "line") {
    return (
      <div className={className}>
        {showText && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Space size="small">
              <Text style={{ fontSize: size === "small" ? "12px" : "14px" }}>
                Progress
              </Text>
              {showTooltip && (
                <Tooltip title={tooltipContent}>
                  <InfoCircleOutlined
                    style={{ color: "#999", fontSize: "12px" }}
                  />
                </Tooltip>
              )}
            </Space>
            <Text style={{ fontSize: size === "small" ? "12px" : "14px" }}>
              {completionPercentage}%
            </Text>
          </div>
        )}

        {showTooltip ? (
          <Tooltip title={tooltipContent}>{progressElement}</Tooltip>
        ) : (
          progressElement
        )}

        {showText && project.total_requirements > 0 && (
          <div style={{ marginTop: 4 }}>
            <Text
              type="secondary"
              style={{ fontSize: size === "small" ? "11px" : "12px" }}
            >
              {project.requirements_completed} из {project.total_requirements}{" "}
              requirements
            </Text>
          </div>
        )}
      </div>
    );
  }

  // For circle and dashboard formats
  return (
    <div className={className} style={{ textAlign: "center" }}>
      {showTooltip ? (
        <Tooltip title={tooltipContent}>{progressElement}</Tooltip>
      ) : (
        progressElement
      )}

      {showText && (
        <div style={{ marginTop: 8 }}>
          <Text style={{ fontSize: size === "small" ? "12px" : "14px" }}>
            {project.requirements_completed} / {project.total_requirements}
          </Text>
          <br />
          <Text
            type="secondary"
            style={{ fontSize: size === "small" ? "11px" : "12px" }}
          >
            requirements completed
          </Text>
        </div>
      )}
    </div>
  );
};
