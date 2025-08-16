import React, { memo, useState, useCallback, startTransition } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  TrendingUp,
  Speed,
} from "@mui/icons-material";
import { LineChart, BarChart, PieChart } from "@/entities/charts";
import { EmptyStateChart } from "@/shared/ui/placeholders/EmptyStateChart";
import type {
  ProjectMetrics,
  RequirementMetrics,
  TeamMetrics,
  SystemMetrics,
} from "@/entities/charts";
import i18n from "@/shared/lib/i18n";

interface DashboardChartsGridProps {
  projectMetrics?: ProjectMetrics;
  requirementMetrics?: RequirementMetrics;
  teamMetrics?: TeamMetrics;
  systemMetrics?: SystemMetrics;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

interface CollapsibleChartCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  chartId: string;
}

/**
 * Collapsible Chart Card with balanced styling and smooth animations
 */
const CollapsibleChartCard = memo<CollapsibleChartCardProps>(
  ({
    title,
    icon,
    color,
    children,
    defaultExpanded = true,
    onToggle,
    chartId,
  }) => {
    const theme = useTheme();
    const t = i18n.t;
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggle = useCallback(() => {
      if (isAnimating) return;

      setIsAnimating(true);
      startTransition(() => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        onToggle?.(newExpanded);
        setTimeout(() => setIsAnimating(false), 350);
      });
    }, [expanded, onToggle, isAnimating]);

    return (
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
          background: theme.palette.background.paper,
          overflow: "hidden",
          // Fixed consistent height structure
          minHeight: expanded ? 420 : 80,
          maxHeight: expanded ? "none" : 80,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: { xs: "none", sm: "translateY(-2px)" },
            boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.08)}`,
            borderColor: alpha(color, 0.2),
          },
        }}
      >
        {/* Header - always visible with consistent styling */}
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${color}, ${alpha(
                    color,
                    0.7
                  )})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 16,
                  transition: "transform 0.2s ease",
                  ...(expanded && {
                    transform: { xs: "none", sm: "scale(1.1)" },
                  }),
                }}
              >
                {icon}
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: theme.palette.text.primary,
                  userSelect: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Typography>
            </Box>
          }
          action={
            <Tooltip
              title={
                expanded
                  ? t("charts.collapse", "Collapse")
                  : t("charts.expand", "Expand")
              }
              arrow
              enterDelay={500}
            >
              <IconButton
                onClick={handleToggle}
                disabled={isAnimating}
                aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
                aria-expanded={expanded}
                aria-controls={`chart-content-${chartId}`}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: alpha(color, 0.08),
                    borderColor: alpha(color, 0.2),
                    transform: { xs: "none", sm: "scale(1.05)" },
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <Box
                  sx={{
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
                    color: expanded ? color : theme.palette.text.secondary,
                  }}
                >
                  <ExpandMore fontSize="small" />
                </Box>
              </IconButton>
            </Tooltip>
          }
          sx={{
            pb: 1,
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 2.5 },
            cursor: "pointer",
            userSelect: "none",
            flexShrink: 0,
            // Fixed header height
            minHeight: 76,
            "& .MuiCardHeader-content": {
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            },
          }}
          onClick={handleToggle}
        />

        {/* Content - collapsible with CSS-only animations */}
        <Collapse
          in={expanded}
          timeout={{
            enter: 350,
            exit: 300,
          }}
          easing={{
            enter: "cubic-bezier(0.4, 0, 0.2, 1)",
            exit: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          unmountOnExit={false}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent
            id={`chart-content-${chartId}`}
            sx={{
              pt: 0,
              pb: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              // Fixed content height for consistency
              minHeight: 320,
              // CSS-only transition instead of problematic Fade
              opacity: expanded ? 1 : 0,
              transform: expanded ? "translateY(0)" : "translateY(-10px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box
              sx={{
                height: "100%",
                minHeight: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    );
  }
);

CollapsibleChartCard.displayName = "CollapsibleChartCard";

export const DashboardChartsGrid = memo<DashboardChartsGridProps>(
  ({
    projectMetrics,
    requirementMetrics,
    teamMetrics,
    loading = false,
    error = null,
    className,
  }) => {
    const theme = useTheme();
    const t = i18n.t;

    // Responsive chart height - consistent for all charts
    const getChartHeight = () => {
      if (window.innerWidth >= 1280) return 280; // xl
      if (window.innerWidth >= 960) return 260; // lg/md
      if (window.innerWidth >= 600) return 240; // sm
      return 220; // xs
    };

    const chartHeight = getChartHeight();

    // State for tracking which charts are expanded - better defaults
    const [chartStates, setChartStates] = useState({
      projectStatus: true, // Most important - always visible
      requirementsTimeline: true, // Important data - visible
      projectProgress: false, // Secondary - collapsed by default
      teamWorkload: false, // Less important - collapsed by default
    });

    // Handle chart toggle with better state management
    const handleChartToggle = useCallback(
      (chartId: string) => (expanded: boolean) => {
        setChartStates((prev) => ({
          ...prev,
          [chartId]: expanded,
        }));
      },
      []
    );

    // Helper function to check if data is available
    const hasData = (data: any) => {
      return data && Array.isArray(data) && data.length > 0;
    };

    // Unified chart rendering with consistent error handling
    const renderChart = (
      chartComponent: React.ReactNode,
      hasDataCheck: boolean
    ) => {
      if (loading) {
        return (
          <EmptyStateChart
            variant="loading"
            height={chartHeight}
            description={t("charts.loading", "Loading chart data...")}
          />
        );
      }

      if (error) {
        return (
          <EmptyStateChart
            variant="error"
            height={chartHeight}
            description={error}
          />
        );
      }

      if (!hasDataCheck) {
        return (
          <EmptyStateChart
            variant="empty"
            height={chartHeight}
            description={t("charts.noData", "No data available")}
          />
        );
      }

      return chartComponent;
    };

    return (
      <Box className={className}>
        {/* Balanced Grid Layout - consistent spacing and alignment */}
        <Grid
          container
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{
            // Force equal height items in each row
            "& .MuiGrid-item": {
              display: "flex",
              flexDirection: "column",
            },
            // Ensure proper alignment on all screen sizes
            alignItems: "stretch",
          }}
        >
          {/* Row 1: Primary Charts - always 2 columns */}
          <Grid item xs={12} lg={6}>
            <CollapsibleChartCard
              title={t(
                "dashboard.charts.projectStatus",
                "Project Status Distribution"
              )}
              icon={<PieChartIcon />}
              color={theme.palette.primary.main}
              chartId="projectStatus"
              defaultExpanded={chartStates.projectStatus}
              onToggle={handleChartToggle("projectStatus")}
            >
              {renderChart(
                <PieChart
                  data={
                    projectMetrics?.statusDistribution?.map((item) => ({
                      id: item.status,
                      label: item.label || item.status,
                      value: item.count,
                      color: item.color,
                    })) || []
                  }
                  height={chartHeight}
                  loading={loading}
                  error={error}
                  showLabels
                  showLegend
                />,
                hasData(projectMetrics?.statusDistribution)
              )}
            </CollapsibleChartCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <CollapsibleChartCard
              title={t(
                "dashboard.charts.requirementsTimeline",
                "Requirements Timeline"
              )}
              icon={<Timeline />}
              color={theme.palette.secondary.main}
              chartId="requirementsTimeline"
              defaultExpanded={chartStates.requirementsTimeline}
              onToggle={handleChartToggle("requirementsTimeline")}
            >
              {renderChart(
                <LineChart
                  data={requirementMetrics?.timeline || []}
                  height={chartHeight}
                  loading={loading}
                  error={error}
                  showPoints
                  showGrid
                  smooth
                />,
                hasData(requirementMetrics?.timeline)
              )}
            </CollapsibleChartCard>
          </Grid>

          {/* Row 2: Secondary Charts - 2 columns */}
          <Grid item xs={12} lg={6}>
            <CollapsibleChartCard
              title={t(
                "dashboard.charts.projectProgress",
                "Project Progress Timeline"
              )}
              icon={<TrendingUp />}
              color={theme.palette.success.main}
              chartId="projectProgress"
              defaultExpanded={chartStates.projectProgress}
              onToggle={handleChartToggle("projectProgress")}
            >
              {renderChart(
                <LineChart
                  data={projectMetrics?.timeline || []}
                  height={chartHeight}
                  loading={loading}
                  error={error}
                  showPoints
                  showGrid
                  smooth
                  area
                />,
                hasData(projectMetrics?.timeline)
              )}
            </CollapsibleChartCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <CollapsibleChartCard
              title={t(
                "dashboard.charts.teamWorkload",
                "Team Workload Distribution"
              )}
              icon={<BarChartIcon />}
              color={theme.palette.info.main}
              chartId="teamWorkload"
              defaultExpanded={chartStates.teamWorkload}
              onToggle={handleChartToggle("teamWorkload")}
            >
              {renderChart(
                <BarChart
                  data={teamMetrics?.workload || []}
                  height={chartHeight}
                  loading={loading}
                  error={error}
                  horizontal
                />,
                hasData(teamMetrics?.workload)
              )}
            </CollapsibleChartCard>
          </Grid>

          {/* Row 3: Optional Performance Chart - only show if data exists */}
          {hasData(teamMetrics?.performance) && (
            <Grid item xs={12} lg={8} xl={6}>
              <CollapsibleChartCard
                title={t(
                  "dashboard.charts.teamPerformance",
                  "Team Performance Trend"
                )}
                icon={<Speed />}
                color={theme.palette.warning.main}
                chartId="teamPerformance"
                defaultExpanded={false}
                onToggle={handleChartToggle("teamPerformance")}
              >
                {renderChart(
                  <LineChart
                    data={teamMetrics?.performance || []}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                    showPoints
                    showGrid
                    smooth
                  />,
                  hasData(teamMetrics?.performance)
                )}
              </CollapsibleChartCard>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
);

DashboardChartsGrid.displayName = "DashboardChartsGrid";
