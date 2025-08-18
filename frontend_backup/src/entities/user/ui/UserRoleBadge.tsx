import React from "react";
import { Chip } from "@mui/material";
import { User } from "../model/types";

interface UserRoleBadgeProps {
  user: User;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ user }) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "error";
      case "manager":
        return "warning";
      case "developer":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={user.role}
      color={getRoleColor(user.role) as any}
      size="small"
      variant="outlined"
    />
  );
};

export { UserRoleBadge };
