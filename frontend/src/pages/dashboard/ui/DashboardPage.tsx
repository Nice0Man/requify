import React, {
  memo,
  useState,
  useCallback,
  startTransition,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import i18n from "@/shared/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardErrorBoundary, AuthDebugPanel } from "@/shared/ui";

import { DashboardLayout } from "@/widgets/layout";
import { DashboardHeader } from "@/widgets/dashboard-header";
import {
  DashboardSidebar,
  type DashboardMode,
  type DashboardLayout as DashboardLayoutType,
  type DashboardDensity,
} from "@/widgets/dashboard-sidebar";
import { DashboardContainer } from "@/widgets/container";

// Import new layout system
import { DashboardLayoutRenderer } from "./DashboardLayoutRenderer";
import {
  createDashboardWidgets,
  getWidgetsForMode,
  getWidgetsForLayout,
} from "../config/widgetDefinitions";

import {
  useDashboardOverview,
  useRefreshDashboard,
  useTimelineData,
  useDistributionData,
  dashboardKeys,
} from "@/features/dashboard";
import { useLayoutMode } from "@/shared/contexts/PerformanceContext";

export interface DashboardPageProps {
  className?: string;
}

/**
 * Main Dashboard Page Component with Context7 Design
 * New structure: Header at top, main content on left, controls sidebar on right
 */
const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  // Hooks
  const t = i18n.t;
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { mode: layoutMode, setMode: setLayoutMode } = useLayoutMode();

  // Responsive - стабилизируем с помощью useRef чтобы избежать ререндеров
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobileRef = useRef(isMobile);
  const isTabletRef = useRef(isTablet);

  // Обновляем ref-ы при изменении media queries
  useEffect(() => {
    isMobileRef.current = isMobile;
    isTabletRef.current = isTablet;
  }, [isMobile, isTablet]);

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(
    isMobile ? "compact" : "detailed"
  );
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayoutType>(
    isMobile ? "list" : "grid"
  );
  const [dashboardDensity, setDashboardDensity] = useState<DashboardDensity>(
    isMobile ? "compact" : "comfortable"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle mounting to prevent Fade errors
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Handle fullscreen events from browser (ESC key, F11, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement);
      if (isCurrentlyFullscreen !== isFullscreen) {
        setIsFullscreen(isCurrentlyFullscreen);

        // Update mode accordingly
        if (!isCurrentlyFullscreen && dashboardMode === "fullscreen") {
          setDashboardMode(isMobile ? "compact" : "detailed");
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [isFullscreen, dashboardMode, isMobile]);

  // Data fetching
  const { data: overview, isError, error, isFetching } = useDashboardOverview();

  // Chart data from API
  const { data: timelineData, isLoading: isTimelineLoading } =
    useTimelineData();
  const { data: distributionData, isLoading: isDistributionLoading } =
    useDistributionData();

  // Performance optimization with useDeferredValue
  const deferredOverview = useDeferredValue(overview);

  // Create widgets configuration based on data
  const baseWidgets = useMemo(() => {
    return createDashboardWidgets(
      deferredOverview,
      timelineData || [],
      distributionData || []
    );
  }, [deferredOverview, timelineData, distributionData]);

  // Apply mode and layout filters to widgets
  const finalWidgets = useMemo(() => {
    const modeFilteredWidgets = getWidgetsForMode(baseWidgets, dashboardMode);
    return getWidgetsForLayout(modeFilteredWidgets, dashboardLayout);
  }, [baseWidgets, dashboardMode, dashboardLayout]);

  // Mutation for refresh
  const refreshMutation = useRefreshDashboard({
    onMutate: () => setIsRefreshing(true),
    onSettled: () => setIsRefreshing(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });

  // Event handlers
  const handleRefresh = useCallback(() => {
    if (!isRefreshing) {
      refreshMutation.mutate();
    }
  }, [refreshMutation, isRefreshing]);

  // Enhanced event handlers with smart mode coordination
  const handleModeChange = useCallback(
    (newMode: DashboardMode) => {
      startTransition(() => {
        setDashboardMode(newMode);

        // Smart mode transitions - используем ref для актуальных значений
        if (newMode === "minimal") {
          // Minimal mode works best with list layout and dense density
          setDashboardLayout((currentLayout) => {
            if (currentLayout === "masonry") {
              return "list";
            }
            return currentLayout;
          });
          setDashboardDensity((currentDensity) => {
            if (currentDensity === "comfortable") {
              return "dense";
            }
            return currentDensity;
          });
        } else if (newMode === "fullscreen") {
          // Enter fullscreen mode
          document.documentElement.requestFullscreen?.();
          // Fullscreen mode can use any layout but prefers grid/masonry
          setDashboardLayout((currentLayout) => {
            if (currentLayout === "list" && !isMobileRef.current) {
              return "grid";
            }
            return currentLayout;
          });
        }
      });
    },
    [] // Убираем все зависимости, используем ref-ы и функциональные апдейты
  );

  const handleLayoutChange = useCallback(
    (newLayout: DashboardLayoutType) => {
      startTransition(() => {
        setDashboardLayout(newLayout);
        // Sync with legacy layout mode
        if (newLayout === "grid") {
          setLayoutMode("grid");
        } else if (newLayout === "list") {
          setLayoutMode("list");
        }
      });
    },
    [] // Убираем зависимости для стабильности
  );

  const handleDensityChange = useCallback(
    (newDensity: DashboardDensity) => {
      startTransition(() => {
        setDashboardDensity(newDensity);
      });
    },
    []
  );

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }, []); // Убираем isFullscreen из зависимостей, будем полагаться на браузерные события

  // Show minimal loading if not mounted to prevent Fade errors
  if (!isMounted) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            opacity: 0.7,
          }}
        >
          <CircularProgress size={40} thickness={4} />
        </Box>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            {(error as any)?.message ||
              t("dashboard.error", "Failed to load dashboard data")}
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  // Loading state with better UX
  if (isFetching && !deferredOverview) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            gap: 2,
          }}
        >
          <CircularProgress size={48} thickness={4} />
          <Box
            sx={{ color: theme.palette.text.secondary, textAlign: "center" }}
          >
            {t("dashboard.loading", "Loading dashboard...")}
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Fixed Header at Top */}
      <DashboardHeader
        isRefreshing={isRefreshing || isFetching}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area with Sidebar */}
      <Box
        className={className}
        sx={{
          display: "flex",
          gap: 3,
          flex: 1,
          minHeight: 0, // Important for flex children
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Main Content Container (Left) */}
        <DashboardContainer
          mode={dashboardMode}
          layout={dashboardLayout}
          density={dashboardDensity}
          isFullscreen={isFullscreen}
          maxWidth={false} // Don't constrain width in new layout
        >
          {/* New Unified Layout System */}
          <DashboardLayoutRenderer
            mode={dashboardMode}
            layout={dashboardLayout}
            density={dashboardDensity}
            widgets={finalWidgets}
            isLoading={isFetching || isTimelineLoading || isDistributionLoading}
            onWidgetClick={(widgetId) => {
              console.log("Widget clicked:", widgetId);
              // Add widget-specific actions here
            }}
            onLayoutChange={handleLayoutChange}
          />
        </DashboardContainer>

        {/* Control Sidebar (Right) - Hidden on mobile/tablet */}
        <DashboardSidebar
          mode={dashboardMode}
          layout={dashboardLayout}
          density={dashboardDensity}
          collapsed={sidebarCollapsed}
          isFullscreen={isFullscreen}
          onModeChange={handleModeChange}
          onLayoutChange={handleLayoutChange}
          onDensityChange={handleDensityChange}
          onToggleCollapse={handleToggleCollapse}
          onFullscreenToggle={handleFullscreenToggle}
        />
      </Box>

      {/* Auth Debug Panel for Development */}
      {process.env.NODE_ENV === "development" && <AuthDebugPanel />}
    </DashboardLayout>
  );
};

export const DashboardPageWithSuspense = () => (
  <DashboardErrorBoundary>
    <Suspense
      fallback={
        <DashboardLayout>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <CircularProgress size={48} thickness={4} />
          </Box>
        </DashboardLayout>
      }
    >
      <DashboardPage />
    </Suspense>
  </DashboardErrorBoundary>
);

export default memo(DashboardPageWithSuspense);
