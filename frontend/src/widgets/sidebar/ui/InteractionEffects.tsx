import React from "react";
import { Box, useTheme, alpha, keyframes } from "@mui/material";
import { SIDEBAR_Z_INDEX } from "../model/config";

interface InteractionEffectsProps {
  isLifting: boolean;
  isJiggling: boolean;
  isDragging: boolean;
  isSnapping: boolean;
  children: React.ReactNode;
  color?: string;
  liftDuration?: number;
  onLiftComplete?: () => void;
  onSnapComplete?: () => void;
}

/**
 * Компонент для эффектов взаимодействия
 * Реализует Phase 2: Dragging State (Affordance & Feedback)
 */
export const InteractionEffects: React.FC<InteractionEffectsProps> = ({
  isLifting,
  isJiggling,
  isDragging,
  isSnapping,
  children,
  color,
  liftDuration = 0,
  onLiftComplete,
  onSnapComplete,
}) => {
  const theme = useTheme();
  const primaryColor = color || theme.palette.primary.main;

  // Анимации для покачивания (jiggling)
  const jiggleAnimation = keyframes`
    0%, 100% { transform: rotate(0deg) scale(1); }
    12.5% { transform: rotate(-2deg) scale(1.02); }
    25% { transform: rotate(2deg) scale(1.04); }
    37.5% { transform: rotate(-1deg) scale(1.02); }
    50% { transform: rotate(1deg) scale(1.04); }
    62.5% { transform: rotate(-0.5deg) scale(1.02); }
    75% { transform: rotate(0.5deg) scale(1.04); }
    87.5% { transform: rotate(-0.25deg) scale(1.02); }
  `;

  // Анимации для поднятия (lifting)
  const liftAnimation = keyframes`
    0% { 
      transform: scale(1) translateY(0px);
      box-shadow: 0 2px 4px ${alpha(theme.palette.common.black, 0.1)};
    }
    50% { 
      transform: scale(1.05) translateY(-8px);
      box-shadow: 0 8px 24px ${alpha(theme.palette.common.black, 0.15)};
    }
    100% { 
      transform: scale(1.08) translateY(-12px);
      box-shadow: 0 12px 32px ${alpha(theme.palette.common.black, 0.2)};
    }
  `;

  // Анимации для перетаскивания (dragging)
  const dragAnimation = keyframes`
    0% { 
      transform: scale(1.08) translateY(-12px) rotate(0deg);
      box-shadow: 0 12px 32px ${alpha(theme.palette.common.black, 0.2)};
    }
    100% { 
      transform: scale(1.1) translateY(-16px) rotate(-2deg);
      box-shadow: 0 16px 40px ${alpha(theme.palette.common.black, 0.25)};
    }
  `;

  // Анимации для привязки к сетке (snapping)
  const snapAnimation = keyframes`
    0% { 
      transform: scale(1.1) translateY(-16px) rotate(-2deg);
      box-shadow: 0 16px 40px ${alpha(theme.palette.common.black, 0.25)};
    }
    50% { 
      transform: scale(1.05) translateY(-4px) rotate(0deg);
      box-shadow: 0 8px 16px ${alpha(primaryColor, 0.2)};
    }
    100% { 
      transform: scale(1) translateY(0px) rotate(0deg);
      box-shadow: 0 4px 8px ${alpha(primaryColor, 0.1)};
    }
  `;

  // Определение активной анимации
  const getAnimation = () => {
    if (isSnapping)
      return `${snapAnimation} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    if (isDragging) return `${dragAnimation} 0.3s ease-out`;
    if (isLifting) return `${liftAnimation} 0.3s ease-out`;
    if (isJiggling) return `${jiggleAnimation} 0.8s ease-in-out`;
    return "none";
  };

  // Определение transform для статичных состояний
  const getTransform = () => {
    if (isSnapping) return "scale(1) translateY(0px) rotate(0deg)";
    if (isDragging) return "scale(1.1) translateY(-16px) rotate(-2deg)";
    if (isLifting) return "scale(1.08) translateY(-12px)";
    if (isJiggling) return "scale(1.02)";
    return "none";
  };

  // Определение box-shadow для статичных состояний
  const getBoxShadow = () => {
    if (isSnapping) return `0 4px 8px ${alpha(primaryColor, 0.1)}`;
    if (isDragging)
      return `0 16px 40px ${alpha(theme.palette.common.black, 0.25)}`;
    if (isLifting)
      return `0 12px 32px ${alpha(theme.palette.common.black, 0.2)}`;
    if (isJiggling) return `0 4px 16px ${alpha(primaryColor, 0.1)}`;
    return "none";
  };

  // Определение фонового эффекта
  const getBackgroundEffect = () => {
    if (isDragging) {
      return {
        background: `linear-gradient(45deg, 
          ${alpha(primaryColor, 0.05)} 25%, 
          transparent 25%, 
          transparent 75%, 
          ${alpha(primaryColor, 0.05)} 75%)`,
        backgroundSize: "8px 8px",
        animation: "dragPattern 0.5s linear",
        "@keyframes dragPattern": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "8px 8px" },
        },
      };
    }

    if (isLifting) {
      return {
        background: `radial-gradient(circle at 50% 50%, 
          ${alpha(primaryColor, 0.08)} 0%, 
          transparent 70%)`,
        animation: "liftGlow 0.3s ease-out",
        "@keyframes liftGlow": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      };
    }

    if (isJiggling) {
      return {
        background: `linear-gradient(90deg, 
          transparent 0%, 
          ${alpha(primaryColor, 0.03)} 50%, 
          transparent 100%)`,
        animation: "jiggleGlow 0.8s ease-in-out",
        "@keyframes jiggleGlow": {
          "0%, 100%": { opacity: 0.5 },
          "50%": { opacity: 1 },
        },
      };
    }

    return {};
  };

  // Обработчики окончания анимаций
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName.includes("lift") && onLiftComplete) {
      onLiftComplete();
    }
    if (e.animationName.includes("snap") && onSnapComplete) {
      onSnapComplete();
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        animation: getAnimation(),
        transform: getTransform(),
        boxShadow: getBoxShadow(),
        transition: "all 0.2s ease",
        transformOrigin: "center",
        willChange: "transform, box-shadow",
        zIndex: isDragging ? SIDEBAR_Z_INDEX.draggingItem : isLifting ? 100 : 1,
        ...getBackgroundEffect(),
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}

      {/* Дополнительные визуальные эффекты */}
      {isLifting && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "inherit",
            background: `radial-gradient(circle at 50% 50%, 
              ${alpha(primaryColor, 0.1)} 0%, 
              transparent 70%)`,
            animation: "liftHalo 0.3s ease-out",
            "@keyframes liftHalo": {
              "0%": {
                transform: "scale(1)",
                opacity: 0,
              },
              "100%": {
                transform: "scale(1.1)",
                opacity: 1,
              },
            },
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      )}

      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: "inherit",
            border: `2px solid ${alpha(primaryColor, 0.6)}`,
            animation: "dragBorder 0.3s ease-out",
            "@keyframes dragBorder": {
              "0%": {
                borderColor: alpha(primaryColor, 0.2),
                transform: "scale(1)",
              },
              "100%": {
                borderColor: alpha(primaryColor, 0.6),
                transform: "scale(1.02)",
              },
            },
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      )}

      {isSnapping && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "inherit",
            background: `radial-gradient(circle at 50% 50%, 
              ${alpha(primaryColor, 0.2)} 0%, 
              transparent 70%)`,
            animation: "snapFlash 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            "@keyframes snapFlash": {
              "0%": {
                transform: "scale(1.1)",
                opacity: 0,
              },
              "50%": {
                transform: "scale(1.05)",
                opacity: 1,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 0,
              },
            },
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      )}
    </Box>
  );
};
