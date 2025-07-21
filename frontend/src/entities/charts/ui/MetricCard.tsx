import { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
} from "@mui/icons-material";
import type { MetricCardProps } from "../model/types";

const TrendIcon = memo<{ direction: "up" | "down" | "stable" }>(
  ({ direction }) => {
    switch (direction) {
      case "up":
        return <TrendingUp fontSize="inherit" />;
      case "down":
        return <TrendingDown fontSize="inherit" />;
      default:
        return <TrendingFlat fontSize="inherit" />;
    }
  }
);

TrendIcon.displayName = "TrendIcon";

export const MetricCard = memo<MetricCardProps>(
  ({
    metric,
    variant = "default",
    showTrend = true,
    showProgress = false,
    onClick,
  }) => {
    const theme = useTheme();
    const isCompact = variant === "compact";
    const isDetailed = variant === "detailed";

    const formatValue = (value: number | string) => {
      if (typeof value === "string") return value;

      switch (metric.format) {
        case "percentage":
          return `${value.toFixed(1)}%`;
        case "currency":
          return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
          }).format(value);
        case "duration":
          return `${value}h`;
        default:
          return value.toLocaleString();
      }
    };

    const getProgressValue = () => {
      if (!metric.target || typeof metric.value !== "number") return 0;
      return Math.min((metric.value / metric.target) * 100, 100);
    };

    const cardContent = (
      <CardContent
        sx={{
          p: isCompact ? 2 : 3,
          "&:last-child": { pb: isCompact ? 2 : 3 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {metric.icon && (
              <Box
                sx={{
                  color: metric.color || theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  fontSize: isCompact ? 20 : 24,
                }}
              >
                {metric.icon}
              </Box>
            )}

            {isDetailed && metric.description && (
              <Tooltip title={metric.description} arrow>
                <IconButton size="small" sx={{ ml: "auto" }}>
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Trend Indicator */}
          {metric.trend && showTrend && (
            <Chip
              icon={<TrendIcon direction={metric.trend.direction} />}
              label={`${
                metric.trend.direction === "up"
                  ? "+"
                  : metric.trend.direction === "down"
                  ? "-"
                  : ""
              }${Math.abs(metric.trend.value || 0)}%`}
              size="small"
              color={
                metric.trend.direction === "up"
                  ? "success"
                  : metric.trend.direction === "down"
                  ? "error"
                  : "default"
              }
              variant="outlined"
              sx={{
                fontSize: "0.7rem",
                height: isCompact ? 20 : 24,
                "& .MuiChip-icon": { fontSize: isCompact ? 12 : 14 },
                "& .MuiChip-label": { px: 1 },
                borderRadius: 1.5,
              }}
            />
          )}
        </Box>

        {/* Value */}
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Typography
            variant={isCompact ? "h5" : "h4"}
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: isCompact ? "1.5rem" : "2rem",
              lineHeight: 1.2,
              background: metric.color
                ? `linear-gradient(135deg, ${metric.color}, ${alpha(
                    metric.color,
                    0.7
                  )})`
                : "none",
              backgroundClip: metric.color ? "text" : "unset",
              WebkitBackgroundClip: metric.color ? "text" : "unset",
              WebkitTextFillColor: metric.color ? "transparent" : "unset",
            }}
          >
            {formatValue(metric.value)}
            {metric.unit && (
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: isCompact ? "0.875rem" : "1rem",
                  ml: 0.5,
                }}
              >
                {metric.unit}
              </Typography>
            )}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: isCompact ? "0.75rem" : "0.875rem",
              letterSpacing: "0.02em",
            }}
          >
            {metric.title}
          </Typography>

          {/* Description for detailed variant */}
          {isDetailed && metric.description && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                mt: 0.5,
              }}
            >
              {metric.description}
            </Typography>
          )}
        </Stack>

        {/* Progress Bar */}
        {(showProgress || metric.target) &&
          typeof metric.value === "number" && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                sx={{
                  height: isCompact ? 4 : 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.divider, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    background: metric.color
                      ? `linear-gradient(90deg, ${metric.color}, ${alpha(
                          metric.color,
                          0.7
                        )})`
                      : `linear-gradient(90deg, ${
                          theme.palette.primary.main
                        }, ${alpha(theme.palette.primary.main, 0.7)})`,
                  },
                }}
              />

              {metric.target && isDetailed && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Current: {formatValue(metric.value)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target: {formatValue(metric.target)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

        {/* Trend Label */}
        {metric.trend?.label && isDetailed && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              mt: 1,
              fontSize: "0.75rem",
            }}
          >
            {metric.trend.label}
          </Typography>
        )}
      </CardContent>
    );

    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease-in-out",
          cursor: onClick ? "pointer" : "default",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          background: theme.palette.background.paper,
          "&:hover": onClick
            ? {
                transform: "translateY(-4px)",
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.common.black,
                  0.08
                )}`,
                borderColor: alpha(
                  metric.color || theme.palette.primary.main,
                  0.2
                ),
              }
            : {},
        }}
        onClick={onClick ? () => onClick(metric) : undefined}
      >
        {cardContent}
      </Card>
    );
  }
);

MetricCard.displayName = "MetricCard";
