import React from "react";
import { Button } from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import { useAuth } from "../model/useAuth";

interface LogoutButtonProps {
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "outlined",
  size = "medium",
  fullWidth = false,
}) => {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={<ExitToApp />}
      onClick={() => logout()}
      disabled={isLoading}
    >
      Выйти
    </Button>
  );
};
