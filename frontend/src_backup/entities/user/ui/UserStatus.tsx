import React from "react";
import { Chip, Badge } from "@mui/material";
import { USER_STATUSES, getUserStatusColor } from "../model/types";
import type { User, UserStatus as UserStatusType } from "../model/types";

export interface UserStatusProps {
  user?: User;
  status?: UserStatusType;
  variant?: "chip" | "badge" | "dot";
  size?: "small" | "medium";
  showText?: boolean;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  user,
  status,
  variant = "chip",
  size = "medium",
  showText = true,
}) => {
  const userStatus = status || user?.status;
  
  if (!userStatus) return null;

  const statusColor = getUserStatusColor(userStatus);
  const statusText = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
  
  const getStatusLabel = () => {
    switch (userStatus) {
      case USER_STATUSES.ACTIVE: return "Active";
      case USER_STATUSES.INACTIVE: return "Inactive";
      case USER_STATUSES.PENDING: return "Pending";
      case USER_STATUSES.SUSPENDED: return "Suspended";
      case USER_STATUSES.DELETED: return "Deleted";
      default: return statusText;
    }
  };

  const getMuiColor = () => {
    switch (userStatus) {
      case USER_STATUSES.ACTIVE: return "success";
      case USER_STATUSES.INACTIVE: return "default";
      case USER_STATUSES.PENDING: return "warning";
      case USER_STATUSES.SUSPENDED: return "error";
      case USER_STATUSES.DELETED: return "error";
      default: return "default";
    }
  };

  if (variant === "chip") {
    return (
      <Chip
        label={showText ? getStatusLabel() : ""}
        color={getMuiColor() as any}
        size={size}
        variant="filled"
        sx={{
          backgroundColor: statusColor,
          color: 'white',
          fontWeight: 500,
        }}
      />
    );
  }

  if (variant === "badge") {
    return (
      <Badge
        color={getMuiColor() as any}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: statusColor,
          }
        }}
      >
        {showText && getStatusLabel()}
      </Badge>
    );
  }

  // dot variant
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: size === 'small' ? 6 : 8,
          height: size === 'small' ? 6 : 8,
          borderRadius: '50%',
          backgroundColor: statusColor,
        }}
      />
      {showText && (
        <span style={{ fontSize: size === 'small' ? '12px' : '14px' }}>
          {getStatusLabel()}
        </span>
      )}
    </div>
  );
}; 