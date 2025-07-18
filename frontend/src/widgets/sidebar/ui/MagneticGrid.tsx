import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  useTheme,
  alpha,
  keyframes,
} from "@mui/material";
import { SIDEBAR_Z_INDEX } from "../model/config";

interface MagneticGridProps {
  children: React.ReactNode;
  isActive: boolean;
  onDrop: (fromIndex: number, toIndex: number) => void;
  onSnapPreview: (targetIndex: number) => void;
  onSnapClear: () => void;
  itemCount: number;
  draggedItemIndex: number | null;
  hoveredItemIndex: number | null;
}

interface GridSlot {
  index: number;
  isOccupied: boolean;
  isTarget: boolean;
  isPreview: boolean;
  element: HTMLElement | null;
}

/**
 * Компонент магнетической сетки для точного размещения
 * Реализует Phase 3: Drop & Placement (Precision & Confirmation)
 */
export const MagneticGrid: React.FC<MagneticGridProps> = ({
  children,
  isActive,
  onDrop,
  onSnapPreview,
  onSnapClear,
  itemCount,
  draggedItemIndex,
  hoveredItemIndex,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSlots, setGridSlots] = useState<GridSlot[]>([]);
  const [snapTargetIndex, setSnapTargetIndex] = useState<number | null>(null);
  const [showSnapPreview, setShowSnapPreview] = useState(false);

  // Инициализация сетки
  useEffect(() => {
    if (!containerRef.current) return;

    const slots: GridSlot[] = [];
    const container = containerRef.current;
    const children = Array.from(container.children);

    children.forEach((child, index) => {
      if (child instanceof HTMLElement) {
        slots.push({
          index,
          isOccupied: true,
          isTarget: false,
          isPreview: false,
          element: child,
        });
      }
    });

    setGridSlots(slots);
  }, [itemCount]);

  // Обновление состояния при hover
  useEffect(() => {
    if (hoveredItemIndex !== null && draggedItemIndex !== null) {
      setSnapTargetIndex(hoveredItemIndex);
      setShowSnapPreview(true);
      onSnapPreview(hoveredItemIndex);
    } else {
      setSnapTargetIndex(null);
      setShowSnapPreview(false);
      onSnapClear();
    }
  }, [hoveredItemIndex, draggedItemIndex]); // Убираем функции из зависимостей

  // Анимация для индикатора места вставки
  const insertIndicatorAnimation = keyframes`
    0% { 
      transform: scaleY(0.8) scaleX(0.95);
      opacity: 0.6;
    }
    100% { 
      transform: scaleY(1) scaleX(1);
      opacity: 0.8;
    }
  `;

  // Анимация для предварительного просмотра
  const snapPreviewAnimation = keyframes`
    0% { 
      transform: scale(0.95);
      opacity: 0.5;
    }
    100% { 
      transform: scale(1);
      opacity: 0.6;
    }
  `;

  // Анимация сетки при активации
  const gridActivationAnimation = keyframes`
    0% { 
      background: transparent;
    }
    100% { 
      background: ${alpha(theme.palette.primary.main, 0.02)};
    }
  `;

  // Получение позиции для индикатора вставки
  const getInsertIndicatorPosition = (index: number) => {
    if (!containerRef.current) return { top: 0, height: 0 };

    const container = containerRef.current;
    const child = container.children[index] as HTMLElement;
    
    if (!child) return { top: 0, height: 0 };

    const rect = child.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return {
      top: rect.top - containerRect.top,
      height: rect.height,
    };
  };

  // Определение зоны drop
  const getDropZone = (index: number) => {
    if (!containerRef.current) return null;

    const container = containerRef.current;
    const child = container.children[index] as HTMLElement;
    
    if (!child) return null;

    const rect = child.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return {
      top: rect.top - containerRect.top - 4,
      left: rect.left - containerRect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    };
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        animation: isActive ? `${gridActivationAnimation} 0.3s ease-out` : "none",
        background: isActive 
          ? alpha(theme.palette.primary.main, 0.02) 
          : "transparent",
        transition: "background 0.3s ease",
        "&::before": isActive ? {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${alpha(theme.palette.primary.main, 0.05)} 2px,
            ${alpha(theme.palette.primary.main, 0.05)} 4px
          )`,
          pointerEvents: "none",
          zIndex: 1,
          animation: "gridLines 0.3s ease-out",
          "@keyframes gridLines": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        } : {},
      }}
    >
      {children}

      {/* Индикатор места вставки */}
      {showSnapPreview && snapTargetIndex !== null && (
        <Box
          sx={{
            position: "absolute",
            left: 4,
            right: 4,
            ...getInsertIndicatorPosition(snapTargetIndex),
            zIndex: 500,
            background: `linear-gradient(90deg, 
              ${alpha(theme.palette.primary.main, 0.6)} 0%, 
              ${alpha(theme.palette.primary.main, 0.4)} 50%, 
              ${alpha(theme.palette.primary.main, 0.6)} 100%)`,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.8)}`,
            animation: `${insertIndicatorAnimation} 0.6s ease-in-out`,
            boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            "&::before": {
              content: '""',
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: `linear-gradient(90deg, 
                ${alpha(theme.palette.primary.main, 0.3)} 0%, 
                transparent 50%, 
                ${alpha(theme.palette.primary.main, 0.3)} 100%)`,
              borderRadius: 3,
              zIndex: -1,
            },
          }}
        />
      )}

      {/* Предварительный просмотр позиции */}
      {showSnapPreview && snapTargetIndex !== null && (
        <Box
          sx={{
            position: "absolute",
            ...getDropZone(snapTargetIndex),
            zIndex: 400,
            background: `radial-gradient(circle at 50% 50%, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              ${alpha(theme.palette.primary.main, 0.05)} 50%, 
              transparent 100%)`,
            borderRadius: 2,
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
            animation: `${snapPreviewAnimation} 0.8s ease-in-out`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Зоны притяжения (магнетизм) */}
      {isActive && gridSlots.map((slot, index) => (
        <Box
          key={`magnet-${index}`}
          sx={{
            position: "absolute",
            ...getDropZone(index),
            zIndex: 300,
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: 2,
            pointerEvents: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        />
      ))}

      {/* Визуальная сетка (опционально) */}
      {isActive && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 8px,
              ${alpha(theme.palette.primary.main, 0.03)} 8px,
              ${alpha(theme.palette.primary.main, 0.03)} 9px
            )`,
            pointerEvents: "none",
            zIndex: 2,
            animation: "gridPattern 0.3s ease-out",
            "@keyframes gridPattern": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        />
      )}
    </Box>
  );
}; 