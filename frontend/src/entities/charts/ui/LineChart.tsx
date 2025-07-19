import React, { memo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useTheme, alpha, Box, CircularProgress, Alert } from '@mui/material';
import type { LineChartProps } from '../model/types';

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          padding: 2,
          boxShadow: theme.shadows[8],
          minWidth: 120,
        }}
      >
        <Box sx={{ fontWeight: 600, marginBottom: 1, color: theme.palette.text.primary }}>
          {label}
        </Box>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: entry.color,
              fontSize: '0.875rem',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <span>{entry.name}: {entry.value}</span>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export const LineChart = memo<LineChartProps>(({
  data,
  height = 300,
  width,
  loading = false,
  error = null,
  className,
  showPoints = true,
  showGrid = true,
  smooth = false,
  area = false,
  onPointClick,
  config,
}) => {
  const theme = useTheme();

  // Transform data for Recharts format
  const chartData = data.map((point) => ({
    name: point.label || new Date(point.date).toLocaleDateString(),
    value: point.value,
    category: point.category,
    ...point,
  }));

  const chartColors = config?.theme?.colors?.primary || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  if (loading) {
    return (
      <Box
        className={className}
        sx={{
          height,
          width: width || '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className} sx={{ height, width: width || '100%' }}>
        <Alert severity="error" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const ChartComponent = area ? AreaChart : RechartsLineChart;

  return (
    <Box className={className} sx={{ height, width: width || '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.divider, 0.3)}
            />
          )}
          <XAxis
            dataKey="name"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
            tickLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
            tickLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {area ? (
            <Area
              type={smooth ? "monotone" : "linear"}
              dataKey="value"
              stroke={chartColors[0]}
              fill={alpha(chartColors[0], 0.3)}
              strokeWidth={2}
              dot={showPoints ? { fill: chartColors[0], strokeWidth: 2, r: 4 } : false}
              activeDot={{ r: 6, stroke: chartColors[0], strokeWidth: 2, fill: theme.palette.background.paper }}
              onClick={onPointClick}
            />
          ) : (
            <Line
              type={smooth ? "monotone" : "linear"}
              dataKey="value"
              stroke={chartColors[0]}
              strokeWidth={2}
              dot={showPoints ? { fill: chartColors[0], strokeWidth: 2, r: 4 } : false}
              activeDot={{ r: 6, stroke: chartColors[0], strokeWidth: 2, fill: theme.palette.background.paper }}
              onClick={onPointClick}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Box>
  );
});

LineChart.displayName = 'LineChart'; 