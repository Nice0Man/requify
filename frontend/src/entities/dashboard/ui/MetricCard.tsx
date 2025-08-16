import { memo } from "react";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  IconButton,
  Fade,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
} from "@mui/icons-material";
import type { DashboardMetric } from "../model/types";

interface MetricCardProps {
  metric: DashboardMetric;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "minimal" | "detailed" | "compact";
  onClick?: (metric: DashboardMetric) => void;
  showTrend?: boolean;
  showInfo?: boolean;
  animationDelay?: number;
  className?: string;
}

export const MetricCard = memo<MetricCardProps>(({
  metric,
  loading = false,
  size = "medium",
  variant = "detailed",
  onClick,
  showTrend = true,
  showInfo = false,
  animationDelay = 0,
  className,
}) => {
  const theme = useTheme();

  const sizeConfig = {
    small: {
      padding: 2,
      iconSize: 32,
      valueSize: "h6" as const,
      titleSize: "body2" as const,
    },
    medium: {
      padding: 2.5,
      iconSize: 40,
      valueSize: "h5" as const,
      titleSize: "body1" as const,
    },
    large: {
      padding: 3,
      iconSize: 48,
      valueSize: "h4" as const,
      titleSize: "h6" as const,
    },
  };

  const config = sizeConfig[size];
  const isInteractive = Boolean(onClick);

  const getTrendIcon = () => {
    switch (metric.trend) {
      case "up":
        return <TrendingUp fontSize="small" />;
      case "down":
        return <TrendingDown fontSize="small" />;
      default:
        return <TrendingFlat fontSize="small" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case "up":
        return theme.palette.success.main;
      case "down":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getMetricColor = () => {
    return metric.color || theme.palette.primary.main;
  };

  if (loading) {
    return (
      <Box
        className={className}
        sx={{
          p: config.padding,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Skeleton variant="circular" width={config.iconSize} height={config.iconSize} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          </Stack>
          {variant === "detailed" && (
            <Skeleton variant="text" width="40%" height={16} />
          )}
        </Stack>
      </Box>
    );
  }

  const CardContent = () => (
    <>
      {/* Header with Icon and Value */}
      <Stack direction="row" alignItems="flex-start" spacing={2} mb={variant === "compact" ? 0 : 1}>
        {/* Icon */}
        <Box
          sx={{
            width: config.iconSize,
            height: config.iconSize,
            borderRadius: 2,
            background: alpha(getMetricColor(), 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: getMetricColor(),
            flexShrink: 0,
          }}
        >
          {/* Здесь можно добавить рендеринг иконки из строки */}
          <Box sx={{ fontSize: config.iconSize * 0.6 }}>📊</Box>
        </Box>

        {/* Value and Title */}
        <Box flex={1} minWidth={0}>
          <Typography
            variant={config.valueSize}
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {typeof metric.value === "number" 
              ? metric.value.toLocaleString() 
              : metric.value}
            {metric.unit && (
              <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                {metric.unit}
              </Typography>
            )}
          </Typography>

          <Typography
            variant={config.titleSize}
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: variant === "minimal" ? 400 : 500,
              lineHeight: 1.3,
            }}
          >
            {metric.title}
          </Typography>
        </Box>

        {/* Info Button */}
        {showInfo && metric.description && (
          <Tooltip title={metric.description}>
            <IconButton size="small" sx={{ opacity: 0.7 }}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Trend and Description */}
      {variant === "detailed" && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt="auto">
          {/* Trend */}
          {showTrend && metric.change !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box
                sx={{
                  color: getTrendColor(),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {getTrendIcon()}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: getTrendColor(),
                  fontWeight: 600,
                }}
              >
                {metric.change > 0 && "+"}
                {metric.change}%
              </Typography>
            </Stack>
          )}

          {/* Last Updated */}
          {metric.lastUpdated && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.disabled,
                fontSize: "0.75rem",
              }}
            >
              Обновлено: {new Date(metric.lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      )}

      {/* Description for minimal variant */}
      {variant === "minimal" && metric.description && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {metric.description}
        </Typography>
      )}
    </>
  );

  return (
    <Fade in timeout={600} style={{ transitionDelay: `${animationDelay}ms` }}>
      <Box
        className={className}
        onClick={isInteractive ? () => onClick!(metric) : undefined}
        sx={{
          p: config.padding,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: isInteractive ? "pointer" : "default",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          
          // Hover effects
          ...(isInteractive && {
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `0 8px 24px ${alpha(getMetricColor(), 0.12)}`,
              borderColor: alpha(getMetricColor(), 0.2),
              
              // Subtle background overlay
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: alpha(getMetricColor(), 0.02),
                borderRadius: "inherit",
              },
            },
          }),

          // Focus styles for accessibility
          "&:focus-visible": {
            outline: `2px solid ${getMetricColor()}`,
            outlineOffset: 2,
          },
        }}
        tabIndex={isInteractive ? 0 : -1}
        role={isInteractive ? "button" : undefined}
        aria-label={isInteractive ? `Открыть детали метрики: ${metric.title}` : undefined}
      >
        <CardContent />
      </Box>
    </Fade>
  );
});

MetricCard.displayName = "MetricCard"; 