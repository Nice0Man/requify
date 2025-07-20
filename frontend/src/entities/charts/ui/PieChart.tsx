import React, { memo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme, alpha, Box, CircularProgress, Alert } from '@mui/material';
import type { PieChartProps } from '../model/types';

const CustomTooltip = ({ active, payload }: any) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    const data = payload[0];
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
          {data.name}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: data.payload.fill,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: data.payload.fill,
              boxShadow: `0 2px 4px ${alpha(data.payload.fill, 0.3)}`,
            }}
          />
          <span>
            {data.value?.toLocaleString?.() || data.value} 
            {data.payload.percentage && ` (${data.payload.percentage}%)`}
          </span>
        </Box>
      </Box>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const theme = useTheme();
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

  return (
    <text
      x={x}
      y={y}
      fill={theme.palette.background.paper}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
      fontFamily={theme.typography.fontFamily}
      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PieChart = memo<PieChartProps>(({
  data,
  height = 320,
  width,
  loading = false,
  error = null,
  className,
  showLabels = true,
  showLegend = true,
  donut = false,
  onSliceClick,
  config,
}) => {
  const theme = useTheme();

  // Transform data for Recharts format and calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((point, index) => ({
    name: point.label,
    value: point.value,
    percentage: total > 0 ? ((point.value / total) * 100).toFixed(1) : '0',
    fill: point.color || config?.theme?.colors?.primary?.[index % 6] || theme.palette.primary.main,
    id: point.id,
    label: point.label,
  }));

  // Context7 color palette with enhanced visibility
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

  return (
    <Box 
      className={className} 
      sx={{ 
        height, 
        width: width || '100%',
        '& .recharts-pie-sector': {
          filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.common.black, 0.1)})`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '& .recharts-pie-sector:hover': {
          filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.common.black, 0.15)})`,
          transform: 'scale(1.02)',
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: showLegend ? 60 : 20 
          }}
        >
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? CustomLabel : false}
            outerRadius={Math.min(height, width || height) * 0.3}
            innerRadius={donut ? Math.min(height, width || height) * 0.15 : 0}
            fill="#8884d8"
            dataKey="value"
            onClick={onSliceClick}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.secondary,
              }}
              iconType="circle"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
});

PieChart.displayName = 'PieChart'; 