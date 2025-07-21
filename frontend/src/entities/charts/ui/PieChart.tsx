import { memo, useRef, useEffect, useState } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme, alpha, Box, CircularProgress, Alert } from "@mui/material";
import type { PieChartProps } from "../model/types";

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
        <Box
          sx={{
            fontWeight: 600,
            marginBottom: 1,
            color: theme.palette.text.primary,
            fontSize: "0.875rem",
          }}
        >
          {data.payload.label}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: data.payload.color,
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: data.payload.color,
              boxShadow: `0 2px 4px ${alpha(data.payload.color, 0.3)}`,
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

const CustomLegend = ({ payload }: any) => {
  const theme = useTheme();

  if (!payload || !payload.length) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
        mt: 2,
        px: 2,
      }}
    >
      {payload.map((entry: any, index: number) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "0.8rem",
            fontWeight: 500,
            color: theme.palette.text.secondary,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: entry.color,
            }}
          />
          <span>{entry.value}</span>
        </Box>
      ))}
    </Box>
  );
};

export const PieChart = memo<PieChartProps>(
  ({
    data,
    height = 320,
    width,
    loading = false,
    error = null,
    className,
    showLegend = true,
    innerRadius = 0,
    outerRadius = "80%",
    onPointClick,
    config,
    // New responsive props
    responsive = true,
    minHeight = 200,
    maxHeight = 600,
    aspectRatio = 1,
    debounceMs = 150,
  }) => {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Responsive values based on screen size and container
    const getResponsiveValues = () => {
      const isSmall = containerSize.width < 400;
      const isMedium = containerSize.width < 600;
      
      return {
        fontSize: isSmall ? 10 : isMedium ? 11 : 12,
        outerRadius: isSmall ? "70%" : isMedium ? "75%" : "80%",
        innerRadius: typeof innerRadius === "number" 
          ? (isSmall ? Math.max(0, innerRadius - 10) : innerRadius)
          : innerRadius,
        labelFontSize: isSmall ? 9 : 10,
        legendSpacing: isSmall ? 1 : 2,
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
            
            // For pie charts, we typically want square aspect ratio
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
      id: point.id,
      label: point.label,
      value: point.value,
      color:
        point.color ||
        config?.theme?.colors?.primary?.[index % 6] ||
        theme.palette.primary.main,
      percentage: point.metadata?.percentage,
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

    const finalHeight = responsive ? containerSize.height || height : height;

    if (loading) {
      return (
        <Box
          ref={containerRef}
          className={className}
          sx={{
            height: finalHeight,
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
        <Box 
          ref={containerRef}
          className={className} 
          sx={{ height: finalHeight, width: width || "100%" }}
        >
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

    if (!chartData || chartData.length === 0) {
      return (
        <Box
          ref={containerRef}
          className={className}
          sx={{
            height: finalHeight,
            width: width || "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.text.secondary,
            fontSize: "0.875rem",
          }}
        >
          No data available
        </Box>
      );
    }

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={{
          height: finalHeight,
          width: width || "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "& .recharts-wrapper": {
            width: "100% !important",
            height: "100% !important",
          },
          "& .recharts-pie-sector": {
            filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.common.black, 0.1)})`,
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
          <RechartsPieChart>
            <defs>
              {chartData.map((entry, index) => {
                const color =
                  entry.color || chartColors[index % chartColors.length];
                return (
                  <linearGradient
                    key={`pie-gradient-${index}`}
                    id={`pie-gradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                );
              })}
            </defs>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={responsiveValues.innerRadius}
              outerRadius={responsiveValues.outerRadius}
              paddingAngle={2}
              animationBegin={0}
              animationDuration={800}
              onClick={
                onPointClick ? (data: any) => onPointClick(data) : undefined
              }
            >
              {chartData.map((entry, index) => {
                const color =
                  entry.color || chartColors[index % chartColors.length];
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#pie-gradient-${index})`}
                    stroke={alpha(theme.palette.common.black, 0.05)}
                    strokeWidth={1}
                    style={{
                      cursor: onPointClick ? "pointer" : "default",
                    }}
                  />
                );
              })}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            {showLegend && (
              <Legend
                content={<CustomLegend />}
                wrapperStyle={{
                  paddingTop: "16px",
                  fontSize: `${responsiveValues.fontSize}px`,
                  fontWeight: 500,
                  fontFamily: theme.typography.fontFamily,
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </Box>
    );
  }
);

PieChart.displayName = "PieChart";
