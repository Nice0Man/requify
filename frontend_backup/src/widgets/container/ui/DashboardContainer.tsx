import { memo, ReactNode } from "react";
import { Container, useTheme } from "@mui/material";
import { useDashboardStyleSystem, DASHBOARD_TOKENS } from "@/shared/styles";
import type { DashboardMode, DashboardLayoutType, DashboardDensity } from "@/entities/dashboard";

interface DashboardContainerProps {
  mode?: DashboardMode;
  layout?: DashboardLayoutType;
  density?: DashboardDensity;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  padding?: number | string;
  backgroundColor?: string;
  elevation?: number;
  className?: string;
  sx?: any;
}

/**
 * DashboardContainer - основной контейнер для дашборда
 * Context7 совместимый с адаптивным дизайном
 */
export const DashboardContainer = memo<DashboardContainerProps>(
  ({
    mode = "detailed",
    layout = "grid",
    density = "comfortable",
    children,
    maxWidth = "xl",
    padding,
    backgroundColor,
    elevation = 0,
    className,
    sx,
    ...props
  }) => {
    const theme = useTheme();
    const styleSystem = useDashboardStyleSystem(mode, layout, density);

    // Адаптивная ширина для разных режимов
    const adaptiveMaxWidth = (() => {
      if (mode === "fullscreen") return false;
      if (mode === "minimal") return "md";
      return maxWidth === false ? false : maxWidth || "xl";
    })();

    return (
      <Container
        maxWidth={adaptiveMaxWidth}
        className={className}
        sx={{
          // Используем styleSystem для базовых стилей
          ...styleSystem.spacing,

          // Context7: Правильные размеры без overflow
          width: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",

          // Адаптивные отступы из styleSystem
          px: padding || styleSystem.spacing.xs,
          py: mode === "fullscreen" ? 0 : padding || styleSystem.spacing.sm,

          // Фон и стили с использованием темы
          backgroundColor: backgroundColor || theme.palette.background.default,

          // Layout-specific стили из styleSystem
          ...styleSystem.spacing,

          // Context7: Предотвращаем overflow
          overflow: "visible",
          overflowX: "hidden",

          // Анимации из styleSystem
          ...styleSystem.animations,

          // Кастомные стили
          ...sx,
        }}
      >
        {children}
      </Container>
    );
  }
);

DashboardContainer.displayName = "DashboardContainer";
