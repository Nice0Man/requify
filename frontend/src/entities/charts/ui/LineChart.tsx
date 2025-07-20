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
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          borderRadius: 3,
          padding: 2,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          minWidth: 140,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box sx={{ 
          fontWeight: 600, 
          marginBottom: 1.5, 
          color: theme.palette.text.primary,
          fontSize: '0.875rem'
        }}>
          {label}
        </Box>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: entry.color,
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: index < payload.length - 1 ? 0.5 : 0,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: entry.color,
                boxShadow: `0 2px 4px ${alpha(entry.color, 0.3)}`,
              }}
            />
            <span>{entry.name}: {entry.value?.toLocaleString?.() || entry.value}</span>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export const LineChart = memo<LineChartProps>(({
  data,
  height = 320,
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
  const chartData = data.map((point, _index) => ({
    name: point.label || new Date(point.date).toLocaleDateString('ru-RU', { 
      month: 'short', 
      day: 'numeric' 
    }),
    category: point.category,
    ...point,
  }));

  // Context7 color palette with gradients
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
          width: width || '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
      <Box className={className} sx={{ height, width: width || '100%' }}>
        <Alert 
          severity="error" 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const ChartComponent = area ? AreaChart : RechartsLineChart;
  const primaryColor = chartColors[0];

  return (
    <Box 
      className={className} 
      sx={{ 
        height, 
        width: width || '100%',
        '& .recharts-cartesian-grid-horizontal line': {
          stroke: alpha(theme.palette.divider, 0.08),
        },
        '& .recharts-cartesian-grid-vertical line': {
          stroke: alpha(theme.palette.divider, 0.08),
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 20 
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.divider, 0.1)}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            tick={{ 
              fill: theme.palette.text.secondary, 
              fontSize: 12,
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
            height={60}
          />
          <YAxis
            tick={{ 
              fill: theme.palette.text.secondary, 
              fontSize: 12,
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
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '16px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.text.secondary,
            }}
          />
          
          {area ? (
            <Area
              type={smooth ? "monotone" : "linear"}
              dataKey="value"
              stroke={primaryColor}
              fill={`url(#gradient-${primaryColor.replace('#', '')})`}
              strokeWidth={3}
              dot={showPoints ? { 
                fill: theme.palette.background.paper, 
                stroke: primaryColor,
                strokeWidth: 3, 
                r: 5,
                filter: `drop-shadow(0 2px 4px ${alpha(primaryColor, 0.3)})`,
              } : false}
              activeDot={{ 
                r: 7, 
                stroke: primaryColor, 
                strokeWidth: 3, 
                fill: theme.palette.background.paper,
                filter: `drop-shadow(0 4px 8px ${alpha(primaryColor, 0.4)})`,
              }}
              onClick={onPointClick as any}
            />
          ) : (
            <Line
              type={smooth ? "monotone" : "linear"}
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={3}
              dot={showPoints ? { 
                fill: theme.palette.background.paper, 
                stroke: primaryColor,
                strokeWidth: 3, 
                r: 5,
                filter: `drop-shadow(0 2px 4px ${alpha(primaryColor, 0.3)})`,
              } : false}
              activeDot={{ 
                r: 7, 
                stroke: primaryColor, 
                strokeWidth: 3, 
                fill: theme.palette.background.paper,
                filter: `drop-shadow(0 4px 8px ${alpha(primaryColor, 0.4)})`,
              }}
              onClick={onPointClick as any}
            />
          )}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient 
              id={`gradient-${primaryColor.replace('#', '')}`} 
              x1="0" y1="0" x2="0" y2="1"
            >
              <stop 
                offset="0%" 
                stopColor={primaryColor} 
                stopOpacity={0.2}
              />
              <stop 
                offset="100%" 
                stopColor={primaryColor} 
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
        </ChartComponent>
      </ResponsiveContainer>
    </Box>
  );
});

LineChart.displayName = 'LineChart'; 