import React, { memo } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { LineChart, BarChart, PieChart, MetricCard } from "@/entities/charts";
import type {
  ChartMetric,
  TimeSeriesDataPoint,
  ChartDataPoint,
  ProjectMetrics,
  RequirementMetrics,
  TeamMetrics,
  SystemMetrics,
} from "@/entities/charts";
import { Assessment, TrendingUp, Group, Speed } from "@mui/icons-material";

interface DashboardChartsGridProps {
  projectMetrics?: ProjectMetrics;
  requirementMetrics?: RequirementMetrics;
  teamMetrics?: TeamMetrics;
  systemMetrics?: SystemMetrics;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const DashboardChartsGrid = memo<DashboardChartsGridProps>(
  ({
    projectMetrics,
    requirementMetrics,
    teamMetrics,
    systemMetrics,
    loading = false,
    error = null,
    className,
  }) => {
    const theme = useTheme();

    // Transform metrics to chart format
    const keyMetrics: ChartMetric[] = [
      {
        id: "total-projects",
        title: "Total Projects",
        value: projectMetrics?.totalProjects || 0,
        icon: <Assessment />,
        color: theme.palette.primary.main,
        format: "number",
        trend: projectMetrics?.trends?.[0],
      },
      {
        id: "completion-rate",
        title: "Project Completion Rate",
        value: projectMetrics?.avgProgress || 0,
        icon: <TrendingUp />,
        color: theme.palette.success.main,
        format: "percentage",
        target: 100,
        trend: projectMetrics?.trends?.[1],
      },
      {
        id: "team-members",
        title: "Active Team Members",
        value: teamMetrics?.activeMembers || 0,
        icon: <Group />,
        color: theme.palette.info.main,
        format: "number",
      },
      {
        id: "system-performance",
        title: "System Performance",
        value: Math.round(100 - (systemMetrics?.cpuUsage || 0)),
        icon: <Speed />,
        color: theme.palette.warning.main,
        format: "percentage",
        target: 95,
      },
    ];

    const chartHeight = 300;

    return (
      <Box className={className}>
        <Grid container spacing={3}>
          {/* Key Metrics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {keyMetrics.map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.id}>
                  <MetricCard
                    metric={metric}
                    variant="default"
                    showTrend
                    showProgress
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Project Status Distribution */}
          {projectMetrics?.statusDistribution && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Project Status Distribution"
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent>
                  <PieChart
                    data={projectMetrics.statusDistribution.map((item) => ({
                      id: item.status,
                      label: item.label || item.status,
                      value: item.count,
                      color: item.color,
                    }))}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                    showLabels
                    showLegend
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Requirements Timeline */}
          {requirementMetrics?.timeline && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Requirements Timeline"
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent>
                  <LineChart
                    data={requirementMetrics.timeline}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                    showPoints
                    showGrid
                    smooth
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Project Progress Over Time */}
          {projectMetrics?.timeline && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Project Progress Timeline"
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent>
                  <LineChart
                    data={projectMetrics.timeline}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                    showPoints
                    showGrid
                    smooth
                    area
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Team Workload Distribution */}
          {teamMetrics?.workload && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Team Workload Distribution"
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent>
                  <BarChart
                    data={teamMetrics.workload}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                    horizontal
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Requirements Status Distribution */}
          {requirementMetrics?.statusDistribution && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Requirements Status"
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent>
                  <BarChart
                    data={requirementMetrics.statusDistribution.map((item) => ({
                      id: item.status,
                      label: item.label || item.status,
                      value: item.count,
                      color: item.color,
                    }))}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Team Performance Trend */}
          {teamMetrics?.performance && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Team Performance Trend"
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                />
                <CardContent>
                  <LineChart
                    data={teamMetrics.performance}
                    height={chartHeight}
                    loading={loading}
                    error={error}
                    showPoints
                    showGrid
                    smooth
                  />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
);

DashboardChartsGrid.displayName = "DashboardChartsGrid";
