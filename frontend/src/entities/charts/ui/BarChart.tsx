import { memo, useRef, useEffect, useState } from "react";
import { Box, useTheme, alpha, Typography } from "@mui/material";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// Chart types
export interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  loading?: boolean;
  error?: string | null;
  className?: string;
  horizontal?: boolean;
  stacked?: boolean;
  grouped?: boolean;
  onPointClick?: (point: ChartDataPoint) => void;
  config?: {
    theme?: {
      colors?: {
        primary?: string[];
      };
    };
  };
  // New responsive props
  responsive?: boolean;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  debounceMs?: number;
}

export const BarChart = memo<BarChartProps>(
  ({
    data,
    height = 320,
    loading = false,
    error = null,
    className,
    horizontal = false,
    onPointClick,
    config,
    responsive = true,
    minHeight = 200,
    maxHeight = 600,
    aspectRatio = 16 / 9,
    debounceMs = 150,
  }) => {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Responsive values based on screen size and container
    const getResponsiveValues = () => {
      const isSmall = containerSize.width < 600;
      const isMedium = containerSize.width < 960;
      
      return {
        margin: {
          top: isSmall ? 10 : 20,
          right: isSmall ? 15 : 30,
          left: horizontal ? (isSmall ? 60 : 80) : isSmall ? 10 : 20,
          bottom: isSmall ? 10 : 20,
        },
        fontSize: isSmall ? 11 : isMedium ? 12 : 13,
        axisWidth: isSmall ? 50 : 60,
        axisHeight: isSmall ? 50 : 60,
        yAxisWidth: isSmall ? 80 : 100,
        barRadius: isSmall ? 2 : 3,
        barGap: isSmall ? 2 : 4,
      };
    };

    const responsiveValues = getResponsiveValues();

    // Debounced resize observer
    useEffect(() => {
      if (!responsive || !containerRef.current) return;

      let timeoutId: NodeJS.Timeout;
      
      const resizeObserver = new ResizeObserver((entries) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          for (const entry of entries) {
            const { width } = entry.contentRect;
            
            // Calculate adaptive height based on container width and aspect ratio
            let adaptiveHeight = responsive 
              ? Math.max(minHeight, Math.min(maxHeight, width / aspectRatio))
              : height;
              
            setContainerSize({ 
              width, 
              height: adaptiveHeight 
            });
          }
        }, debounceMs);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
      };
    }, [responsive, minHeight, maxHeight, aspectRatio, height, debounceMs]);

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

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;

      const data = payload[0].payload;

      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[8],
            maxWidth: 250,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Значение: {payload[0].value}
          </Typography>
          {data.metadata && (
            <Typography variant="caption" color="text.secondary">
              {JSON.stringify(data.metadata, null, 2)}
            </Typography>
          )}
        </Box>
      );
    };

    // Handle bar click
    const handleBarClick = (data: any) => {
      if (onPointClick) {
        const originalPoint = chartData.find((point) => point.id === data.id);
        if (originalPoint) {
          onPointClick({
            id: originalPoint.id,
            label: originalPoint.label,
            value: originalPoint.value,
            color: originalPoint.color,
            metadata: originalPoint.metadata,
          });
        }
      }
    };

    if (loading) {
      return (
        <Box
          ref={containerRef}
          className={className}
          sx={{
            height: responsive ? containerSize.height || height : height,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(theme.palette.grey[100], 0.5),
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Загрузка графика...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          ref={containerRef}
          className={className}
          sx={{
            height: responsive ? containerSize.height || height : height,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          <Typography variant="body2" color="error">
            Ошибка: {error}
          </Typography>
        </Box>
      );
    }

    const finalHeight = responsive ? containerSize.height || height : height;

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={{
          height: finalHeight,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
          "& .recharts-tooltip-wrapper": {
            zIndex: 1000,
          },
        }}
      >
        <ResponsiveContainer 
          width="100%" 
          height="100%"
          minHeight={minHeight}
          maxHeight={responsive ? maxHeight : undefined}
        >
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
                  tick={{ fontSize: responsiveValues.fontSize }}
                  stroke={theme.palette.text.secondary}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: responsiveValues.fontSize }}
                  stroke={theme.palette.text.secondary}
                  width={responsiveValues.yAxisWidth}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: responsiveValues.fontSize }}
                  stroke={theme.palette.text.secondary}
                  height={responsiveValues.axisHeight}
                />
                <YAxis
                  tick={{ fontSize: responsiveValues.fontSize }}
                  stroke={theme.palette.text.secondary}
                  width={responsiveValues.axisWidth}
                />
              </>
            )}

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="value"
              radius={[responsiveValues.barRadius, responsiveValues.barRadius, 0, 0]}
              onClick={handleBarClick}
              cursor={onPointClick ? "pointer" : "default"}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || chartColors[index % chartColors.length]}
                />
              ))}
              
              {/* Add labels if space allows */}
              {containerSize.width > 400 && (
                <LabelList
                  dataKey="value"
                  position={horizontal ? "right" : "top"}
                  style={{
                    fontSize: responsiveValues.fontSize - 1,
                    fill: theme.palette.text.secondary,
                  }}
                />
              )}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    );
  }
);

BarChart.displayName = "BarChart";
