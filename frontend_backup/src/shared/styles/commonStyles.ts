/**
 * Common Styles - Единые стили для всего приложения
 * Базируется на дизайн-системе из SettingsPage.tsx
 */

import { alpha } from "@mui/material/styles";

// Цветовая схема приложения
export const APP_COLORS = {
  background: {
    gradient: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
    paper:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)",
  },
  accent: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
    purple: "#8b5cf6",
    indigo: "#6366f1",
    pink: "#ec4899",
    orange: "#f97316",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  status: {
    active: "#10b981",
    inactive: "#6b7280",
    draft: "#f59e0b",
    completed: "#3b82f6",
    failed: "#ef4444",
    pending: "#f59e0b",
    blocked: "#f97316",
    trial: "#f59e0b",
    archived: "#6b7280",
  },
} as const;

// Утилиты для создания стилей
export const createGradientBackground = (color1: string, color2: string) =>
  `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;

export const createGlowEffect = (color: string, opacity: number = 0.3) => ({
  boxShadow: `0 8px 24px ${alpha(color, opacity)}`,
  position: "relative" as const,
  "&::before": {
    content: '""',
    position: "absolute" as const,
    inset: -2,
    borderRadius: "inherit",
    background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
    opacity: 0.3,
    filter: "blur(8px)",
    zIndex: -1,
  },
});

export const createHoverEffect = (translateY: number = -2) => ({
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: `translateY(${translateY}px)`,
  },
});

// Стили для карточек
export const cardStyles = {
  base: {
    borderRadius: 3,
    border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    background: (theme: any) =>
      `linear-gradient(135deg, ${alpha(
        theme.palette.background.paper,
        0.9
      )} 0%, ${alpha("#f8fafc", 0.8)} 100%)`,
    backdropFilter: "blur(20px)",
    boxShadow: APP_COLORS.shadow.lg,
    overflow: "hidden" as const,
  },
  hover: {
    ...createHoverEffect(),
    "&:hover": {
      ...createHoverEffect()["&:hover"],
      boxShadow: APP_COLORS.shadow.xl,
    },
  },
};

// Стили для кнопок
export const buttonStyles = {
  primary: {
    borderRadius: 3,
    textTransform: "none" as const,
    fontWeight: 600,
    px: 4,
    py: 1.5,
    background: createGradientBackground(
      APP_COLORS.accent.primary,
      APP_COLORS.accent.purple
    ),
    boxShadow: `0 4px 16px ${alpha(APP_COLORS.accent.primary, 0.3)}`,
    color: "white",
    "&:hover": {
      background: createGradientBackground(
        APP_COLORS.accent.purple,
        APP_COLORS.accent.primary
      ),
      boxShadow: `0 6px 20px ${alpha(APP_COLORS.accent.primary, 0.4)}`,
      transform: "translateY(-2px)",
    },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  outlined: (color: string) => ({
    borderRadius: 3,
    textTransform: "none" as const,
    fontWeight: 600,
    px: 3,
    py: 1.5,
    color,
    borderColor: color,
    "&:hover": {
      borderColor: color,
      backgroundColor: alpha(color, 0.1),
    },
  }),
};

// Стили для бейджей
export const badgeStyles = {
  base: {
    borderRadius: 2,
    px: 2,
    py: 0.5,
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  colored: (color: string, variant: "filled" | "outlined" = "filled") => ({
    ...badgeStyles.base,
    ...(variant === "filled"
      ? {
          backgroundColor: alpha(color, 0.1),
          color: color,
          border: `1px solid ${alpha(color, 0.2)}`,
        }
      : {
          backgroundColor: "transparent",
          color: color,
          border: `1px solid ${alpha(color, 0.3)}`,
        }),
  }),
};

// Стили для прогресс-баров
export const progressStyles = {
  base: {
    height: 8,
    borderRadius: 4,
    backgroundColor: (theme: any) => alpha(theme.palette.divider, 0.1),
    "& .MuiLinearProgress-bar": {
      borderRadius: 4,
    },
  },
  colored: (color: string) => ({
    ...progressStyles.base,
    "& .MuiLinearProgress-bar": {
      ...progressStyles.base["& .MuiLinearProgress-bar"],
      background: createGradientBackground(color, alpha(color, 0.8)),
    },
  }),
};

// Стили для иконок
export const iconStyles = {
  container: (color: string, size: number = 48) => ({
    width: size,
    height: size,
    borderRadius: 2,
    background: createGradientBackground(color, alpha(color, 0.8)),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    ...createGlowEffect(color),
  }),
  small: (color: string) => iconStyles.container(color, 32),
  medium: (color: string) => iconStyles.container(color, 48),
  large: (color: string) => iconStyles.container(color, 64),
};

// Анимации
export const animations = {
  fadeIn: {
    "@keyframes fadeIn": {
      from: { opacity: 0, transform: "translateY(10px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    animation: "fadeIn 0.3s ease-out",
  },
  slideIn: {
    "@keyframes slideIn": {
      from: { opacity: 0, transform: "translateX(-20px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    animation: "slideIn 0.3s ease-out",
  },
  scaleIn: {
    "@keyframes scaleIn": {
      from: { opacity: 0, transform: "scale(0.95)" },
      to: { opacity: 1, transform: "scale(1)" },
    },
    animation: "scaleIn 0.2s ease-out",
  },
};

// Декоративные элементы
export const decorativeElements = {
  backgroundBlur: (
    color: string,
    size: number = 400,
    opacity: number = 0.08
  ) => ({
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(
      color,
      opacity
    )} 0%, transparent 70%)`,
    filter: "blur(60px)",
    pointerEvents: "none" as const,
  }),
};
