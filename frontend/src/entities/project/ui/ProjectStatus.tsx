import React from "react";
import { Tag, Badge } from "antd";
import type { ProjectStatus as ProjectStatusType } from "../model/projects.types";
import { getStatusColor, getStatusLabel } from "../model/projects.types";

interface ProjectStatusProps {
  status: ProjectStatusType;
  type?: "tag" | "badge" | "dot";
  size?: "small" | "default";
  showText?: boolean;
  className?: string;
}

/**
 * ProjectStatus - component for displaying project status
 * Can be displayed as Tag, Badge or just a colored dot
 */
export const ProjectStatus: React.FC<ProjectStatusProps> = ({
  status,
  type = "tag",
  size = "default",
  showText = true,
  className,
}) => {
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  if (type === "tag") {
    return (
      <Tag
        color={statusColor}
        className={className}
        style={{
          fontSize: size === "small" ? "11px" : "12px",
          margin: 0,
        }}
      >
        {showText ? statusLabel : ""}
      </Tag>
    );
  }

  if (type === "badge") {
    return (
      <Badge
        color={statusColor}
        text={showText ? statusLabel : ""}
        className={className}
        style={{ fontSize: size === "small" ? "11px" : "12px" }}
      />
    );
  }

  if (type === "dot") {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <span
          style={{
            width: size === "small" ? 6 : 8,
            height: size === "small" ? 6 : 8,
            borderRadius: "50%",
            backgroundColor: statusColor,
            display: "inline-block",
          }}
        />
        {showText && (
          <span style={{ fontSize: size === "small" ? "11px" : "12px" }}>
            {statusLabel}
          </span>
        )}
      </span>
    );
  }

  return null;
};
