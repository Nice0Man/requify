import { memo, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Stack,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Refresh,
  Search,
  Person,
  Business,
  Assignment,
  CheckCircle,
  Timeline,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import {
  DashboardWidgetWrapper,
  type WidgetConfig,
  type DashboardMode,
  type DashboardLayout,
  type DashboardDensity,
} from "@/shared/ui";
import {
  useActivityFeedWithFilters,
  useDashboardActivity,
} from "@/features/dashboard";
import type { ActivityFilters } from "@/entities/dashboard";
import { useDebounced } from "@/shared/hooks/usePerformanceOptimizations";

// Safe activity item type with all fields optional
interface SafeActivityItem {
  id?: string | number;
  type?: string;
  title?: string;
  description?: string;
  user?: {
    id?: string | number;
    name?: string;
    avatar?: string;
  };
  timestamp?: string;
  status?: string;
  projectId?: string | number;
  metadata?: Record<string, any>;
}

// Props interface
interface ActivityFeedWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;

  // Feature-specific props
  maxItems?: number;
  infiniteScroll?: boolean;
  showFilters?: boolean;
  title?: string;
  emptyMessage?: string;
  refreshable?: boolean;
  externalFilters?: Partial<ActivityFilters>;

  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

// Safe data transformation function
const transformActivityData = (rawData: any): SafeActivityItem[] => {
  if (!rawData) return [];

  // Handle infinite query data
  if (rawData.pages && Array.isArray(rawData.pages)) {
    return rawData.pages
      .filter((page: any) => page && typeof page === "object")
      .flatMap((page: any) => {
        const items = page.items || page.data || page.activities || [];
        return Array.isArray(items) ? items : [];
      })
      .filter((item: any) => item && typeof item === "object")
      .map(transformSingleItem);
  }

  // Handle regular query data
  if (rawData.items && Array.isArray(rawData.items)) {
    return rawData.items
      .filter((item: any) => item && typeof item === "object")
      .map(transformSingleItem);
  }

  // Handle direct array
  if (Array.isArray(rawData)) {
    return rawData
      .filter((item: any) => item && typeof item === "object")
      .map(transformSingleItem);
  }

  return [];
};

// Transform single activity item safely
const transformSingleItem = (item: any): SafeActivityItem => {
  if (!item || typeof item !== "object") {
    return { id: Math.random(), title: "Unknown Activity", type: "unknown" };
  }

  return {
    id: item.id || item._id || Math.random(),
    type: typeof item.type === "string" ? item.type : "unknown",
    title: typeof item.title === "string" ? item.title : "Untitled Activity",
    description: typeof item.description === "string" ? item.description : "",
    user:
      item.user && typeof item.user === "object"
        ? {
            id: item.user.id || item.user._id,
            name:
              typeof item.user.name === "string"
                ? item.user.name
                : "Unknown User",
            avatar:
              typeof item.user.avatar === "string"
                ? item.user.avatar
                : undefined,
          }
        : undefined,
    timestamp:
      typeof item.timestamp === "string"
        ? item.timestamp
        : typeof item.createdAt === "string"
        ? item.createdAt
        : new Date().toISOString(),
    status: typeof item.status === "string" ? item.status : "active",
    projectId: item.projectId || item.project_id,
    metadata:
      item.metadata && typeof item.metadata === "object" ? item.metadata : {},
  };
};

// Loading skeleton component
const ActivitySkeleton = memo(() => (
  <Box display="flex" alignItems="center" gap={1} py={0.5}>
    <Skeleton variant="circular" width={24} height={24} />
    <Skeleton variant="text" width="60%" />
  </Box>
));

// Activity item component
const ActivityItemComponent = memo<{ item: SafeActivityItem }>(({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case "user":
        return <Person />;
      case "project":
        return <Business />;
      case "requirement":
        return <Assignment />;
      case "completed":
        return <CheckCircle />;
      default:
        return <Person />;
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1} py={0.5}>
      <Avatar src={item.user?.avatar}>
        {item.user?.name?.[0] || getIcon()}
      </Avatar>
      <Box flexGrow={1}>
        <Typography variant="body2" fontWeight="medium">
          {item.title}
        </Typography>
        {item.description && (
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {item.user?.name && `${item.user.name} • `}
          {formatTimestamp(item.timestamp)}
        </Typography>
      </Box>
      {item.status && (
        <Chip
          label={item.status}
          size="small"
          color={item.status === "completed" ? "success" : "default"}
        />
      )}
    </Box>
  );
});

// Конфигурация виджета для разных режимов дашборда
const activityFeedWidgetConfig: WidgetConfig = {
  id: "activity-feed-widget",
  title: i18n.t("dashboard.widgets.activity.title", "Последняя активность"),
  description: i18n.t("dashboard.widgets.activity.description", "Лента активности и событий системы"),
  icon: Timeline,

  // Настройки по умолчанию
  defaultSize: "medium",
  defaultPriority: "normal",
  defaultAspectRatio: "tall",

  // Режимы дашборда
  modes: {
    minimal: {
      size: "small",
      visible: false, // Скрыт в минимальном режиме
      priority: "low",
    },
    compact: {
      size: "medium",
      visible: true,
      priority: "normal",
      aspectRatio: "square",
      spacing: { padding: "16px" },
    },
    detailed: {
      size: "large",
      visible: true,
      priority: "normal",
      aspectRatio: "tall",
      spacing: { padding: "20px" },
    },
    fullscreen: {
      size: "xlarge",
      visible: true,
      priority: "high",
      aspectRatio: "tall",
      spacing: { padding: "24px" },
    },
  },

  // Лейауты
  layouts: {
    grid: {
      aspectRatio: "tall",
      minHeight: "300px",
      maxHeight: "500px",
    },
    list: {
      size: "medium",
      aspectRatio: "wide",
      minHeight: "200px",
      maxHeight: "300px",
    },
    masonry: {
      size: "auto",
      aspectRatio: "auto",
      minHeight: "280px",
    },
  },

  // Стили
  border: true,
  shadow: true,
  borderRadius: 12,

  // Поведение
  collapsible: true,
  resizable: false,
  draggable: false,

  // Производительность
  lazy: true,
  virtualizeContent: false,
};

// Main component
export const ActivityFeedWidget = memo<ActivityFeedWidgetProps>(
  ({
    mode,
    layout,
    density,
    maxItems = 10,
    infiniteScroll = false,
    showFilters = true,
    title = "Recent Activity",
    emptyMessage = "No recent activity",
    refreshable = true,
    externalFilters,
    className,
    loading: externalLoading = false,
    error: externalError,
    onResize,
    onCollapse,
  }) => {
    // Адаптируем настройки на основе dashboard mode и density
    const adaptedMaxItems = useMemo(() => {
      if (mode === "minimal") return 3;
      if (mode === "compact") return 5;
      if (density === "dense") return Math.min(maxItems, 8);
      if (layout === "list") return Math.min(maxItems, 12);
      return maxItems;
    }, [mode, density, layout, maxItems]);

    const adaptedShowFilters = useMemo(() => {
      if (mode === "minimal" || density === "dense") return false;
      return showFilters;
    }, [mode, density, showFilters]);

    const adaptedInfiniteScroll = useMemo(() => {
      if (mode === "minimal" || layout === "list") return false;
      return infiniteScroll;
    }, [mode, layout, infiniteScroll]);

    // Local state
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Debounced search
    const debouncedSearch = useDebounced(searchTerm, 300);

    // Combine filters safely
    const combinedFilters = useMemo(() => {
      const filters: ActivityFilters = {
        ...externalFilters,
        limit: adaptedInfiniteScroll ? undefined : adaptedMaxItems,
      };

      // Note: ActivityFilters doesn't have search property
      // Search will be handled client-side in the component

      if (typeFilter !== "all") {
        // Convert string to ActivityType array
        filters.type = [typeFilter as any];
      }

      if (statusFilter !== "all") {
        // Convert string to ActivityStatus array
        filters.status = [statusFilter as any];
      }

      return filters;
    }, [
      externalFilters,
      typeFilter,
      statusFilter,
      adaptedInfiniteScroll,
      adaptedMaxItems,
    ]);

    // Fetch data with safe error handling
    const infiniteQuery = useActivityFeedWithFilters(
      adaptedInfiniteScroll ? combinedFilters : undefined
    );
    const regularQuery = useDashboardActivity(
      !adaptedInfiniteScroll ? combinedFilters : undefined
    );

    // Choose appropriate query result
    const queryResult = adaptedInfiniteScroll ? infiniteQuery : regularQuery;

    const {
      data: rawData,
      isLoading,
      error,
      isError,
      refetch,
      isFetching,
    } = queryResult || {};

    // Transform data safely and apply client-side filtering
    const activities = useMemo(() => {
      try {
        let items = transformActivityData(rawData);

        // Apply client-side search filter
        if (debouncedSearch && debouncedSearch.trim()) {
          const searchTerm = debouncedSearch.toLowerCase();
          items = items.filter(
            (item) =>
              item.title?.toLowerCase().includes(searchTerm) ||
              item.description?.toLowerCase().includes(searchTerm) ||
              item.user?.name?.toLowerCase().includes(searchTerm)
          );
        }

        return items;
      } catch (err) {
        console.error("Error transforming activity data:", err);
        return [];
      }
    }, [rawData, debouncedSearch]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
      if (refetch && typeof refetch === "function") {
        refetch();
      }
    }, [refetch]);

    // Handle load more for infinite scroll
    const handleLoadMore = useCallback(() => {
      if (
        infiniteScroll &&
        infiniteQuery?.fetchNextPage &&
        infiniteQuery?.hasNextPage
      ) {
        infiniteQuery.fetchNextPage();
      }
    }, [infiniteScroll, infiniteQuery]);

    return (
      <DashboardWidgetWrapper
        config={activityFeedWidgetConfig}
        mode={mode}
        layout={layout}
        density={density}
        className={className}
        loading={externalLoading || isLoading}
        error={externalError || (isError ? error : undefined)}
        onResize={onResize}
        onCollapse={onCollapse}
        aria-label="Виджет активности дашборда"
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {refreshable && (
                          <IconButton
                onClick={handleRefresh}
                disabled={isLoading || isFetching}
                size="small"
              >
                <Refresh />
              </IconButton>
          )}
        </Box>

        {/* Filters */}
        {adaptedShowFilters && (
          <Box mb={2}>
            <Stack direction="row" spacing={2}>
              <Box flexGrow={1}>
                <Box
                  position="relative"
                  sx={{
                    "& .MuiInputBase-root": {
                      paddingRight: "32px", // Adjust for icon
                    },
                  }}
                >
                  <Search
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "text.secondary",
                    }}
                  />
                  <input
                    type="text"
                    placeholder={i18n.t("dashboard.activity.searchPlaceholder", "Поиск активности...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingRight: "32px" }}
                  />
                </Box>
              </Box>
              <Box>
                <Chip
                  label={i18n.t("common.type", "Тип")}
                  clickable
                  variant="outlined"
                  size="small"
                />
                <Menu
                  anchorEl={null}
                  open={false} // Placeholder for menu state
                  onClose={() => {}}
                >
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.all", "Все")}
                  </MenuItem>
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.users", "Пользователи")}
                  </MenuItem>
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.projects", "Проекты")}
                  </MenuItem>
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.requirements", "Требования")}
                  </MenuItem>
                </Menu>
              </Box>
              <Box>
                <Chip
                  label={i18n.t("common.status", "Статус")}
                  clickable
                  variant="outlined"
                  size="small"
                />
                <Menu
                  anchorEl={null}
                  open={false} // Placeholder for menu state
                  onClose={() => {}}
                >
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.all", "Все")}
                  </MenuItem>
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.active", "Активные")}
                  </MenuItem>
                  <MenuItem onClick={() => {}}>
                    {i18n.t("common.completed", "Завершенные")}
                  </MenuItem>
                </Menu>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Content */}
        {activities.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : (
          <>
            <Stack spacing={1}>
              {activities.slice(0, adaptedMaxItems).map((activity) => (
                <ActivityItemComponent key={activity.id} item={activity} />
              ))}
            </Stack>

            {/* Load more button for infinite scroll */}
            {adaptedInfiniteScroll && infiniteQuery?.hasNextPage && (
              <Box textAlign="center" mt={2}>
                <IconButton
                  onClick={handleLoadMore}
                  disabled={infiniteQuery?.isFetchingNextPage}
                  size="small"
                >
                  {infiniteQuery?.isFetchingNextPage ? (
                    <Skeleton variant="circular" width={24} height={24} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Box>
            )}
          </>
        )}
      </DashboardWidgetWrapper>
    );
  }
);

ActivityFeedWidget.displayName = "ActivityFeedWidget";
ActivityItemComponent.displayName = "ActivityItemComponent";

export default ActivityFeedWidget;
