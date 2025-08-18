import React, { useCallback, useMemo } from "react";
import { Box, Stack, useTheme } from "@mui/material";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { CarouselControlsProps } from "../model/types";

const DotsNavigation = React.memo<{
  totalItems: number;
  currentIndex: number;
  onGoToSlide: (index: number) => void;
  disabled: boolean;
}>(({ totalItems, currentIndex, onGoToSlide, disabled }) => {
  const theme = useTheme();
  const handleDotClick = useCallback(
    (index: number) => {
      if (!disabled) {
        onGoToSlide(index);
      }
    },
    [onGoToSlide, disabled]
  );

  const dots = useMemo(
    () =>
      Array.from({ length: totalItems }, (_, index) => ({
        index,
        isActive: currentIndex === index,
      })),
    [totalItems, currentIndex]
  );

  const containerBackground =
    theme.palette.mode === "dark"
      ? `rgba(${
          theme.palette.background.paper
            .replace("#", "")
            .match(/.{2}/g)
            ?.map((hex) => parseInt(hex, 16))
            .join(", ") || "0, 0, 0"
        }, 0.9)`
      : "rgba(255, 255, 255, 0.9)";

  const containerShadow =
    theme.palette.mode === "dark"
      ? "0 4px 16px rgba(0,0,0,0.3)"
      : "0 4px 16px rgba(0,0,0,0.08)";

  return (
    <Stack
      direction="row"
      spacing={1}
      role="tablist"
      aria-label="Carousel navigation dots"
      sx={{
        px: 3,
        py: 1.5,
        backgroundColor: containerBackground,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: containerShadow,
        backdropFilter: "blur(10px)",
        transition: "opacity 0.2s ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {dots.map(({ index, isActive }) => (
        <Box
          key={index}
          role="tab"
          tabIndex={disabled ? -1 : 0}
          aria-selected={isActive}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => handleDotClick(index)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              handleDotClick(index);
            }
          }}
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: isActive ? "primary.main" : "rgba(0, 0, 0, 0.2)",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            outline: "none",
            "&:hover": disabled
              ? {}
              : {
                  backgroundColor: isActive
                    ? "primary.dark"
                    : "rgba(0, 0, 0, 0.4)",
                  transform: "scale(1.3)",
                },
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        />
      ))}
    </Stack>
  );
});

DotsNavigation.displayName = "DotsNavigation";

const GradientOverlay = React.memo<{
  side: "left" | "right";
  zIndex: number;
}>(({ side, zIndex }) => {
  const theme = useTheme();

  const gradientBase =
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : "rgba(255,255,255,0.8)";

  const gradient = `linear-gradient(to ${
    side === "left" ? "right" : "left"
  }, ${gradientBase}, transparent)`;

  return (
    <Box
      sx={{
        content: '""',
        position: "absolute",
        top: 0,
        [side]: 0,
        width: "200px",
        height: "100%",
        background: gradient,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
});

GradientOverlay.displayName = "GradientOverlay";

export const CarouselControls: React.FC<CarouselControlsProps> = React.memo(
  ({
    currentIndex,
    totalItems,
    onGoToSlide,
    isTransitioning = false,
    zIndex = 1000,
    disabled = false,
    className,
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const handleGoToSlide = useCallback(
      (index: number) => {
        if (!disabled && !isTransitioning) {
          onGoToSlide(index);
        }
      },
      [onGoToSlide, disabled, isTransitioning]
    );

    // Мемоизированные значения
    const isControlDisabled = disabled || isTransitioning;

    return (
      <Box
        className={className}
        role="region"
        aria-label="Carousel controls"
        sx={{
          position: "relative",
          width: "100vw",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: { xs: 2, md: 3 },
          transition: "opacity 0.2s ease",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {/* Gradient Overlays */}
        <GradientOverlay side="left" zIndex={zIndex} />
        <GradientOverlay side="right" zIndex={zIndex} />

        {/* Controls Container */}
        <Box
          sx={{
            position: "relative",
            zIndex: zIndex + 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
          }}
        >
          {/* Dots Navigation
          <DotsNavigation
            totalItems={totalItems}
            currentIndex={currentIndex}
            onGoToSlide={handleGoToSlide}
            disabled={isControlDisabled}
          /> */}
        </Box>
      </Box>
    );
  }
);

CarouselControls.displayName = "CarouselControls";
