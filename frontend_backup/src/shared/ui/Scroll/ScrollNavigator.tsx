import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Box, IconButton, useTheme, alpha, Tooltip } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

interface ScrollNavigatorProps {
  activeSection: number;
  totalSections: number;
  sectionIds?: string[];
  onNavigate: (index: number) => void;
  position?: "left" | "right";
  showArrows?: boolean;
  showDots?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ScrollNavigator: React.FC<ScrollNavigatorProps> = memo(
  ({
    activeSection,
    totalSections,
    sectionIds = [],
    onNavigate,
    position = "right",
    showArrows = true,
    showDots = true,
    disabled = false,
    className,
  }) => {
    const theme = useTheme();

    const handleNavigateUp = useCallback(() => {
      if (disabled || activeSection <= 0) return;
      onNavigate(activeSection - 1);
    }, [activeSection, disabled, onNavigate]);

    const handleNavigateDown = useCallback(() => {
      if (disabled || activeSection >= totalSections - 1) return;
      onNavigate(activeSection + 1);
    }, [activeSection, totalSections, disabled, onNavigate]);

    const handleDotClick = useCallback(
      (index: number) => {
        if (disabled || index === activeSection) return;
        onNavigate(index);
      },
      [activeSection, disabled, onNavigate]
    );

    const containerStyles = {
      position: "fixed" as const,
      top: "50%",
      transform: "translateY(-50%)",
      [position]: 24,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 1.5,
      py: 2,
      px: 1,
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      backdropFilter: "blur(12px)",
      borderRadius: 3,
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      boxShadow: theme.shadows[8],
      opacity: disabled ? 0.4 : 1,
      transition: "all 0.3s ease",
    };

    const arrowStyles = {
      width: 36,
      height: 36,
      borderRadius: "50%",
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      color: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
        transform: "scale(1.05)",
      },
      "&:disabled": {
        opacity: 0.3,
        cursor: "not-allowed",
        transform: "none",
      },
      transition: "all 0.2s ease",
    };

    if (totalSections <= 1) return null;

    return (
      <Box className={className} sx={containerStyles}>
        {/* Стрелка вверх */}
        {showArrows && (
          <Tooltip
            title="Предыдущая секция"
            placement={position === "right" ? "left" : "right"}
          >
            {disabled || activeSection <= 0 ? (
              <span>
                <IconButton
                  onClick={handleNavigateUp}
                  disabled={disabled || activeSection <= 0}
                  sx={arrowStyles}
                  size="small"
                >
                  <KeyboardArrowUp fontSize="small" />
                </IconButton>
              </span>
            ) : (
              <IconButton
                onClick={handleNavigateUp}
                disabled={disabled || activeSection <= 0}
                sx={arrowStyles}
                size="small"
              >
                <KeyboardArrowUp fontSize="small" />
              </IconButton>
            )}
          </Tooltip>
        )}

        {/* Точки навигации */}
        {showDots && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            {Array.from({ length: totalSections }, (_, index) => {
              const isActive = index === activeSection;
              const sectionName = sectionIds[index] || `Секция ${index + 1}`;

              return (
                <Tooltip
                  key={`dot-${index}`}
                  title={sectionName}
                  placement={position === "right" ? "left" : "right"}
                >
                  <motion.div
                    onClick={() => handleDotClick(index)}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      cursor: disabled ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                    whileHover={disabled ? {} : { scale: 1.2 }}
                    whileTap={disabled ? {} : { scale: 0.9 }}
                    animate={{
                      backgroundColor: isActive
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.25),
                      scale: isActive ? 1.3 : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Внутренняя точка для активного состояния */}
                    {isActive && (
                      <motion.div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.primary.contrastText,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </Tooltip>
              );
            })}
          </Box>
        )}

        {/* Стрелка вниз */}
        {showArrows && (
          <Tooltip
            title="Следующая секция"
            placement={position === "right" ? "left" : "right"}
          >
            {disabled || activeSection >= totalSections - 1 ? (
              <span>
                <IconButton
                  onClick={handleNavigateDown}
                  disabled={disabled || activeSection >= totalSections - 1}
                  sx={arrowStyles}
                  size="small"
                >
                  <KeyboardArrowDown fontSize="small" />
                </IconButton>
              </span>
            ) : (
              <IconButton
                onClick={handleNavigateDown}
                disabled={disabled || activeSection >= totalSections - 1}
                sx={arrowStyles}
                size="small"
              >
                <KeyboardArrowDown fontSize="small" />
              </IconButton>
            )}
          </Tooltip>
        )}
      </Box>
    );
  }
);

ScrollNavigator.displayName = "ScrollNavigator";
