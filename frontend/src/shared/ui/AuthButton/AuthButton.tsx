import React from "react";
import { Button, CircularProgress, Box, useTheme, alpha } from "@mui/material";

export interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "social";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  socialProvider?: "google" | "github";
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = true,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "end",
  socialProvider,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getSocialColors = (provider?: string) => {
    switch (provider) {
      case "google":
        return {
          background: "#ffffff",
          color: "#1f1f1f",
          border: "#dadce0",
          hover: "#f8f9fa",
        };
      case "github":
        return {
          background: "#24292e",
          color: "#ffffff",
          border: "#24292e",
          hover: "#1a1e22",
        };
      default:
        return {
          background: "#ffffff",
          color: "#1f1f1f",
          border: "#dadce0",
          hover: "#f8f9fa",
        };
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 5,
      textTransform: "none" as const,
      fontWeight: 600,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      minHeight: size === "small" ? 40 : size === "large" ? 56 : 48,
      fontSize:
        size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem",
      px: size === "small" ? 3 : size === "large" ? 5 : 4,
    };

    if (variant === "social" && socialProvider) {
      const colors = getSocialColors(socialProvider);
      return {
        ...baseStyles,
        background: colors.background,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        "&:hover": {
          background: colors.hover,
          transform: "translateY(-1px)",
          boxShadow: `0 4px 12px ${alpha(colors.color, 0.2)}`,
        },
      };
    }

    if (variant === "primary") {
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: theme.palette.primary.contrastText,
        border: "none",
        boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
        "&:hover": {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          boxShadow: `0 8px 25px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
          transform: "translateY(-3px) scale(1.02)",
        },
      };
    }

    return {
      ...baseStyles,
      background: `linear-gradient(135deg, ${alpha("#ffffff", 0.9)}, ${alpha(
        "#f8fafc",
        0.9
      )})`,
      color: theme.palette.primary.main,
      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      "&:hover": {
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.primary.main, 0.05)})`,
        borderColor: theme.palette.primary.main,
        transform: "translateY(-2px) scale(1.01)",
      },
    };
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      fullWidth={fullWidth}
      sx={getButtonStyles()}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            mr: 1,
            color: variant === "primary" ? "white" : theme.palette.primary.main,
          }}
        />
      )}
      {icon && iconPosition === "start" && !loading && (
        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>{icon}</Box>
      )}
      {children}
      {icon && iconPosition === "end" && !loading && (
        <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>{icon}</Box>
      )}
    </Button>
  );
};
