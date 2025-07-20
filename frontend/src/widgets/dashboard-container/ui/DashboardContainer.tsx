import React, { memo, useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip,
  ButtonGroup,
  Chip,
} from "@mui/material";
import {
  ViewModule,
  ViewList,
  ViewComfy,
  ViewCompact,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";

export type DashboardMode = "minimal" | "compact" | "detailed" | "fullscreen";
export type DashboardLayout = "grid" | "list" | "masonry";
export type DashboardDensity = "comfortable" | "compact" | "dense";

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
  defaultMode?: DashboardMode;
  defaultLayout?: DashboardLayout;
  defaultDensity?: DashboardDensity;
  showModeControls?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  onModeChange?: (mode: DashboardMode) => void;
  onLayoutChange?: (layout: DashboardLayout) => void;
}

export const DashboardContainer = memo<DashboardContainerProps>(
  ({
    children,
    className,
    defaultMode = "detailed",
    defaultLayout = "grid",
    defaultDensity = "comfortable",
    showModeControls = true,
    maxWidth = "xl",
    onModeChange,
    onLayoutChange,
  }) => {
    const theme = useTheme();
    
    // Responsive breakpoints
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // State management
    const [mode, setMode] = useState<DashboardMode>(
      isMobile ? "compact" : defaultMode
    );
    const [layout, setLayout] = useState<DashboardLayout>(
      isMobile ? "list" : defaultLayout
    );
    const [density, setDensity] = useState<DashboardDensity>(
      isMobile ? "compact" : defaultDensity
    );
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Handle mounting safely
    useEffect(() => {
      const timer = setTimeout(() => setIsMounted(true), 200);
      return () => clearTimeout(timer);
    }, []);

    // Context7 spacing system
    const getSpacing = useMemo(() => {
      const baseSpacing = {
        minimal: { xs: 1.5, sm: 2, md: 2.5 },
        compact: { xs: 2, sm: 2.5, md: 3 },
        detailed: { xs: 2.5, sm: 3, md: 3.5 },
        fullscreen: { xs: 1, sm: 1.5, md: 2 },
      };

      const densityMultiplier = {
        dense: 0.8,
        compact: 0.9,
        comfortable: 1,
      };

      const modeSpacing = baseSpacing[mode];
      const multiplier = densityMultiplier[density];

      return {
        xs: modeSpacing.xs * multiplier,
        sm: modeSpacing.sm * multiplier,
        md: modeSpacing.md * multiplier,
      };
    }, [mode, density]);

    // Context7 padding system
    const getPadding = useMemo(() => {
      if (isFullscreen) return { xs: 1, sm: 1.5, md: 2 };
      
      const basePadding = {
        minimal: { xs: 2, sm: 3, md: 3 },
        compact: { xs: 2, sm: 3, md: 3.5 },
        detailed: { xs: 2.5, sm: 3.5, md: 4 },
        fullscreen: { xs: 1, sm: 1.5, md: 2 },
      };

      return basePadding[mode];
    }, [mode, isFullscreen]);

    // Event handlers
    const handleModeChange = useCallback(
      (newMode: DashboardMode) => {
        setMode(newMode);
        onModeChange?.(newMode);
        
        if (newMode === "minimal" && layout === "grid") {
          setLayout("list");
          onLayoutChange?.("list");
        }
      },
      [layout, onModeChange, onLayoutChange]
    );

    const handleLayoutChange = useCallback(
      (newLayout: DashboardLayout) => {
        setLayout(newLayout);
        onLayoutChange?.(newLayout);
      },
      [onLayoutChange]
    );

    const handleFullscreenToggle = useCallback(() => {
      setIsFullscreen((prev) => !prev);
      if (!isFullscreen) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }, [isFullscreen]);

    // Show basic version before mounting to prevent transition errors
    if (!isMounted) {
      return (
        <Box
          className={className}
          sx={{
            minHeight: "100vh",
            background: "transparent",
            position: "relative",
            opacity: 0.8,
          }}
        >
          <Container maxWidth={maxWidth} sx={{ py: 3, px: 3 }}>
            <Stack spacing={3}>
              {children}
            </Stack>
          </Container>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        sx={{
          minHeight: "100vh",
          background: isFullscreen 
            ? theme.palette.background.default
            : "transparent",
          position: "relative",
          transition: "background-color 0.3s ease",
        }}
      >
        <Container
          maxWidth={isFullscreen ? false : maxWidth}
          sx={{
            py: getPadding,
            px: getPadding,
            height: isFullscreen ? "100vh" : "auto",
            overflow: isFullscreen ? "auto" : "visible",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              width: 8,
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: alpha(theme.palette.divider, 0.05),
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 4,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
              },
            },
          }}
        >
          {/* Mode Controls */}
          {showModeControls && (
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                mb: getSpacing,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                animation: "slideDown 0.6s ease-out",
                "@keyframes slideDown": {
                  "0%": {
                    opacity: 0,
                    transform: "translateY(-20px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  p: 1,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                }}
              >
                {/* Density Controls */}
                <ButtonGroup size="small" variant="outlined">
                  <Tooltip title="Comfortable">
                    <IconButton
                      onClick={() => setDensity("comfortable")}
                      color={
                        density === "comfortable" ? "primary" : "default"
                      }
                      size="small"
                    >
                      <ViewComfy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Compact">
                    <IconButton
                      onClick={() => setDensity("compact")}
                      color={density === "compact" ? "primary" : "default"}
                      size="small"
                    >
                      <ViewCompact fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>

                {/* Layout Controls */}
                <ButtonGroup size="small" variant="outlined">
                  <Tooltip title="Grid Layout">
                    <IconButton
                      onClick={() => handleLayoutChange("grid")}
                      color={layout === "grid" ? "primary" : "default"}
                      size="small"
                    >
                      <ViewModule fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="List Layout">
                    <IconButton
                      onClick={() => handleLayoutChange("list")}
                      color={layout === "list" ? "primary" : "default"}
                      size="small"
                    >
                      <ViewList fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>

                {/* Fullscreen Toggle */}
                <Tooltip
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  <IconButton
                    onClick={handleFullscreenToggle}
                    color={isFullscreen ? "primary" : "default"}
                    size="small"
                  >
                    {isFullscreen ? (
                      <FullscreenExit fontSize="small" />
                    ) : (
                      <Fullscreen fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Mode Indicator */}
                <Chip
                  label={mode}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 28,
                    fontSize: "0.75rem",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Content */}
          <Stack
            spacing={getSpacing}
            sx={{
              animation: "slideUp 0.4s ease-out",
              "@keyframes slideUp": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
              "& > *": {
                transition: "all 0.2s ease",
              },
            }}
          >
            {children}
          </Stack>
        </Container>
      </Box>
    );
  }
);

DashboardContainer.displayName = "DashboardContainer";
