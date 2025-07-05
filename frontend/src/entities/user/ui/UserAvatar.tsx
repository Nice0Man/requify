import React from "react";
import { Avatar, Badge, Tooltip } from "@mui/material";
import { Person as UserOutlined } from "@mui/icons-material";
import { getUserFullName, getUserInitials, isUserActive } from "../model/types";
import type { User } from "../model/types";

export interface UserAvatarProps {
  user: User;
  size?: "small" | "medium" | "large";
  showStatus?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "medium",
  showStatus = false,
  showTooltip = true,
  onClick,
}) => {
  const isActive = isUserActive(user);
  const fullName = getUserFullName(user);
  const initials = getUserInitials(user);
  
  const getSize = () => {
    switch (size) {
      case "small": return { width: 32, height: 32 };
      case "medium": return { width: 40, height: 40 };
      case "large": return { width: 56, height: 56 };
      default: return { width: 40, height: 40 };
    }
  };

  const avatar = (
    <Avatar
      sx={{
        ...getSize(),
        bgcolor: 'primary.main',
        cursor: onClick ? 'pointer' : 'default',
        fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '1rem'
      }}
      onClick={onClick}
      src={user.avatar_url}
    >
      {user.avatar_url ? null : initials || <UserOutlined />}
    </Avatar>
  );

  const avatarWithStatus = showStatus ? (
    <Badge
      color={isActive ? "success" : "default"}
      variant="dot"
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      {avatar}
    </Badge>
  ) : avatar;

  return showTooltip ? (
    <Tooltip title={fullName}>
      {avatarWithStatus}
    </Tooltip>
  ) : avatarWithStatus;
}; 