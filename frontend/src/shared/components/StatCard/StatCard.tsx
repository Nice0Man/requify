import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
  IconButton,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Remove as TrendingFlat,
  MoreHoriz,
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
  loading?: boolean;
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
  loading = false,
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case "up":
        return <TrendingUp fontSize="inherit" />;
      case "down":
        return <TrendingDown fontSize="inherit" />;
      case "flat":
        return <TrendingFlat fontSize="inherit" />;
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
      background: theme.palette.background.paper,
      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    minimal: {
      background: `linear-gradient(145deg, ${
        theme.palette.background.paper
      } 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
      border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    highlighted: {
      background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
      color: theme.palette[color].contrastText,
      border: "none",
    },
  };

  const getValueColor = () => {
    if (variant === "highlighted") {
      return "inherit";
    }
    return theme.palette.text.primary;
  };

  const getIconColor = () => {
    if (variant === "highlighted") {
      return "inherit";
    }
    return theme.palette[color].main;
  };

  return (
    <Card
      sx={{
        ...cardStyles[variant],
        borderRadius: 4,
        boxShadow:
          variant === "highlighted"
            ? `0 20px 40px -12px ${alpha(theme.palette[color].main, 0.35)}`
            : `0 8px 32px -8px ${alpha(theme.palette.common.black, 0.12)}`,
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        "&::before":
          variant !== "highlighted"
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${alpha(
                  theme.palette.common.white,
                  0.8
                )}, transparent)`,
                zIndex: 1,
              }
            : {},
        "&:hover": onClick
          ? {
              transform: "translateY(-8px) scale(1.02)",
              boxShadow:
                variant === "highlighted"
                  ? `0 25px 50px -12px ${alpha(theme.palette[color].main, 0.5)}`
                  : `0 20px 40px -8px ${alpha(
                      theme.palette.common.black,
                      0.18
                    )}`,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 4, position: "relative", zIndex: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <Typography
            variant="caption"
            sx={{
              color:
                variant === "highlighted"
                  ? alpha(theme.palette[color].contrastText, 0.8)
                  : theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            {icon && (
              <Box
                sx={{
                  color: getIconColor(),
                  opacity: 0.9,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    opacity: 1,
                    transform: "scale(1.1)",
                  },
                }}
              >
                {icon}
              </Box>
            )}
            {onClick && (
              <IconButton
                size="small"
                sx={{
                  color:
                    variant === "highlighted"
                      ? "inherit"
                      : theme.palette.action.active,
                  opacity: 0.6,
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: alpha(
                      variant === "highlighted"
                        ? theme.palette[color].contrastText
                        : theme.palette.action.active,
                      0.1
                    ),
                  },
                }}
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Typography
          variant="h2"
          sx={{
            color: getValueColor(),
            fontWeight: 700,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            lineHeight: 1,
            mb: subtitle || trend ? 2 : 0,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {loading
            ? "—"
            : typeof value === "number"
            ? value.toLocaleString()
            : value}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color:
                variant === "highlighted"
                  ? alpha(theme.palette[color].contrastText, 0.8)
                  : theme.palette.text.secondary,
              mb: trend ? 2 : 0,
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            {subtitle}
          </Typography>
        )}

        {trend && !loading && (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={getTrendIcon() as React.ReactElement}
              label={`${trend.value > 0 ? "+" : ""}${trend.value}%`}
              size="small"
              sx={{
                height: 28,
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: alpha(getTrendColor(), 0.12),
                color: getTrendColor(),
                border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                borderRadius: 2,
                "& .MuiChip-icon": {
                  fontSize: "1rem",
                  color: "inherit",
                },
                "& .MuiChip-label": {
                  px: 1,
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
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {trend.label}
              </Typography>
            )}
          </Box>
        )}

        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderTop: `2px solid ${theme.palette.primary.main}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                "@keyframes spin": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(360deg)",
                  },
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
