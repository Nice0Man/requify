import React, { memo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { useTheme, alpha, Box, CircularProgress, Alert } from '@mui/material';
import type { PieChartProps } from '../model/types';

export const PieChart = memo<PieChartProps>(({
  data,
  height = 300,
  width,
  loading = false,
  error = null,
  className,
  innerRadius = 0,
  outerRadius = 0.8,
  showLabels = true,
  showLegend = true,
  onPointClick,
  config,
}) => {
  const theme = useTheme();

  // Transform data for Nivo format
  const chartData = data.map((point, index) => ({
    id: point.label,
    label: point.label,
    value: point.value,
    color: point.color || config?.theme?.colors?.primary?.[index % 5] || theme.palette.primary.main,
  }));

  const chartColors = config?.theme?.colors?.primary || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
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

  return (
    <Box className={className} sx={{ height, width: width || '100%' }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={innerRadius}
        padAngle={1}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={2}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.3]]
        }}
        enableArcLinkLabels={showLabels}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={theme.palette.text.primary}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        enableArcLabels={showLabels}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        onClick={onPointClick}
        theme={{
          background: 'transparent',
          text: {
            fill: theme.palette.text.primary,
            fontSize: 12,
            fontFamily: theme.typography.fontFamily,
          },
          tooltip: {
            container: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: theme.shape.borderRadius * 2,
              boxShadow: theme.shadows[8],
              padding: '12px 16px',
            },
          },
          legends: showLegend ? {
            text: {
              fill: theme.palette.text.primary,
              fontSize: 12,
              fontFamily: theme.typography.fontFamily,
            },
          } : undefined,
        }}
        legends={showLegend ? [
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: theme.palette.text.primary,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: theme.palette.text.primary,
                  itemOpacity: 0.8,
                }
              }
            ]
          }
        ] : []}
        motionConfig="gentle"
        transitionMode="startAngle"
      />
    </Box>
  );
});

PieChart.displayName = 'PieChart'; 