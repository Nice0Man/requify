import { memo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme, alpha, Box, CircularProgress, Alert } from "@mui/material";
import type { BarChartProps } from "../model/types";

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          borderRadius: 3,
          padding: 2,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          minWidth: 140,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box
          sx={{
            fontWeight: 600,
            marginBottom: 1.5,
            color: theme.palette.text.primary,
            fontSize: "0.875rem",
          }}
        >
          {label}
        </Box>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: entry.color,
              fontSize: "0.875rem",
              fontWeight: 500,
              mb: index < payload.length - 1 ? 0.5 : 0,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 1.5,
                backgroundColor: entry.color,
                boxShadow: `0 2px 4px ${alpha(entry.color, 0.3)}`,
              }}
            />
            <span>
              {entry.name}: {entry.value?.toLocaleString?.() || entry.value}
            </span>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export const BarChart = memo<BarChartProps>(
  ({
    data,
    height = 320,
    width,
    loading = false,
    error = null,
    className,
    horizontal = false,
    stacked = false,
    grouped = false,
    onPointClick,
    config,
  }) => {
    const theme = useTheme();

    // Responsive values based on screen size
    const getResponsiveValues = () => {
      const isSmall = window.innerWidth < (theme.breakpoints.values.sm || 600);
      return {
        margin: {
          top: isSmall ? 10 : 20,
          right: isSmall ? 15 : 30,
          left: horizontal ? (isSmall ? 60 : 80) : isSmall ? 10 : 20,
          bottom: isSmall ? 10 : 20,
        },
        fontSize: isSmall ? 11 : 12,
        axisWidth: isSmall ? 50 : 60,
        axisHeight: isSmall ? 50 : 60,
        yAxisWidth: isSmall ? 80 : 100,
      };
    };

    const responsiveValues = getResponsiveValues();

    // Transform data for Recharts format
    const chartData = data.map((point, index) => ({
      name: point.label,
      value: point.value,
      label: point.label,
      color:
        point.color ||
        config?.theme?.colors?.primary?.[index % 6] ||
        theme.palette.primary.main,
      id: point.id,
      metadata: point.metadata,
    }));

    // Context7 color palette with vibrant gradients
    const chartColors = config?.theme?.colors?.primary || [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];

    if (loading) {
      return (
        <Box
          className={className}
          sx={{
            height,
            width: width || "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 2,
          }}
        >
          <CircularProgress
            size={40}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
            }}
          />
        </Box>
      );
    }

    if (error) {
      return (
        <Box className={className} sx={{ height, width: width || "100%" }}>
          <Alert
            severity="error"
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            {error}
          </Alert>
        </Box>
      );
    }

    const barProps = {
      dataKey: "value",
      fill: chartColors[0],
      radius: horizontal
        ? ([0, 6, 6, 0] as [number, number, number, number])
        : ([6, 6, 0, 0] as [number, number, number, number]),
      onClick: onPointClick
        ? (data: any) => {
            const point = chartData.find((item) => item.name === data.name);
            if (point) onPointClick(point);
          }
        : undefined,
    };

    return (
      <Box
        className={className}
        sx={{
          height,
          width: width || "100%",
          display: "flex",
          flexDirection: "column",
          "& .recharts-cartesian-grid-horizontal line": {
            stroke: alpha(theme.palette.divider, 0.08),
          },
          "& .recharts-cartesian-grid-vertical line": {
            stroke: alpha(theme.palette.divider, 0.08),
          },
          "& .recharts-bar-rectangle": {
            filter: `drop-shadow(0 2px 4px ${alpha(
              theme.palette.common.black,
              0.1
            )})`,
          },
          "& .recharts-wrapper": {
            width: "100% !important",
            height: "100% !important",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            layout={horizontal ? "horizontal" : "vertical"}
            margin={responsiveValues.margin}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.divider, 0.1)}
              horizontal={!horizontal}
              vertical={horizontal}
            />

            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontSize: responsiveValues.fontSize,
                    fontWeight: 500,
                    fontFamily: theme.typography.fontFamily,
                  }}
                  axisLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickMargin={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontSize: responsiveValues.fontSize,
                    fontWeight: 500,
                    fontFamily: theme.typography.fontFamily,
                  }}
                  axisLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickMargin={12}
                  width={responsiveValues.yAxisWidth}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontSize: responsiveValues.fontSize,
                    fontWeight: 500,
                    fontFamily: theme.typography.fontFamily,
                  }}
                  axisLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickMargin={12}
                  height={responsiveValues.axisHeight}
                />
                <YAxis
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontSize: responsiveValues.fontSize,
                    fontWeight: 500,
                    fontFamily: theme.typography.fontFamily,
                  }}
                  axisLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickLine={{
                    stroke: alpha(theme.palette.divider, 0.2),
                    strokeWidth: 1,
                  }}
                  tickMargin={12}
                  width={responsiveValues.axisWidth}
                />
              </>
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "16px",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.secondary,
              }}
            />

            <Bar {...barProps}>
              {chartData.map((entry, index) => {
                const color =
                  entry.color || chartColors[index % chartColors.length];
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#bar-gradient-${index})`}
                  />
                );
              })}
            </Bar>

            {/* Gradient definitions for each bar */}
            <defs>
              {chartData.map((entry, index) => {
                const color =
                  entry.color || chartColors[index % chartColors.length];
                return (
                  <linearGradient
                    key={`bar-gradient-${index}`}
                    id={`bar-gradient-${index}`}
                    x1="0"
                    y1="0"
                    x2={horizontal ? "1" : "0"}
                    y2={horizontal ? "0" : "1"}
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                );
              })}
            </defs>
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    );
  }
);

BarChart.displayName = "BarChart";
