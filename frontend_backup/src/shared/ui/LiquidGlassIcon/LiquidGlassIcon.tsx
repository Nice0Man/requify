import React from "react";
import { Box, SxProps, Theme, alpha, useTheme } from "@mui/material";

interface LiquidGlassIconProps {
  icon: React.ElementType;
  color: string;
  size?: number;
  gradient?: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  clickable?: boolean;
  variant?: "primary" | "secondary" | "subtle";
}

export const LiquidGlassIcon = ({
  icon: Icon,
  color,
  size = 56,
  gradient,
  onClick,
  sx,
  clickable = false,
  variant = "primary",
}: LiquidGlassIconProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const getVariantStyles = () => {
    const baseGlass = {
      // Multi-layer Liquid Glass effect
      background: `
        linear-gradient(135deg, 
          ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)} 0%, 
          ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.15)} 50%,
          ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.2)} 100%
        ),
        linear-gradient(225deg, 
          ${alpha(color, 0.1)} 0%, 
          transparent 50%
        ),
        ${alpha(theme.palette.background.paper, isDark ? 0.6 : 0.8)}
      `,
      // Advanced backdrop filter for real glass effect
      backdropFilter: "blur(40px) saturate(150%) contrast(120%)",
      WebkitBackdropFilter: "blur(40px) saturate(150%) contrast(120%)",
      // Multi-layer border with refraction
      border: `1px solid ${alpha(
        theme.palette.common.white,
        isDark ? 0.2 : 0.3
      )}`,
      // Enhanced shadow with multiple layers
      boxShadow: `
        inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.2 : 0.4)},
        inset 0 -1px 0 ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.1)},
        0 4px 16px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.1)},
        0 1px 4px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)},
        0 0 0 1px ${alpha(color, 0.1)}
      `,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseGlass,
          background: `
            linear-gradient(135deg, 
              ${alpha(color, 0.9)} 0%, 
              ${alpha(color, 0.7)} 50%,
              ${alpha(color, 0.8)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(theme.palette.common.white, 0.3)} 0%, 
              transparent 70%
            )
          `,
          border: `1px solid ${alpha(color, 0.3)}`,
          boxShadow: `
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.4)},
            inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.2)},
            0 8px 32px ${alpha(color, 0.3)},
            0 2px 8px ${alpha(color, 0.2)},
            0 0 0 1px ${alpha(color, 0.2)}
          `,
        };
      case "secondary":
        return {
          ...baseGlass,
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.2)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.03 : 0.1)} 50%,
              ${alpha(theme.palette.common.white, isDark ? 0.06 : 0.15)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(color, 0.08)} 0%, 
              transparent 60%
            ),
            ${alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7)}
          `,
          border: `1px solid ${alpha(color, 0.15)}`,
          boxShadow: `
            inset 0 1px 0 ${alpha(
              theme.palette.common.white,
              isDark ? 0.15 : 0.25
            )},
            inset 0 -1px 0 ${alpha(
              theme.palette.common.black,
              isDark ? 0.2 : 0.08
            )},
            0 4px 24px ${alpha(color, 0.15)},
            0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)},
            0 0 0 1px ${alpha(color, 0.1)}
          `,
        };
      case "subtle":
        return {
          ...baseGlass,
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.15)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.02 : 0.08)} 50%,
              ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 100%
            ),
            ${alpha(theme.palette.background.paper, isDark ? 0.3 : 0.6)}
          `,
          border: `1px solid ${alpha(
            theme.palette.divider,
            isDark ? 0.2 : 0.3
          )}`,
          boxShadow: `
            inset 0 1px 0 ${alpha(
              theme.palette.common.white,
              isDark ? 0.1 : 0.2
            )},
            inset 0 -1px 0 ${alpha(
              theme.palette.common.black,
              isDark ? 0.15 : 0.05
            )},
            0 2px 16px ${alpha(
              theme.palette.common.black,
              isDark ? 0.2 : 0.08
            )},
            0 1px 4px ${alpha(theme.palette.common.black, isDark ? 0.15 : 0.04)}
          `,
        };
      default:
        return baseGlass;
    }
  };

  const iconColor = variant === "primary" ? "white" : color;

  const getHoverStyles = () => {
    if (!clickable) return {};

    const baseHoverStyles = {
      transform: "translateY(-2px) scale(1.02)",
      backdropFilter: "blur(50px) saturate(180%) contrast(130%)",
      WebkitBackdropFilter: "blur(50px) saturate(180%) contrast(130%)",
      filter: "brightness(1.05)",
    };

    switch (variant) {
      case "primary":
        return {
          ...baseHoverStyles,
          background: `
            linear-gradient(135deg, 
              ${alpha(color, 0.95)} 0%, 
              ${alpha(color, 0.8)} 50%,
              ${alpha(color, 0.85)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(theme.palette.common.white, 0.5)} 0%, 
              transparent 70%
            )
          `,
          border: `1px solid ${alpha(color, 0.4)}`,
          boxShadow: `
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.6)},
            inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.3)},
            0 12px 40px ${alpha(color, 0.4)},
            0 4px 16px ${alpha(color, 0.3)},
            0 0 0 2px ${alpha(color, 0.3)},
            0 0 40px ${alpha(color, 0.2)}
          `,
        };
      
      case "secondary":
        return {
          ...baseHoverStyles,
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.18 : 0.3)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 50%,
              ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(color, 0.15)} 0%, 
              transparent 60%
            ),
            ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.8)}
          `,
          border: `1px solid ${alpha(color, 0.25)}`,
          boxShadow: `
            inset 0 1px 0 ${alpha(
              theme.palette.common.white,
              isDark ? 0.2 : 0.35
            )},
            inset 0 -1px 0 ${alpha(
              theme.palette.common.black,
              isDark ? 0.3 : 0.1
            )},
            0 8px 32px ${alpha(color, 0.25)},
            0 2px 12px ${alpha(
              theme.palette.common.black,
              isDark ? 0.4 : 0.1
            )},
            0 0 0 1px ${alpha(color, 0.25)},
            0 0 20px ${alpha(color, 0.15)}
          `,
        };
      
      case "subtle":
        return {
          ...baseHoverStyles,
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.2)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 50%,
              ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.16)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(color, 0.08)} 0%, 
              transparent 60%
            ),
            ${alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7)}
          `,
          border: `1px solid ${alpha(
            theme.palette.divider,
            isDark ? 0.3 : 0.4
          )}`,
          boxShadow: `
            inset 0 1px 0 ${alpha(
              theme.palette.common.white,
              isDark ? 0.15 : 0.25
            )},
            inset 0 -1px 0 ${alpha(
              theme.palette.common.black,
              isDark ? 0.2 : 0.08
            )},
            0 4px 20px ${alpha(
              theme.palette.common.black,
              isDark ? 0.25 : 0.1
            )},
            0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.06)}
          `,
        };
      
      default:
        return baseHoverStyles;
    }
  };

  return (
    <Box
      component={clickable ? "button" : "div"}
      onClick={clickable ? onClick : undefined}
      sx={{
        width: size,
        height: size,
        borderRadius: `${size * 0.25}px`, // More rounded for modern Apple design
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)", // Apple's signature easing
        outline: "none",
        overflow: "hidden",
        ...getVariantStyles(),

        // Enhanced Liquid Glass hover effects
        "&:hover": getHoverStyles(),

        // Apple's signature pressed effect
        "&:active": clickable
          ? {
              transform: "translateY(0) scale(0.98)",
              transition: "all 0.15s ease-out",
              backdropFilter: "blur(30px) saturate(120%)",
              WebkitBackdropFilter: "blur(30px) saturate(120%)",
            }
          : {},

        // Top light refraction (signature Apple effect)
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: `
            linear-gradient(180deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.15)} 30%,
              transparent 100%
            )
          `,
          borderRadius: `${size * 0.25}px ${size * 0.25}px 0 0`,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        },

        // Dynamic specular highlights (reacts to hover)
        "&::after": {
          content: '""',
          position: "absolute",
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          background: `
            conic-gradient(from 45deg at 30% 30%, 
              ${alpha(color, 0.3)} 0deg,
              transparent 90deg,
              transparent 180deg,
              ${alpha(color, 0.2)} 270deg,
              transparent 360deg
            )
          `,
          borderRadius: `${size * 0.3}px`,
          opacity: 0,
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
          zIndex: -1,
          filter: "blur(1px)",
        },

        // Show specular highlights on hover
        "&:hover::after": clickable
          ? {
              opacity: 1,
            }
          : {},

        ...sx,
      }}
    >
      <Icon
        sx={{
          color: iconColor,
          fontSize: size * 0.45, // Slightly smaller for better proportions
          filter:
            variant === "primary"
              ? `drop-shadow(0 2px 8px ${alpha(
                  theme.palette.common.black,
                  0.3
                )})`
              : `drop-shadow(0 1px 4px ${alpha(
                  theme.palette.common.black,
                  isDark ? 0.4 : 0.1
                )})`,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </Box>
  );
};
