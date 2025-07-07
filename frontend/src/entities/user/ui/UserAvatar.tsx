import React from "react";
import { Avatar } from "@mui/material";
import { User } from "../model/types";

interface UserAvatarProps {
  user: User;
  size?: "small" | "medium" | "large";
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "medium" }) => {
  const getSizeProps = () => {
    switch (size) {
      case "small":
        return { width: 32, height: 32 };
      case "large":
        return { width: 56, height: 56 };
      default:
        return { width: 40, height: 40 };
    }
  };

  return (
    <Avatar sx={getSizeProps()}>{user.name.charAt(0).toUpperCase()}</Avatar>
  );
};

export { UserAvatar };
