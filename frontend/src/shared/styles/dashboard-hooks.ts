/**
 * Dashboard Style Hooks
 * Хуки для работы со стилями дашборда
 */

import { useTheme } from "@mui/material/styles";
import {
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
} from "../types/dashboard";

export const useDashboardStyleSystem = (
  mode: DashboardMode = "detailed",
  layout: DashboardLayoutType = "grid", 
  density: DashboardDensity = "comfortable"
) => {
  const theme = useTheme();

  return {
    mode,
    layout,
    density,
    theme,
    // Add style calculations here
    widgetStyles: {
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[1],
    },
    // Add missing properties from DASHBOARD_TOKENS
    spacing: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40,
      fab: {
        bottom: 16,
        right: 16,
      },
    },
    animations: {
      duration: {
        short: 200,
        standard: 300,
        complex: 375,
      },
      easing: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  };
};
