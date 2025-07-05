import React from "react";
import {
  Button,
  CircularProgress,
  Box,
  useTheme,
  alpha,
  keyframes,
} from "@mui/material";

interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "social";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  socialProvider?: "google" | "github" | "microsoft";
}

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const getSocialColors = (provider: string) => {
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
    case "microsoft":
      return {
        background: "#0078d4",
        color: "#ffffff",
        border: "#0078d4",
        hover: "#106ebe",
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
  iconPosition = "start",
  socialProvider,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      textTransform: "none" as const,
      fontWeight: 600,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
        transform: "translateX(-100%)",
        transition: "transform 0.6s",
      },
      "&:hover:before": {
        transform: "translateX(100%)",
      },
    };

    const sizeStyles = {
      small: {
        height: 40,
        fontSize: "0.875rem",
        px: 3,
      },
      medium: {
        height: 48,
        fontSize: "1rem",
        px: 4,
      },
      large: {
        height: 56,
        fontSize: "1.125rem",
        px: 5,
      },
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyles,
          ...sizeStyles[size],
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.primary.contrastText,
          border: "none",
          boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
          "&:hover": {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0px)",
            boxShadow: `0 2px 8px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
          },
          "&:focus-visible": {
            animation: `${pulseAnimation} 1.5s infinite`,
          },
        };

      case "secondary":
        return {
          ...baseStyles,
          ...sizeStyles[size],
          background: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          "&:hover": {
            background: alpha(theme.palette.primary.main, 0.15),
            borderColor: theme.palette.primary.main,
            transform: "translateY(-1px)",
          },
        };

      case "outline":
        return {
          ...baseStyles,
          ...sizeStyles[size],
          background: "transparent",
          color: theme.palette.primary.main,
          border: `2px solid ${theme.palette.primary.main}`,
          "&:hover": {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            transform: "translateY(-1px)",
          },
        };

      case "ghost":
        return {
          ...baseStyles,
          ...sizeStyles[size],
          background: "transparent",
          color: theme.palette.text.primary,
          border: "none",
          "&:hover": {
            background: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
          },
        };

      case "social":
        const socialColors = getSocialColors(socialProvider || "google");
        return {
          ...baseStyles,
          ...sizeStyles[size],
          background: socialColors.background,
          color: socialColors.color,
          border: `1px solid ${socialColors.border}`,
          boxShadow: "0 2px 4px 0 rgba(0,0,0,0.1)",
          "&:hover": {
            background: socialColors.hover,
            transform: "translateY(-1px)",
            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.15)",
          },
        };

      default:
        return {
          ...baseStyles,
          ...sizeStyles[size],
        };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress
            size={20}
            sx={{
              color:
                variant === "primary"
                  ? theme.palette.primary.contrastText
                  : theme.palette.primary.main,
            }}
          />
          <span>Loading...</span>
        </Box>
      );
    }

    const content = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          zIndex: 1,
          position: "relative",
        }}
      >
        {icon && iconPosition === "start" && (
          <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>
        )}
        <span>{children}</span>
        {icon && iconPosition === "end" && (
          <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>
        )}
      </Box>
    );

    return content;
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      fullWidth={fullWidth}
      sx={getButtonStyles()}
    >
      {renderContent()}
    </Button>
  );
};
