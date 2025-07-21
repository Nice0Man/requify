import React, { memo } from "react";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ShowChart,
  BarChart,
  PieChart,
  Timeline,
  TrendingUp,
  Refresh,
  DataUsage,
  Analytics,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

interface ChartPlaceholderProps {
  type?: "line" | "bar" | "pie" | "general";
  entity?: "projects" | "requirements" | "teams" | "releases";
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  height?: number;
  className?: string;
}

const getChartIcon = (type: string) => {
  switch (type) {
    case "line":
      return <ShowChart sx={{ fontSize: 48 }} />;
    case "bar":
      return <BarChart sx={{ fontSize: 48 }} />;
    case "pie":
      return <PieChart sx={{ fontSize: 48 }} />;
    default:
      return <Analytics sx={{ fontSize: 48 }} />;
  }
};

const getEntityMessage = (entity: string, t: any) => {
  switch (entity) {
    case "projects":
      return t("charts.placeholder.projects", "No project data available to display charts");
    case "requirements":
      return t("charts.placeholder.requirements", "No requirements data available to display charts");
    case "teams":
      return t("charts.placeholder.teams", "No team data available to display charts");
    case "releases":
      return t("charts.placeholder.releases", "No release data available to display charts");
    default:
      return t("charts.placeholder.general", "No data available to display this chart");
  }
};

export const ChartPlaceholder = memo<ChartPlaceholderProps>(
  ({
    type = "general",
    entity = "projects",
    message,
    actionLabel,
    onAction,
    height = 300,
    className,
  }) => {
    const theme = useTheme();
    const t = i18n.t;

    const displayMessage = message || getEntityMessage(entity, t);
    const defaultActionLabel = actionLabel || t("common.refresh", "Refresh");

    return (
      <Box
        className={className}
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 2,
          border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
          position: "relative",
          overflow: "hidden",
          // Subtle gradient background
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.default, 0.9)} 100%)`,
          // Pattern overlay
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 2px 2px, ${alpha(
              theme.palette.divider,
              0.1
            )} 1px, transparent 0)`,
            backgroundSize: "16px 16px",
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            textAlign: "center",
            zIndex: 1,
            px: 3,
            py: 2,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              color: alpha(theme.palette.text.secondary, 0.6),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              // Subtle animation
              animation: "float 3s ease-in-out infinite",
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-4px)" },
              },
            }}
          >
            {getChartIcon(type)}
          </Box>

          {/* Message */}
          <Stack spacing={1} alignItems="center">
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              {t("charts.placeholder.title", "No Data Available")}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.8),
                fontSize: "0.875rem",
                maxWidth: 280,
                lineHeight: 1.5,
              }}
            >
              {displayMessage}
            </Typography>
          </Stack>

          {/* Action Button */}
          {onAction && (
            <IconButton
              onClick={onAction}
              sx={{
                mt: 1,
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
              aria-label={defaultActionLabel}
            >
              <Refresh />
            </IconButton>
          )}

          {/* Alternative: Text action */}
          {onAction && actionLabel && (
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: "0.75rem",
                mt: 1,
              }}
            >
              {t("charts.placeholder.hint", "Click refresh to reload data")}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }
);

ChartPlaceholder.displayName = "ChartPlaceholder";

// Loading Placeholder for charts
export const ChartLoadingPlaceholder = memo<{
  height?: number;
  type?: "line" | "bar" | "pie";
  className?: string;
}>(({ height = 300, type = "general", className }) => {
  const theme = useTheme();

  return (
    <Box
      className={className}
      sx={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: alpha(theme.palette.background.paper, 0.3),
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${alpha(theme.palette.primary.main, 0.1)} 50%, 
            transparent 100%)`,
          animation: "shimmer 2s infinite",
          "@keyframes shimmer": {
            "0%": { left: "-100%" },
            "100%": { left: "100%" },
          },
        }}
      />

      {/* Content */}
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            color: alpha(theme.palette.primary.main, 0.6),
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.6 },
              "50%": { opacity: 1 },
            },
          }}
        >
          {getChartIcon(type)}
        </Box>
        
        <Typography
          variant="body2"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.8),
            fontSize: "0.875rem",
          }}
        >
          {i18n.t("common.loading", "Loading chart data...")}
        </Typography>
      </Stack>
    </Box>
  );
});

ChartLoadingPlaceholder.displayName = "ChartLoadingPlaceholder"; 