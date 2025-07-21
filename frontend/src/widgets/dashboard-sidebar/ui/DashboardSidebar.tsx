import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Box,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  Divider,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Fullscreen,
  FullscreenExit,
  ViewStream,
  GridView,
  DensitySmall,
  DensityMedium,
  DensityLarge,
  AutoAwesome,
  Tune,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";
export type DashboardLayout = "grid" | "list" | "masonry";
export type DashboardDensity = "comfortable" | "compact" | "dense";

export interface DashboardSidebarProps {
  className?: string;
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  isFullscreen?: boolean;
  showControls?: boolean;
  onModeChange?: (mode: DashboardMode) => void;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onDensityChange?: (density: DashboardDensity) => void;
  onFullscreenToggle?: () => void;
}

/**
 * Minimalist Dashboard Sidebar - Compact Only
 * Ultra-clean vertical control panel with icon-only interface
 */
export const DashboardSidebar = memo<DashboardSidebarProps>(
  ({
    className,
    mode,
    layout,
    density,
    isFullscreen = false,
    showControls = true,
    onModeChange,
    onLayoutChange,
    onDensityChange,
    onFullscreenToggle,
  }) => {
    const t = i18n.t;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Toggle collapse state
    const handleToggleCollapse = useCallback(() => {
      setIsCollapsed((prev) => !prev);
    }, []);

    // Mode controls
    const handleModeChange = useCallback(() => {
      const modes: DashboardMode[] = ["minimal", "compact", "detailed"];
      const currentIndex = modes.indexOf(mode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      onModeChange?.(nextMode);
    }, [mode, onModeChange]);

    // Layout controls
    const handleLayoutChange = useCallback(() => {
      const layouts: DashboardLayout[] = ["grid", "list", "masonry"];
      const currentIndex = layouts.indexOf(layout);
      const nextLayout = layouts[(currentIndex + 1) % layouts.length];
      onLayoutChange?.(nextLayout);
    }, [layout, onLayoutChange]);

    // Density controls
    const handleDensityChange = useCallback(() => {
      const densities: DashboardDensity[] = ["dense", "compact", "comfortable"];
      const currentIndex = densities.indexOf(density);
      const nextDensity = densities[(currentIndex + 1) % densities.length];
      onDensityChange?.(nextDensity);
    }, [density, onDensityChange]);

    // Control buttons configuration
    const controlButtons = useMemo(
      () => [
        {
          key: "mode",
          icon:
            mode === "minimal"
              ? DensitySmall
              : mode === "compact"
              ? DensityMedium
              : DensityLarge,
          color: theme.palette.primary.main,
          tooltip: `Режим: ${mode}`,
          onClick: handleModeChange,
          isActive: true,
        },
        {
          key: "layout",
          icon:
            layout === "grid"
              ? GridView
              : layout === "list"
              ? ViewStream
              : AutoAwesome,
          color: theme.palette.secondary.main,
          tooltip: `Макет: ${layout}`,
          onClick: handleLayoutChange,
          isActive: true,
        },
        {
          key: "density",
          icon:
            density === "dense"
              ? DensitySmall
              : density === "compact"
              ? DensityMedium
              : DensityLarge,
          color: theme.palette.info.main,
          tooltip: `Плотность: ${density}`,
          onClick: handleDensityChange,
          isActive: true,
        },
        {
          key: "fullscreen",
          icon: isFullscreen ? FullscreenExit : Fullscreen,
          color: theme.palette.warning.main,
          tooltip: isFullscreen
            ? "Выйти из полноэкранного режима"
            : "Полноэкранный режим",
          onClick: onFullscreenToggle,
          isActive: isFullscreen,
        },
      ],
      [
        mode,
        layout,
        density,
        isFullscreen,
        theme.palette,
        handleModeChange,
        handleLayoutChange,
        handleDensityChange,
        onFullscreenToggle,
      ]
    );

    // Не показывать на мобильных устройствах
    if (isMobile || !showControls) {
      return null;
    }

    return (
      <>
        {/* Water Drop Collapsed State - Only visible when collapsed */}
        {isCollapsed && (
          <Box
            sx={{
              position: "fixed",
              top: "40%",
              right: 24,
              transform: "translateY(-50%)",
              zIndex: 1003,
              animation:
                "waterDropFall 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              "@keyframes waterDropFall": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(-100%) scale(0.3)",
                  borderRadius: "50%",
                },
                "50%": {
                  transform: "translateY(-40%) scale(1.1)",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(-50%) scale(1)",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                },
              },
            }}
          >
            <Tooltip
              title="Развернуть панель управления"
              placement="left"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: alpha(theme.palette.grey[900], 0.95),
                    backdropFilter: "blur(12px)",
                    borderRadius: 3,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.75,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  },
                },
              }}
            >
              <IconButton
                onClick={handleToggleCollapse}
                sx={{
                  width: 64,
                  height: 80,
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", // Water drop shape
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.95)} 0%,
                    ${alpha(theme.palette.primary.dark, 0.9)} 50%,
                    ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
                  backdropFilter: "blur(20px) saturate(1.2)",
                  border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  boxShadow: `
                    0 20px 60px ${alpha(theme.palette.primary.main, 0.4)},
                    0 10px 30px ${alpha(theme.palette.common.black, 0.15)},
                    inset 0 2px 0 ${alpha(theme.palette.common.white, 0.3)},
                    inset 0 -2px 0 ${alpha(theme.palette.common.black, 0.1)}
                  `,
                  color: theme.palette.common.white,
                  position: "relative",
                  overflow: "hidden",
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "20%",
                    left: "30%",
                    width: "15px",
                    height: "15px",
                    borderRadius: "50%",
                    background: alpha(theme.palette.common.white, 0.4),
                    filter: "blur(1px)",
                    animation: "shine 2s ease-in-out infinite",
                    "@keyframes shine": {
                      "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
                      "50%": { opacity: 0.8, transform: "scale(1.2)" },
                    },
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(45deg, 
                      transparent 0%, 
                      ${alpha(theme.palette.common.white, 0.1)} 50%, 
                      transparent 100%)`,
                    animation: "waterFlow 3s linear infinite",
                    "@keyframes waterFlow": {
                      "0%": { transform: "translateX(-100%) skewX(-15deg)" },
                      "100%": { transform: "translateX(100%) skewX(-15deg)" },
                    },
                  },
                  "&:hover": {
                    transform: "scale(1.15) translateY(-4px)",
                    borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
                    boxShadow: `
                      0 25px 80px ${alpha(theme.palette.primary.main, 0.5)},
                      0 15px 40px ${alpha(theme.palette.common.black, 0.2)},
                      inset 0 3px 0 ${alpha(theme.palette.common.white, 0.4)}
                    `,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.light, 0.98)} 0%,
                      ${alpha(theme.palette.primary.main, 0.95)} 50%,
                      ${alpha(theme.palette.secondary.light, 0.9)} 100%)`,
                  },
                  "&:active": {
                    transform: "scale(1.05) translateY(-2px)",
                    borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
                  },
                }}
              >
                <Tune
                  sx={{
                    fontSize: 28,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    zIndex: 1,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Main Sidebar Panel - Floating from right */}
        <Box
          className={className}
          sx={{
            position: "fixed",
            top: "50%",
            right: 0,
            transform: `translateY(-50%) translateX(${
              isCollapsed ? "100%" : "0%"
            })`,
            width: 88,
            zIndex: 1000,
            transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            opacity: isCollapsed ? 0 : 1,
            visibility: isCollapsed ? "hidden" : "visible",
          }}
        >
          {/* Flowing container with liquid design */}
          <Box
            sx={{
              position: "relative",
              mr: 2,
              "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                right: -8,
                transform: "translateY(-50%)",
                width: 16,
                height: 60,
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${alpha(theme.palette.primary.main, 0.2)} 50%,
                  ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                borderRadius: "50px 0 0 50px",
                filter: "blur(3px)",
                animation: "flow 4s ease-in-out infinite",
                "@keyframes flow": {
                  "0%, 100%": {
                    height: 60,
                    opacity: 0.6,
                    transform: "translateY(-50%) scale(1)",
                  },
                  "50%": {
                    height: 80,
                    opacity: 1,
                    transform: "translateY(-50%) scale(1.1)",
                  },
                },
              },
            }}
          >
            <Box
              sx={{
                p: 2.5,
                borderRadius: "24px 0 0 24px",
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.98)} 0%,
                  ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                backdropFilter: "blur(20px) saturate(1.1)",
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                borderRight: "none",
                boxShadow: `
                  -15px 0 60px ${alpha(theme.palette.common.black, 0.08)},
                  -8px 0 30px ${alpha(theme.palette.common.black, 0.05)},
                  inset 1px 0 0 ${alpha(theme.palette.common.white, 0.1)}
                `,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.primary.main, 0.8)} 0%, 
                    ${alpha(theme.palette.secondary.main, 0.6)} 50%,
                    ${alpha(theme.palette.info.main, 0.4)} 100%)`,
                  borderRadius: "24px 0 0 0",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, 
                    transparent 0%, 
                    ${alpha(theme.palette.primary.main, 0.02)} 50%, 
                    transparent 100%)`,
                  animation: "liquidFlow 6s ease-in-out infinite",
                  "@keyframes liquidFlow": {
                    "0%, 100%": {
                      background: `linear-gradient(45deg, 
                        transparent 0%, 
                        ${alpha(theme.palette.primary.main, 0.02)} 50%, 
                        transparent 100%)`,
                    },
                    "50%": {
                      background: `linear-gradient(45deg, 
                        transparent 0%, 
                        ${alpha(theme.palette.secondary.main, 0.03)} 50%, 
                        transparent 100%)`,
                    },
                  },
                },
                "&:hover": {
                  transform: "translateX(-4px)",
                  boxShadow: `
                    -20px 0 80px ${alpha(theme.palette.common.black, 0.12)},
                    -10px 0 40px ${alpha(theme.palette.common.black, 0.08)}
                  `,
                },
              }}
            >
              {/* Expand/Collapse button - Only in expanded state */}
              {!isCollapsed && (
                <Box
                  sx={{
                    position: "absolute",
                    right: -12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1001,
                  }}
                >
                  <Tooltip
                    title="Свернуть панель"
                    placement="left"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: alpha(theme.palette.grey[900], 0.95),
                          backdropFilter: "blur(12px)",
                          borderRadius: 3,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          px: 1.5,
                          py: 0.75,
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.2
                          )}`,
                        },
                      },
                    }}
                  >
                    <IconButton
                      onClick={handleToggleCollapse}
                      size="small"
                      sx={{
                        width: 24,
                        height: 40,
                        borderRadius: "0 12px 12px 0",
                        backgroundColor: alpha(
                          theme.palette.background.paper,
                          0.95
                        ),
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1
                        )}`,
                        borderLeft: "none",
                        color: theme.palette.text.secondary,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          color: theme.palette.primary.main,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                      }}
                    >
                      <ChevronRight sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Разделитель */}
              <Divider
                sx={{
                  mb: 2,
                  borderColor: alpha(theme.palette.divider, 0.12),
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    ${alpha(theme.palette.divider, 0.3)} 50%, 
                    transparent 100%)`,
                  height: 1,
                }}
              />

              {/* Кнопки управления */}
              <Stack spacing={2} alignItems="center">
                {controlButtons.map(
                  (
                    { key, icon: Icon, color, tooltip, onClick, isActive },
                    index
                  ) => (
                    <Tooltip
                      key={key}
                      title={tooltip}
                      placement="left"
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: alpha(
                              theme.palette.grey[900],
                              0.95
                            ),
                            backdropFilter: "blur(12px)",
                            borderRadius: 3,
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            px: 2,
                            py: 1,
                            border: `1px solid ${alpha(
                              theme.palette.divider,
                              0.2
                            )}`,
                          },
                        },
                        arrow: {
                          sx: {
                            color: alpha(theme.palette.grey[900], 0.95),
                          },
                        },
                      }}
                    >
                      <IconButton
                        onClick={onClick}
                        disabled={!onClick}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          backgroundColor: isActive
                            ? alpha(color, 0.12)
                            : alpha(theme.palette.action.hover, 0.04),
                          color: isActive
                            ? color
                            : theme.palette.text.secondary,
                          border: `1px solid ${
                            isActive
                              ? alpha(color, 0.25)
                              : alpha(theme.palette.divider, 0.08)
                          }`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, 
                              ${alpha(color, 0.1)} 0%, 
                              ${alpha(color, 0.05)} 100%
                            )`,
                            opacity: isActive ? 1 : 0,
                            transition: "opacity 0.3s ease",
                          },
                          "&:hover": {
                            backgroundColor: alpha(color, 0.16),
                            color: color,
                            borderColor: alpha(color, 0.4),
                            transform: "translateY(-2px) scale(1.05)",
                            boxShadow: `
                              0 8px 32px ${alpha(color, 0.2)},
                              0 4px 16px ${alpha(color, 0.15)}
                            `,
                            "&::before": {
                              opacity: 1,
                            },
                          },
                          "&:active": {
                            transform: "translateY(0) scale(0.95)",
                          },
                          "&:disabled": {
                            opacity: 0.4,
                            cursor: "not-allowed",
                            "&:hover": {
                              transform: "none",
                              boxShadow: "none",
                            },
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: 22, zIndex: 1 }} />
                      </IconButton>
                    </Tooltip>
                  )
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);

DashboardSidebar.displayName = "DashboardSidebar";
