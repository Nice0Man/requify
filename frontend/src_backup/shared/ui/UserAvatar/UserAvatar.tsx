import React from "react";
import { Avatar, Badge, Tooltip } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

// Generic user interface that can accommodate different user object shapes
interface GenericUser {
  id?: number | string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  role?: string;
  status?: string;
}

interface UserAvatarProps {
  user?: GenericUser | null;
  size?: "small" | "medium" | "large" | number;
  showOnlineStatus?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string; // Custom tooltip title
}

/**
 * UserAvatar - универсальный компонент для отображения аватара пользователя
 * Поддерживает разные размеры, статусы и является backward-compatible
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "medium",
  showOnlineStatus = false,
  showTooltip = false,
  onClick,
  className,
  title,
}) => {
  // Определяем размеры для разных вариантов
  const getSizeConfig = () => {
    if (typeof size === "number") {
      return { width: size, height: size };
    }

    const sizes = {
      small: { width: 32, height: 32 },
      medium: { width: 40, height: 40 },
      large: { width: 56, height: 56 },
    };

    return sizes[size] || sizes.medium;
  };

  // Получаем полное имя пользователя
  const getFullName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  // Получаем инициалы пользователя
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(
        0
      )}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // Проверяем активность пользователя
  const isUserActive = () => {
    return user?.is_active ?? false;
  };

  const sizeConfig = getSizeConfig();
  const fullName = getFullName();
  const initials = getInitials();
  const isActive = isUserActive();

  const getFontSize = () => {
    if (typeof size === "number") {
      return `${size * 0.4}px`;
    }
    return size === "small" ? "0.75rem" : size === "large" ? "1.25rem" : "1rem";
  };

  const avatarElement = (
    <Avatar
      src={user?.avatar_url}
      sx={{
        ...sizeConfig,
        cursor: onClick ? "pointer" : "default",
        bgcolor: "primary.main",
        fontSize: getFontSize(),
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "scale(1.05)",
              boxShadow: 2,
            }
          : {},
      }}
      onClick={onClick}
      className={className}
    >
      {user?.avatar_url ? null : user ? initials : <PersonIcon />}
    </Avatar>
  );

  // Если нужно показать статус активности, оборачиваем в Badge
  const avatarWithStatus = showOnlineStatus ? (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      variant="dot"
      color={isActive ? "success" : "default"}
      sx={{
        "& .MuiBadge-dot": {
          backgroundColor: isActive ? "#44b700" : "#999",
          color: isActive ? "#44b700" : "#999",
          border: "2px solid white",
          "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: isActive ? "ripple 1.2s infinite ease-in-out" : "none",
            border: "1px solid currentColor",
            content: '""',
          },
        },
        "@keyframes ripple": {
          "0%": {
            transform: "scale(.8)",
            opacity: 1,
          },
          "100%": {
            transform: "scale(2.4)",
            opacity: 0,
          },
        },
      }}
    >
      {avatarElement}
    </Badge>
  ) : (
    avatarElement
  );

  // Если нужно показать tooltip, оборачиваем в Tooltip
  return showTooltip ? (
    <Tooltip title={title || fullName}>{avatarWithStatus}</Tooltip>
  ) : (
    avatarWithStatus
  );
};
