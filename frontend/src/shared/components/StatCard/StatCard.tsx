import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Remove as TrendingFlat,
} from "@mui/icons-material";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "flat";
    label?: string;
  };
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  variant?: "default" | "minimal" | "highlighted";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "primary",
  variant = "default",
  onClick,
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case "up":
        return <TrendingUp fontSize="small" />;
      case "down":
        return <TrendingDown fontSize="small" />;
      case "flat":
        return <TrendingFlat fontSize="small" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case "up":
        return theme.palette.success.main;
      case "down":
        return theme.palette.error.main;
      case "flat":
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  const cardStyles = {
    default: {
      background: `linear-gradient(135deg, ${alpha(
        theme.palette[color].main,
        0.1
      )} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
      backdropFilter: "blur(10px)",
    },
    minimal: {
      background: theme.palette.background.paper,
      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
      backdropFilter: "blur(10px)",
    },
    highlighted: {
      background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
      color: theme.palette[color].contrastText,
    },
  };

  const getValueColor = () => {
    if (variant === "highlighted") {
      return "inherit";
    }
    return color === "primary"
      ? theme.palette.text.primary
      : theme.palette[color].main;
  };

  return (
    <Card
      sx={{
        ...cardStyles[variant],
        borderRadius: 3,
        boxShadow:
          variant === "highlighted"
            ? `0 8px 32px ${alpha(theme.palette[color].main, 0.3)}`
            : `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow:
                variant === "highlighted"
                  ? `0 16px 48px ${alpha(theme.palette[color].main, 0.4)}`
                  : `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography
            variant="body2"
            sx={{
              color:
                variant === "highlighted"
                  ? "inherit"
                  : theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: "0.875rem",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                color:
                  variant === "highlighted"
                    ? "inherit"
                    : theme.palette[color].main,
                opacity: 0.8,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: getValueColor(),
            fontWeight: 700,
            fontSize: "2.25rem",
            lineHeight: 1.2,
            mb: subtitle || trend ? 1 : 0,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color:
                variant === "highlighted"
                  ? alpha(theme.palette[color].contrastText, 0.8)
                  : theme.palette.text.secondary,
              mb: trend ? 1 : 0,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Chip
              icon={getTrendIcon() as React.ReactElement}
              label={`${trend.value > 0 ? "+" : ""}${trend.value}%`}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: alpha(getTrendColor(), 0.1),
                color: getTrendColor(),
                border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
            {trend.label && (
              <Typography
                variant="caption"
                sx={{
                  color:
                    variant === "highlighted"
                      ? alpha(theme.palette[color].contrastText, 0.7)
                      : theme.palette.text.secondary,
                  ml: 0.5,
                }}
              >
                {trend.label}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
