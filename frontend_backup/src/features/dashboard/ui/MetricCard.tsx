import React, { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { useCardSizing, useDashboardSizing } from "@/shared/hooks";
import type { MetricCardProps } from "../model/types";

export const MetricCard = memo<MetricCardProps>(({
  metric,
  onMetricClick,
  showTrends = true,
  mode,
  density,
  maxHeight,
  overflow = "visible",
}) => {
  const theme = useTheme();
  const cardSizing = useCardSizing(mode, density, false);
  const sizing = useDashboardSizing({ 
    mode, 
    density, 
    layout: "grid",
    masonry: false,
    flexible: false 
  });

  const handleClick = () => {
    onMetricClick?.(metric.id);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: "100%",
        minHeight: cardSizing.minHeight,
        maxHeight: maxHeight,
        overflow: overflow,
        borderRadius: cardSizing.borderRadius,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: cardSizing.elevation,
        background: theme.palette.background.paper,
        cursor: onMetricClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
          boxShadow: `0 8px 32px ${alpha(
            theme.palette.common.black,
            0.12
          )}`,
          borderColor: alpha(metric.color, 0.2),
        },
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: cardSizing.padding.xs,
            sm: cardSizing.padding.sm,
            md: cardSizing.padding.md,
          },
          "&:last-child": { pb: cardSizing.padding.sm },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={2} sx={{ height: "100%" }}>
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box
              sx={{
                width: cardSizing.iconSize + 16,
                height: cardSizing.iconSize + 16,
                borderRadius: cardSizing.borderRadius,
                background: `linear-gradient(135deg, ${alpha(
                  metric.color,
                  0.1
                )}, ${alpha(metric.color, 0.05)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${alpha(metric.color, 0.1)}`,
              }}
            >
              {React.cloneElement(metric.icon, {
                sx: {
                  color: metric.color,
                  fontSize: cardSizing.iconSize,
                },
              })}
            </Box>

            {/* Trend indicator */}
            {showTrends && metric.trend && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: alpha(
                    metric.trend.direction === "up"
                      ? theme.palette.success.main
                      : metric.trend.direction === "down"
                      ? theme.palette.error.main
                      : theme.palette.grey[500],
                    0.1
                  ),
                }}
              >
                {metric.trend.direction === "up" ? (
                  <TrendingUp sx={{ fontSize: 14 }} />
                ) : metric.trend.direction === "down" ? (
                  <TrendingDown sx={{ fontSize: 14 }} />
                ) : null}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: sizing.typography.caption,
                    fontWeight: 600,
                    color:
                      metric.trend.direction === "up"
                        ? theme.palette.success.main
                        : metric.trend.direction === "down"
                        ? theme.palette.error.main
                        : theme.palette.grey[600],
                  }}
                >
                  {metric.trend.value > 0 ? "+" : ""}
                  {metric.trend.value}%
                </Typography>
              </Box>
            )}
          </Box>

          {/* Title */}
          <Typography
            variant="body2"
            sx={{
              fontSize: sizing.typography.body,
              fontWeight: 500,
              color: theme.palette.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {metric.title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h4"
            sx={{
              fontSize: sizing.typography.title,
              fontWeight: 700,
              color: metric.color,
              lineHeight: 1.2,
            }}
          >
            {metric.value}
          </Typography>

          {/* Progress bar */}
          {metric.progress !== undefined && (
            <Box sx={{ mt: "auto" }}>
              <LinearProgress
                variant="determinate"
                value={metric.progress * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(metric.color, 0.1),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: metric.color,
                    borderRadius: 3,
                  },
                }}
              />
              {metric.metadata?.target && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: sizing.typography.caption,
                    color: theme.palette.text.secondary,
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  Target: {metric.metadata.target} {metric.metadata.unit}
                </Typography>
              )}
            </Box>
          )}

          {/* Trend label */}
          {showTrends && metric.trend && (
            <Typography
              variant="caption"
              sx={{
                fontSize: sizing.typography.caption,
                color: theme.palette.text.secondary,
                mt: "auto",
              }}
            >
              {metric.trend.label}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = "MetricCard"; 