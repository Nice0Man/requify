import React, { memo } from 'react';
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
} from 'recharts';
import { useTheme, alpha, Box, CircularProgress, Alert } from '@mui/material';
import type { BarChartProps } from '../model/types';

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
                borderRadius: 1,
                backgroundColor: entry.color,
              }}
            />
            <span>{entry.name}: {entry.value.toLocaleString()}</span>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export const BarChart = memo<BarChartProps>(({
  data,
  height = 300,
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

  // Transform data for Recharts format
  const chartData = data.map((point, index) => ({
    name: point.label,
    value: point.value,
    color: point.color || config?.theme?.colors?.primary?.[index % 5] || theme.palette.primary.main,
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

  const barProps = {
    dataKey: "value",
    fill: chartColors[0],
    radius: [4, 4, 0, 0],
    onClick: onPointClick,
  };

  return (
    <Box className={className} sx={{ height, width: width || '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? "horizontal" : "vertical"}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={alpha(theme.palette.divider, 0.3)}
            horizontal={!horizontal}
            vertical={horizontal}
          />
          
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
                tickLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
                tickLine={{ stroke: alpha(theme.palette.divider, 0.5) }}
                width={100}
              />
            </>
          ) : (
            <>
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
            </>
          )}
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Bar {...barProps}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || chartColors[index % chartColors.length]}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
});

BarChart.displayName = 'BarChart'; 