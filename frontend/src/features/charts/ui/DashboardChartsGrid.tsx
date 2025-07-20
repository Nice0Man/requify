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
  Fade,
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
 * Collapsible Chart Card with smooth animations and best UX practices
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
      if (isAnimating) return; // Prevent rapid clicks during animation

      setIsAnimating(true);

      startTransition(() => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        onToggle?.(newExpanded);

        // Reset animation state after transition
        setTimeout(() => setIsAnimating(false), 300);
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
          height: "100%", // Consistent height for all cards
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: { xs: "none", sm: "translateY(-2px)" }, // No transform on mobile
            boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.08)}`,
            borderColor: alpha(color, 0.2),
          },
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
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
                    transform: { xs: "none", sm: "scale(1.1)" }, // No transform on mobile
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
                    transform: { xs: "none", sm: "scale(1.05)" }, // No transform on mobile
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
            px: { xs: 2, sm: 3 }, // Responsive padding
            pt: { xs: 2, sm: 2.5 },
            "& .MuiCardHeader-content": {
              display: "flex",
              alignItems: "center",
              overflow: "hidden", // Prevent text overflow
            },
            cursor: "pointer",
            userSelect: "none",
            flexShrink: 0, // Prevent header from shrinking
          }}
          onClick={handleToggle}
        />

        <Collapse
          in={expanded}
          timeout={300}
          easing={{
            enter: "cubic-bezier(0.4, 0, 0.2, 1)",
            exit: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          unmountOnExit={false} // Keep content mounted for better performance
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <CardContent
            id={`chart-content-${chartId}`}
            sx={{
              pt: 0,
              pb: { xs: 2, sm: 3 }, // Responsive bottom padding
              px: { xs: 2, sm: 3 }, // Responsive horizontal padding
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              opacity: expanded ? 1 : 0,
              transition: "opacity 0.2s ease",
              overflow: "hidden", // Prevent content overflow
            }}
          >
            <Fade in={expanded} timeout={200}>
              <Box sx={{ height: "100%", minHeight: 0 }}>{children}</Box>
            </Fade>
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

    // Responsive chart height based on screen size
    const getChartHeight = () => {
      if (
        theme.breakpoints.values.md &&
        window.innerWidth >= theme.breakpoints.values.md
      ) {
        return 340;
      }
      if (
        theme.breakpoints.values.sm &&
        window.innerWidth >= theme.breakpoints.values.sm
      ) {
        return 320;
      }
      return 280;
    };

    const chartHeight = getChartHeight();

    // State for tracking which charts are expanded
    const [chartStates, setChartStates] = useState({
      projectStatus: true,
      requirementsTimeline: true,
      projectProgress: true,
      teamWorkload: false, // Less important chart starts collapsed
    });

    // Handle chart toggle with analytics
    const handleChartToggle = useCallback(
      (chartId: string) => (expanded: boolean) => {
        setChartStates((prev) => ({
          ...prev,
          [chartId]: expanded,
        }));

        // Analytics tracking (optional)
        console.log(`Chart ${chartId} ${expanded ? "expanded" : "collapsed"}`);
      },
      []
    );

    // Helper function to check if data is empty
    const hasData = (data: any) => {
      return data && Array.isArray(data) && data.length > 0;
    };

    const renderChart = (
      chartComponent: React.ReactNode,
      hasDataCheck: boolean
    ) => {
      if (loading) {
        return <EmptyStateChart variant="loading" height={300} />;
      }

      if (error) {
        return (
          <EmptyStateChart variant="error" height={300} description={error} />
        );
      }

      if (!hasDataCheck) {
        return <EmptyStateChart variant="empty" height={300} />;
      }

      return chartComponent;
    };

    return (
      <Box className={className}>
        {/* Charts Grid - Responsive layout with consistent spacing */}
        <Grid
          container
          spacing={{ xs: 2, sm: 2.5, md: 3 }} // Responsive spacing
          sx={{
            // Ensure consistent alignment
            "& .MuiGrid-item": {
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {/* First Row */}
          <Grid item xs={12} md={6} xl={6}>
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

          <Grid item xs={12} md={6} xl={6}>
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

          {/* Second Row */}
          <Grid item xs={12} md={6} xl={6}>
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

          <Grid item xs={12} md={6} xl={6}>
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

          {/* Optional Third Row - Performance charts */}
          {hasData(teamMetrics?.performance) && (
            <Grid item xs={12} lg={6} xl={6}>
              <CollapsibleChartCard
                title={t(
                  "dashboard.charts.teamPerformance",
                  "Team Performance Trend"
                )}
                icon={<Speed />}
                color={theme.palette.error.main}
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
