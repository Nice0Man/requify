import React from "react";
import { Box, useTheme, alpha } from "@mui/material";

interface ModernDragEffectsProps {
  isDragging: boolean;
  dragPosition?: { x: number; y: number };
  isCollapsed?: boolean;
}

// Минималистичный компонент эффектов DND
export const ModernDragEffects: React.FC<ModernDragEffectsProps> = ({
  isDragging,
  dragPosition,
}) => {
  const theme = useTheme();

  if (!isDragging) return null;

  return (
    <>
      {/* Subtle background overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          backdropFilter: "blur(1px)",
          pointerEvents: "none",
          zIndex: 999,
          transition: "all 0.3s ease",
        }}
      />

      {/* Cursor trail effect */}
      {dragPosition && (
        <Box
          sx={{
            position: "fixed",
            left: dragPosition.x - 12,
            top: dragPosition.y - 12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
            pointerEvents: "none",
            zIndex: 1001,
            animation: "cursorPulse 1s ease-in-out infinite",
            "@keyframes cursorPulse": {
              "0%, 100%": { 
                transform: "scale(1)",
                opacity: 0.6,
              },
              "50%": { 
                transform: "scale(1.5)",
                opacity: 0.8,
              },
            },
          }}
        />
      )}
    </>
  );
};

// Helper компонент для индикации зон сброса
interface DropZoneIndicatorProps {
  isActive: boolean;
  children: React.ReactNode;
}

export const DropZoneIndicator: React.FC<DropZoneIndicatorProps> = ({
  isActive,
  children,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 1,
        border: isActive 
          ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
          : "2px dashed transparent",
        backgroundColor: isActive 
          ? alpha(theme.palette.primary.main, 0.04)
          : "transparent",
        transition: "all 0.2s ease",
        "&::before": isActive ? {
          content: '""',
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: "inherit",
          background: `linear-gradient(45deg, 
            ${alpha(theme.palette.primary.main, 0.1)}, 
            transparent, 
            ${alpha(theme.palette.primary.main, 0.1)})`,
          animation: "borderGlow 2s ease-in-out infinite",
          zIndex: -1,
        } : {},
        "@keyframes borderGlow": {
          "0%, 100%": { opacity: 0.5 },
          "50%": { opacity: 1 },
        },
      }}
    >
      {children}
    </Box>
  );
};

// Компонент для визуального feedback'а перетаскивания
interface DragFeedbackProps {
  message: string;
  type?: "info" | "success" | "warning";
}

export const DragFeedback: React.FC<DragFeedbackProps> = ({
  message,
  type = "info",
}) => {
  const theme = useTheme();
  
  const colors = {
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: alpha(colors[type], 0.1),
        border: `1px solid ${alpha(colors[type], 0.3)}`,
        borderRadius: 2,
        px: 2,
        py: 1,
        color: colors[type],
        fontSize: "0.875rem",
        fontWeight: 500,
        backdropFilter: "blur(8px)",
        zIndex: 1002,
        animation: "feedbackSlide 0.3s ease-out",
        "@keyframes feedbackSlide": {
          "0%": { 
            opacity: 0,
            transform: "translateX(-50%) translateY(-10px)",
          },
          "100%": { 
            opacity: 1,
            transform: "translateX(-50%) translateY(0)",
          },
        },
      }}
    >
      {message}
    </Box>
  );
}; 