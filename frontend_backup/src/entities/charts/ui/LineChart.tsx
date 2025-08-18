import { memo, useRef, useEffect, useState } from "react";
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
} from "recharts";
import { useTheme, alpha, Box, CircularProgress, Alert } from "@mui/material";
import type { LineChartProps } from "../model/types";

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
                borderRadius: 2,
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

export const LineChart = memo<LineChartProps>(
  ({
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
    // New responsive props
    responsive = true,
    minHeight = 200,
    maxHeight = 600,
    aspectRatio = 16 / 9,
    debounceMs = 150,
  }) => {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({
      width: 600,
      height: 320,
    }); // Безопасные начальные значения

    // Responsive values based on screen size and container
    const getResponsiveValues = () => {
      // Безопасные проверки с fallback значениями
      const safeWidth =
        Number.isFinite(containerSize.width) && containerSize.width > 0
          ? containerSize.width
          : 600;
      const isSmall = safeWidth < 600;
      const isMedium = safeWidth < 960;

      return {
        margin: {
          top: isSmall ? 10 : 20,
          right: isSmall ? 15 : 30,
          left: isSmall ? 10 : 20,
          bottom: isSmall ? 10 : 20,
        },
        fontSize: Math.max(10, isSmall ? 11 : isMedium ? 12 : 13), // Минимальный размер 10px
        axisHeight: Math.max(40, isSmall ? 50 : 60), // Минимальная высота оси
        axisWidth: Math.max(40, isSmall ? 50 : 60), // Минимальная ширина оси
        strokeWidth: Math.max(1, isSmall ? 2 : 3), // Минимальная толщина линии
        dotRadius: Math.max(2, isSmall ? 3 : 5), // Минимальный радиус точки
        activeDotRadius: Math.max(3, isSmall ? 5 : 7), // Минимальный радиус активной точки
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

            // Безопасные вычисления с проверками на NaN/Infinity
            const safeWidth = Number.isFinite(width) && width > 0 ? width : 600;
            const safeAspectRatio =
              Number.isFinite(aspectRatio) && aspectRatio > 0
                ? aspectRatio
                : 16 / 9;
            const safeMinHeight =
              Number.isFinite(minHeight) && minHeight > 0 ? minHeight : 200;
            const safeMaxHeight =
              Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : 600;
            const safeHeight =
              Number.isFinite(height) && height > 0 ? height : 320;

            // Calculate adaptive height based on container width and aspect ratio
            let adaptiveHeight = responsive
              ? Math.max(
                  safeMinHeight,
                  Math.min(safeMaxHeight, safeWidth / safeAspectRatio)
                )
              : safeHeight;

            // Дополнительная проверка результата
            if (!Number.isFinite(adaptiveHeight) || adaptiveHeight <= 0) {
              adaptiveHeight = safeHeight;
            }

            setContainerSize({
              width: safeWidth,
              height: adaptiveHeight,
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
    const chartData = data.map((point, _index) => ({
      name:
        point.label ||
        new Date(point.date).toLocaleDateString("ru-RU", {
          month: "short",
          day: "numeric",
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

    const ChartComponent = area ? AreaChart : RechartsLineChart;
    const primaryColor = chartColors[0];

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={{
          height: finalHeight,
          width: width || "100%",
          overflow: "hidden",
          "& .recharts-cartesian-grid-horizontal line": {
            stroke: alpha(theme.palette.divider, 0.08),
          },
          "& .recharts-cartesian-grid-vertical line": {
            stroke: alpha(theme.palette.divider, 0.08),
          },
          "& .recharts-line": {
            filter: `drop-shadow(0 2px 4px ${alpha(
              theme.palette.common.black,
              0.1
            )})`,
          },
          "& .recharts-area": {
            filter: `drop-shadow(0 2px 4px ${alpha(
              theme.palette.common.black,
              0.1
            )})`,
          },
          "& .recharts-tooltip-wrapper": {
            zIndex: 1000,
          },
          "& .recharts-wrapper": {
            width: "100% !important",
            height: "100% !important",
          },
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minHeight={minHeight}
          maxHeight={responsive ? maxHeight : undefined}
        >
          <ChartComponent data={chartData} margin={responsiveValues.margin}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "16px",
                fontSize: `${responsiveValues.fontSize}px`,
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
                fill={`url(#gradient-${primaryColor.replace("#", "")})`}
                strokeWidth={responsiveValues.strokeWidth}
                dot={
                  showPoints
                    ? {
                        fill: theme.palette.background.paper,
                        stroke: primaryColor,
                        strokeWidth: responsiveValues.strokeWidth,
                        r: responsiveValues.dotRadius,
                        filter: `drop-shadow(0 2px 4px ${alpha(
                          primaryColor,
                          0.3
                        )})`,
                      }
                    : false
                }
                activeDot={{
                  r: responsiveValues.activeDotRadius,
                  stroke: primaryColor,
                  strokeWidth: responsiveValues.strokeWidth,
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
                strokeWidth={responsiveValues.strokeWidth}
                dot={
                  showPoints
                    ? {
                        fill: theme.palette.background.paper,
                        stroke: primaryColor,
                        strokeWidth: responsiveValues.strokeWidth,
                        r: responsiveValues.dotRadius,
                        filter: `drop-shadow(0 2px 4px ${alpha(
                          primaryColor,
                          0.3
                        )})`,
                      }
                    : false
                }
                activeDot={{
                  r: responsiveValues.activeDotRadius,
                  stroke: primaryColor,
                  strokeWidth: responsiveValues.strokeWidth,
                  fill: theme.palette.background.paper,
                  filter: `drop-shadow(0 4px 8px ${alpha(primaryColor, 0.4)})`,
                }}
                onClick={onPointClick as any}
              />
            )}

            {/* Gradient definitions */}
            <defs>
              <linearGradient
                id={`gradient-${primaryColor.replace("#", "")}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={primaryColor} stopOpacity={0.2} />
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
  }
);

LineChart.displayName = "LineChart";
