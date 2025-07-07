import React from "react";
import { UserAvatar as SharedUserAvatar } from "@/shared/ui/UserAvatar";
import { getUserFullName, getUserInitials, isUserActive } from "../model/types";
import type { User } from "../model/types";

export interface UserAvatarProps {
  user: User;
  size?: "small" | "medium" | "large";
  showStatus?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * UserAvatar - специализированный компонент для сущности User
 * Использует типизированный интерфейс User и entity-specific helper functions
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "medium",
  showStatus = false,
  showTooltip = true,
  onClick,
  className,
}) => {
  // Конвертируем typed User в generic user object для shared компонента
  const genericUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url,
    is_active: isUserActive(user),
    role: user.role,
  };

  // Используем entity-specific helper для получения полного имени
  const fullName = getUserFullName(user);

  return (
    <SharedUserAvatar
      user={genericUser}
      size={size}
      showOnlineStatus={showStatus}
      showTooltip={showTooltip}
      onClick={onClick}
      className={className}
      title={fullName}
    />
  );
};
