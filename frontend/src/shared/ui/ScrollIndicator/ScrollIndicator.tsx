import React, { memo, useTransition } from "react";
import { motion } from "framer-motion";
import { Box, IconButton, useTheme, alpha } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

interface ScrollIndicatorProps {
  activeSection: number;
  totalSections: number;
  onNavigate: (index: number) => void;
  position?: "left" | "right";
  showArrows?: boolean;
  showDots?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = memo(
  ({
    activeSection,
    totalSections,
    onNavigate,
    position = "right",
    showArrows = true,
    showDots = true,
    disabled = false,
    className,
  }) => {
    const theme = useTheme();
    const [isPending, startTransition] = useTransition();

    const canGoUp = activeSection > 0;
    const canGoDown = activeSection < totalSections - 1;
    const isLoading = isPending || disabled;

    // Pure navigation function
    const handleNavigate = (targetIndex: number) => {
      if (isLoading || targetIndex < 0 || targetIndex >= totalSections) return;

      startTransition(() => {
        onNavigate(targetIndex);
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: position === "right" ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className={className}
      >
        <Box
          sx={{
            position: "fixed",
            [position]: { xs: 16, sm: 24 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            opacity: isLoading ? 0.5 : 1,
            transition: "opacity 0.3s ease",
            "@media (max-width: 600px)": {
              [position]: 12,
              transform: "translateY(-50%) scale(0.9)",
            },
          }}
        >
          {/* Up Arrow */}
          {showArrows && (
            <motion.div
              whileHover={{ scale: canGoUp ? 1.1 : 1 }}
              whileTap={{ scale: canGoUp ? 0.9 : 1 }}
              animate={{
                opacity: canGoUp ? 1 : 0.3,
                y: canGoUp ? 0 : 3,
              }}
              transition={{ duration: 0.2 }}
            >
              <IconButton
                onClick={() => handleNavigate(activeSection - 1)}
                disabled={!canGoUp || isLoading}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  color: canGoUp
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                  width: 40,
                  height: 40,
                  "&:hover": {
                    backgroundColor: canGoUp
                      ? theme.palette.primary.main
                      : alpha(theme.palette.background.paper, 0.9),
                    color: canGoUp
                      ? theme.palette.primary.contrastText
                      : theme.palette.grey[400],
                    transform: canGoUp ? "translateY(-1px)" : "none",
                  },
                  "&:disabled": { opacity: 0.4 },
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${alpha(
                    theme.palette.primary.main,
                    canGoUp ? 0.3 : 0.1
                  )}`,
                  boxShadow: canGoUp
                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                    : `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
              >
                <KeyboardArrowUp />
              </IconButton>
            </motion.div>
          )}

          {/* Section Dots */}
          {showDots && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                py: 1.5,
                px: 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                borderRadius: 2,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.common.black,
                  0.1
                )}`,
              }}
            >
              {Array.from({ length: totalSections }, (_, index) => {
                const isActive = index === activeSection;
                const distance = Math.abs(index - activeSection);

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <motion.button
                      onClick={() => handleNavigate(index)}
                      disabled={isLoading}
                      style={{
                        width: isActive ? 12 : 8,
                        height: isActive ? 12 : 8,
                        borderRadius: "50%",
                        border: "none",
                        cursor: isLoading ? "wait" : "pointer",
                        position: "relative",
                        padding: 0,
                        background: "transparent",
                      }}
                      animate={{
                        backgroundColor: isActive
                          ? theme.palette.primary.main
                          : alpha(
                              theme.palette.grey[distance > 1 ? 500 : 400],
                              0.6
                            ),
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive
                          ? `0 0 12px ${alpha(theme.palette.primary.main, 0.6)}`
                          : `0 1px 4px ${alpha(theme.palette.grey[400], 0.3)}`,
                      }}
                      whileHover={{
                        scale: 1.3,
                        backgroundColor: isActive
                          ? theme.palette.primary.light
                          : theme.palette.primary.main,
                        boxShadow: `0 0 16px ${alpha(
                          theme.palette.primary.main,
                          0.8
                        )}`,
                      }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      {/* Active dot inner glow */}
                      {isActive && (
                        <motion.div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: alpha(
                              theme.palette.primary.contrastText,
                              0.8
                            ),
                          }}
                          animate={{
                            scale: [0.8, 1, 0.8],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </Box>
          )}

          {/* Down Arrow */}
          {showArrows && (
            <motion.div
              whileHover={{ scale: canGoDown ? 1.1 : 1 }}
              whileTap={{ scale: canGoDown ? 0.9 : 1 }}
              animate={{
                opacity: canGoDown ? 1 : 0.3,
                y: canGoDown ? 0 : -3,
              }}
              transition={{ duration: 0.2 }}
            >
              <IconButton
                onClick={() => handleNavigate(activeSection + 1)}
                disabled={!canGoDown || isLoading}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  color: canGoDown
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                  width: 40,
                  height: 40,
                  "&:hover": {
                    backgroundColor: canGoDown
                      ? theme.palette.primary.main
                      : alpha(theme.palette.background.paper, 0.9),
                    color: canGoDown
                      ? theme.palette.primary.contrastText
                      : theme.palette.grey[400],
                    transform: canGoDown ? "translateY(1px)" : "none",
                  },
                  "&:disabled": { opacity: 0.4 },
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${alpha(
                    theme.palette.primary.main,
                    canGoDown ? 0.3 : 0.1
                  )}`,
                  boxShadow: canGoDown
                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                    : `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
              >
                <KeyboardArrowDown />
              </IconButton>
            </motion.div>
          )}
        </Box>
      </motion.div>
    );
  }
);
