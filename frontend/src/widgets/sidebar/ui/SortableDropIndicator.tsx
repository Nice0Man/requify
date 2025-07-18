import React from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { SIDEBAR_Z_INDEX } from "../model/config";

interface SortableDropIndicatorProps {
  isVisible: boolean;
  position?: "before" | "after";
  isCollapsed?: boolean;
}

export const SortableDropIndicator: React.FC<SortableDropIndicatorProps> = ({
  isVisible,
  isCollapsed = false,
}) => {
  const theme = useTheme();

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: "relative",
        height: 2,
        mx: isCollapsed ? 0.5 : 1,
        my: 0.5,
        borderRadius: 1,
        overflow: "hidden",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: SIDEBAR_Z_INDEX.dropIndicator,
        
        // Основная линия индикатора
        backgroundColor: alpha(theme.palette.primary.main, 0.3),
        boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`,
        
        // Анимированный градиент
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${alpha(theme.palette.primary.main, 0.6)} 50%, 
            transparent 100%)`,
          animation: isVisible ? "shimmer 1.5s ease-in-out infinite" : "none",
        },
        
        // Пульсация по краям
        "&::after": {
          content: '""',
          position: "absolute",
          top: -1,
          left: -4,
          width: 8,
          height: 4,
          backgroundColor: theme.palette.primary.main,
          borderRadius: "50%",
          boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`,
          animation: isVisible ? "pulse 1s ease-in-out infinite" : "none",
        },
        
        "@keyframes shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        
        "@keyframes pulse": {
          "0%, 100%": { 
            opacity: 0.6,
            transform: "scale(1)",
          },
          "50%": { 
            opacity: 1,
            transform: "scale(1.2)",
          },
        },
      }}
    />
  );
}; 