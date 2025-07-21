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
  collapsed: boolean;
  isFullscreen?: boolean;
  onModeChange: (mode: DashboardMode) => void;
  onLayoutChange: (layout: DashboardLayout) => void;
  onDensityChange: (density: DashboardDensity) => void;
  onToggleCollapse: () => void;
  onFullscreenToggle?: () => void;
}

export const DashboardSidebar = memo<DashboardSidebarProps>(
  ({
    className,
    mode,
    layout,
    density,
    collapsed = false,
    isFullscreen = false,
    onModeChange,
    onLayoutChange,
    onDensityChange,
    onToggleCollapse,
    onFullscreenToggle,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [isHovered, setIsHovered] = useState(false);

    const handleToggleCollapse = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("Toggle collapse clicked, current collapsed:", collapsed);
        if (onToggleCollapse && typeof onToggleCollapse === "function") {
          onToggleCollapse();
        } else {
          console.error(
            "onToggleCollapse is not a function:",
            onToggleCollapse
          );
        }
      },
      [collapsed, onToggleCollapse]
    );

    const handleModeChange = useCallback(
      (newMode: DashboardMode) => {
        if (onModeChange && typeof onModeChange === "function") {
          onModeChange(newMode);
        }
      },
      [onModeChange]
    );

    const handleLayoutChange = useCallback(
      (newLayout: DashboardLayout) => {
        if (onLayoutChange && typeof onLayoutChange === "function") {
          onLayoutChange(newLayout);
        }
      },
      [onLayoutChange]
    );

    const handleDensityChange = useCallback(
      (newDensity: DashboardDensity) => {
        if (onDensityChange && typeof onDensityChange === "function") {
          onDensityChange(newDensity);
        }
      },
      [onDensityChange]
    );

    const getModeIcon = useCallback((currentMode: DashboardMode) => {
      switch (currentMode) {
        case "detailed":
          return <ViewStream sx={{ fontSize: 18 }} />;
        case "compact":
          return <GridView sx={{ fontSize: 18 }} />;
        case "minimal":
          return <DensitySmall sx={{ fontSize: 18 }} />;
        default:
          return <GridView sx={{ fontSize: 18 }} />;
      }
    }, []);

    const getLayoutIcon = useCallback((currentLayout: DashboardLayout) => {
      switch (currentLayout) {
        case "grid":
          return <GridView sx={{ fontSize: 18 }} />;
        case "list":
          return <ViewStream sx={{ fontSize: 18 }} />;
        case "masonry":
          return <DensityMedium sx={{ fontSize: 18 }} />;
        default:
          return <GridView sx={{ fontSize: 18 }} />;
      }
    }, []);

    const getDensityIcon = useCallback((currentDensity: DashboardDensity) => {
      switch (currentDensity) {
        case "comfortable":
          return <DensityLarge sx={{ fontSize: 18 }} />;
        case "compact":
          return <DensityMedium sx={{ fontSize: 18 }} />;
        case "dense":
          return <DensitySmall sx={{ fontSize: 18 }} />;
        default:
          return <DensityMedium sx={{ fontSize: 18 }} />;
      }
    }, []);

    const controlButtons = useMemo(
      () => [
        {
          key: "mode",
          icon: getModeIcon(mode),
          tooltip: "Режим отображения",
          onClick: () => {
            const modes: DashboardMode[] = ["minimal", "compact", "detailed"];
            const currentIndex = modes.indexOf(mode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            handleModeChange(nextMode);
          },
          active: mode !== "minimal",
        },
        {
          key: "layout",
          icon: getLayoutIcon(layout),
          tooltip: "Макет дашборда",
          onClick: () => {
            const layouts: DashboardLayout[] = ["grid", "list", "masonry"];
            const currentIndex = layouts.indexOf(layout);
            const nextLayout = layouts[(currentIndex + 1) % layouts.length];
            handleLayoutChange(nextLayout);
          },
          active: layout !== "grid",
        },
        {
          key: "density",
          icon: getDensityIcon(density),
          tooltip: "Плотность элементов",
          onClick: () => {
            const densities: DashboardDensity[] = [
              "comfortable",
              "compact",
              "dense",
            ];
            const currentIndex = densities.indexOf(density);
            const nextDensity =
              densities[(currentIndex + 1) % densities.length];
            handleDensityChange(nextDensity);
          },
          active: density !== "comfortable",
        },
        {
          key: "fullscreen",
          icon: isFullscreen ? (
            <FullscreenExit sx={{ fontSize: 18 }} />
          ) : (
            <Fullscreen sx={{ fontSize: 18 }} />
          ),
          tooltip: isFullscreen
            ? "Выйти из полноэкранного режима"
            : "Полноэкранный режим",
          onClick:
            onFullscreenToggle && typeof onFullscreenToggle === "function"
              ? onFullscreenToggle
              : undefined,
          active: isFullscreen,
        },
      ],
      [
        mode,
        layout,
        density,
        isFullscreen,
        handleModeChange,
        handleLayoutChange,
        handleDensityChange,
        onFullscreenToggle,
        getModeIcon,
        getLayoutIcon,
        getDensityIcon,
      ]
    );

    if (isMobile) return null;

    // Collapsed state - thin strip hidden at the right edge
    if (collapsed) {
      return (
        <Box
          className={className}
          sx={{
            position: "fixed",
            top: "50%",
            right: isHovered ? 10 : -30,
            transform: "translateY(-50%)",
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(["right"], {
              duration: theme.transitions.duration.short,
              easing: theme.transitions.easing.easeOut,
            }),
          }}
        >
          <Box
            onClick={handleToggleCollapse}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              width: 40,
              height: 180,
              background: isHovered
                ? `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.25)} 0%,
                    ${alpha(theme.palette.primary.main, 0.15)} 50%,
                    ${alpha(theme.palette.primary.main, 0.25)} 100%)`
                : `linear-gradient(180deg, 
                    ${alpha(theme.palette.primary.main, 0.8)} 0%,
                    ${alpha(theme.palette.primary.main, 0.9)} 30%,
                    ${alpha(theme.palette.primary.main, 1)} 50%,
                    ${alpha(theme.palette.primary.main, 0.9)} 70%,
                    ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px 0 0 12px",
              boxShadow: isHovered
                ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}, 
                   inset 0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`
                : `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              borderRight: "none",
              position: "relative",
              animation: !isHovered ? "pulse 3s ease-in-out infinite" : "none",
              "@keyframes pulse": {
                "0%": {
                  boxShadow: `0 8px 32px ${alpha(
                    theme.palette.common.black,
                    0.12
                  )}`,
                },
                "50%": {
                  boxShadow: `0 12px 40px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                },
                "100%": {
                  boxShadow: `0 8px 32px ${alpha(
                    theme.palette.common.black,
                    0.12
                  )}`,
                },
              },
              "&:hover": {
                animation: "none",
              },
              "&:active": {
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.4)} 0%,
                  ${alpha(theme.palette.primary.main, 0.3)} 50%,
                  ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                transform: "scale(0.98)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                left: "50%",
                top: "45%",
                transform: "translateX(-50%)",
                width: 3,
                height: 12,
                backgroundColor: alpha(theme.palette.common.white, 0.7),
                borderRadius: 1.5,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                left: "50%",
                top: "55%",
                transform: "translateX(-50%)",
                width: 3,
                height: 12,
                backgroundColor: alpha(theme.palette.common.white, 0.5),
                borderRadius: 1.5,
              },
            }}
          >
            <ChevronLeft
              sx={{
                fontSize: 18,
                color: theme.palette.primary.contrastText,
                opacity: 0.95,
              }}
            />
          </Box>
        </Box>
      );
    }

    // Expanded state - full control panel
    return (
      <Box
        className={className}
        sx={{
          position: "fixed",
          top: "50%",
          right: 20,
          transform: "translateY(-50%)",
          zIndex: theme.zIndex.drawer + 1,
          pointerEvents: "auto",
        }}
      >
        <Box
          sx={{
            position: "relative",
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.08)} 0%,
              ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
            backdropFilter: "blur(12px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            borderRadius: 12,
            padding: "0.3px 1px",
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          }}
        >
          <Stack spacing={1.5} sx={{ alignItems: "center", minWidth: 60 }}>
            {/* Collapse Button */}
            <Tooltip title="Свернуть панель" placement="left" arrow>
              <IconButton
                onClick={handleToggleCollapse}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  backdropFilter: "blur(8px)",
                  transition: theme.transitions.create(
                    ["background-color", "border-color", "transform"],
                    {
                      duration: theme.transitions.duration.short,
                      easing: theme.transitions.easing.easeOut,
                    }
                  ),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.25),
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    transform: "scale(1.05)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <ChevronRight sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Divider */}
            <Divider
              sx={{
                width: "60%",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                my: 0.5,
              }}
            />

            {/* Control Buttons */}
            {controlButtons.map((button) => (
              <Tooltip
                key={button.key}
                title={button.tooltip}
                placement="left"
                arrow
              >
                <IconButton
                  onClick={button.onClick}
                  size="small"
                  disabled={!button.onClick}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: button.active
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.background.paper, 0.7),
                    color: button.active
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    border: `1px solid ${
                      button.active
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.divider, 0.1)
                    }`,
                    backdropFilter: "blur(8px)",
                    transition: theme.transitions.create(
                      ["background-color", "border-color", "transform"],
                      {
                        duration: theme.transitions.duration.short,
                        easing: theme.transitions.easing.easeOut,
                      }
                    ),
                    "&:hover": {
                      bgcolor: button.active
                        ? alpha(theme.palette.primary.main, 0.25)
                        : alpha(theme.palette.background.paper, 0.9),
                      borderColor: button.active
                        ? alpha(theme.palette.primary.main, 0.5)
                        : alpha(theme.palette.divider, 0.3),
                      transform: "scale(1.05)",
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                    "&:disabled": {
                      opacity: 0.5,
                      cursor: "not-allowed",
                    },
                  }}
                >
                  {button.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }
);

DashboardSidebar.displayName = "DashboardSidebar";
