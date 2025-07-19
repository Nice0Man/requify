import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Fade,
  Divider,
  Collapse,
  TextField,
  InputAdornment,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import {
  Refresh,
  FilterList,
  ExpandMore,
  ExpandLess,
  Search,
  ClearAll,
  Timeline,
  ViewList,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTheme as useThemeMode,
  useLoadingState,
} from "@/shared/contexts/PerformanceContext";
import {
  useRenderTracker,
  usePerformanceMeasure,
  useDebounced,
} from "@/shared/hooks/usePerformanceOptimizations";
import i18n from "@/shared/lib/i18n";

import {
  type ActivityItem as ActivityItemType,
  type ActivityFilters,
  ActivityType,
  ActivityStatus,
  Priority,
} from "@/entities/dashboard";
import { ActivityItem } from "@/entities/dashboard/ui/ActivityItem";
import {
  useActivityFeedWithFilters,
  useRecentActivity,
  dashboardQueryKeys,
} from "@/features/dashboard/model/queries";

interface ActivityFeedWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  maxItems?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  showHeader?: boolean;
  showLoadMore?: boolean;
  infiniteScroll?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: ActivityFilters;
  onActivityClick?: (activity: ActivityItemType) => void;
  className?: string;
}

export const ActivityFeedWidget = memo<ActivityFeedWidgetProps>(
  ({
    variant = "detailed",
    maxItems = 10,
    showFilters = true,
    showSearch = true,
    showHeader = true,
    showLoadMore = false,
    infiniteScroll = false,
    autoRefresh = false,
    refreshInterval = 30000,
    filters: externalFilters,
    onActivityClick,
    className,
  }) => {
    // Performance monitoring
    useRenderTracker("ActivityFeedWidget");
    usePerformanceMeasure("ActivityFeedWidget");

    // Hooks and services
    const t = i18n.t;
    const muiTheme = useTheme();
    const uthemeMode = useThemeMode();
    const { isLoading: globalLoading } = useLoadingState();
    const queryClient = useQueryClient();

    // Context7 Design System - 8px grid spacing
    const spacing = useMemo(
      () => ({
        xs: 8, // 8px
        sm: 16, // 16px
        md: 24, // 24px
        lg: 32, // 32px
        xl: 40, // 40px
        xxl: 48, // 48px
      }),
      []
    );

    // Context7 Animation System
    const animations = useMemo(
      () => ({
        fast: {
          duration: 150,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        },
        standard: {
          duration: 300,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        },
        complex: {
          duration: 500,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        },
        entrance: {
          duration: 400,
          easing: "cubic-bezier(0.0, 0.0, 0.2, 1)",
        },
      }),
      []
    );

    // Context7 Color System
    const colors = useMemo(
      () => ({
        surface: {
          primary: muiTheme.palette.background.paper,
          secondary: alpha(muiTheme.palette.background.paper, 0.6),
          elevated: alpha(muiTheme.palette.background.paper, 0.9),
        },
        accent: {
          primary: muiTheme.palette.primary.main,
          secondary: muiTheme.palette.secondary.main,
          success: muiTheme.palette.success.main,
          warning: muiTheme.palette.warning.main,
          error: muiTheme.palette.error.main,
          info: muiTheme.palette.info.main,
        },
        elevation: {
          subtle: `0 2px 8px ${alpha(muiTheme.palette.common.black, 0.04)}`,
          medium: `0 4px 16px ${alpha(muiTheme.palette.common.black, 0.08)}`,
          high: `0 8px 32px ${alpha(muiTheme.palette.common.black, 0.12)}`,
          extreme: `0 16px 64px ${alpha(muiTheme.palette.common.black, 0.16)}`,
        },
      }),
      [muiTheme.palette]
    );

    // Responsive breakpoints for Context7
    const isCompact = variant === "compact" || variant === "minimal";

    // Local state with optimized handling
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [localFilters, setLocalFilters] = useState<ActivityFilters>({});
    const [filterMenuAnchor, setFilterMenuAnchor] =
      useState<null | HTMLElement>(null);
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

    // Debounced search for better performance
    const debouncedSearchQuery = useDebounced(searchQuery, 300);

    // Combine external and local filters
    const combinedFilters = useMemo(
      () => ({
        ...externalFilters,
        ...localFilters,
        limit: infiniteScroll ? undefined : maxItems,
      }),
      [externalFilters, localFilters, infiniteScroll, maxItems]
    );

    // Queries - always call hooks in the same order
    const infiniteQueryResult = useActivityFeedWithFilters(combinedFilters);
    const regularQueryResult = useRecentActivity(combinedFilters);

    // Choose which result to use based on infiniteScroll prop
    const queryResult = infiniteScroll
      ? infiniteQueryResult
      : regularQueryResult;

    const {
      data: rawData,
      isLoading,
      error,
      isError,
      refetch,
      isFetching,
    } = queryResult;

    // Normalize data to always be an array
    const activities = useMemo((): ActivityItemType[] => {
      try {
        if (!rawData) return [];

        if (infiniteScroll) {
          // For infinite query, flatten pages
          const infiniteData = rawData as any;
          const pages = infiniteData?.pages;

          if (!pages || !Array.isArray(pages)) {
            console.warn(
              "ActivityFeedWidget: Invalid pages structure in infinite query"
            );
            return [];
          }

          return pages.flatMap((page: any) => {
            if (!page || typeof page !== "object") return [];

            // Handle different response structures
            const pageData = page.data || page;
            if (!Array.isArray(pageData)) return [];

            return pageData.filter(
              (item: any) => item && typeof item === "object"
            );
          });
        }

        // For regular query, data is already an array
        if (!Array.isArray(rawData)) {
          console.warn(
            "ActivityFeedWidget: Invalid data structure in regular query"
          );
          return [];
        }

        return (rawData as ActivityItemType[]).filter(
          (item: any) => item && typeof item === "object"
        );
      } catch (error) {
        console.error(
          "ActivityFeedWidget: Error processing activities data:",
          error
        );
        return [];
      }
    }, [rawData, infiniteScroll]);

    // Auto refresh
    React.useEffect(() => {
      if (!autoRefresh || !refreshInterval) return;

      const interval = setInterval(() => {
        refetch();
      }, refreshInterval);

      return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, refetch]);

    // Filter activities by debounced search query for performance
    const filteredActivities = useMemo(() => {
      // Ensure activities is always an array
      const safeActivities = Array.isArray(activities) ? activities : [];

      if (!debouncedSearchQuery.trim()) return safeActivities;

      const query = debouncedSearchQuery.toLowerCase();
      return safeActivities.filter(
        (activity) =>
          activity?.title?.toLowerCase().includes(query) ||
          activity?.description?.toLowerCase().includes(query) ||
          activity?.userName?.toLowerCase().includes(query)
      );
    }, [activities, debouncedSearchQuery]);

    // Optimized event handlers with memoization
    const handleRefresh = useCallback(() => {
      startTransition(() => {
        refetch();
        // Инвалидируем кэш для более полного обновления
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.activity(),
        });
      });
    }, [refetch, queryClient]);

    const handleToggleExpanded = useCallback(() => {
      startTransition(() => {
        setIsExpanded((prev) => !prev);
      });
    }, []);

    const handleFilterMenuOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        setFilterMenuAnchor(event.currentTarget);
      },
      []
    );

    const handleFilterMenuClose = useCallback(() => {
      setFilterMenuAnchor(null);
    }, []);

    const handleFilterChange = useCallback(
      (key: keyof ActivityFilters, value: any) => {
        setLocalFilters((prev) => ({
          ...prev,
          [key]: value,
        }));
        handleFilterMenuClose();
      },
      [handleFilterMenuClose]
    );

    const handleClearFilters = useCallback(() => {
      setLocalFilters({});
      setSearchQuery("");
      handleFilterMenuClose();
    }, [handleFilterMenuClose]);

    const handleSearchChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
      },
      []
    );

    // Filter stats
    const filterStats = useMemo(() => {
      const hasFilters =
        Object.keys(localFilters).length > 0 || searchQuery.trim().length > 0;
      const activeFiltersCount =
        Object.values(localFilters).filter(Boolean).length;

      return { hasFilters, activeFiltersCount };
    }, [localFilters, searchQuery]);

    // Context7 Loading States
    if (isLoading) {
      return (
        <Card
          className={className}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
            boxShadow: `0 2px 20px ${alpha(
              muiTheme.palette.common.black,
              0.04
            )}`,
            background: muiTheme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          {showHeader && (
            <CardHeader
              avatar={
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Timeline sx={{ color: "white", fontSize: 20 }} />
                </Box>
              }
              title={
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  {t("dashboard.recentActivity")}
                </Typography>
              }
              action={
                <IconButton
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
                    "&:hover": {
                      backgroundColor: alpha(
                        muiTheme.palette.primary.main,
                        0.04
                      ),
                      borderColor: alpha(muiTheme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              }
              sx={{ pb: 1 }}
            />
          )}

          <CardContent sx={{ pt: showHeader ? 0 : 3 }}>
            <Stack spacing={2}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(
                      muiTheme.palette.divider,
                      0.08
                    )}`,
                    background: muiTheme.palette.background.paper,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton
                      variant="circular"
                      width={isCompact ? 32 : 40}
                      height={isCompact ? 32 : 40}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={16}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Skeleton variant="text" width={60} height={16} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      );
    }

    // Context7 Error State
    if (isError) {
      return (
        <Card
          className={className}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
            boxShadow: `0 2px 20px ${alpha(
              muiTheme.palette.common.black,
              0.04
            )}`,
            background: muiTheme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2} alignItems="center">
              <Timeline
                sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3 }}
              />
              <Typography color="error" variant="body2" textAlign="center">
                {t("errors.loadingError")}:{" "}
                {error?.message || "Неизвестная ошибка"}
              </Typography>
              <Button
                onClick={handleRefresh}
                size="small"
                variant="outlined"
                sx={{ textTransform: "none" }}
                disabled={isFetching}
              >
                {t("common.retry", "Try Again")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
          boxShadow: `0 2px 20px ${alpha(muiTheme.palette.common.black, 0.04)}`,
          background: muiTheme.palette.background.paper,
          overflow: "hidden",
        }}
      >
        {/* Context7 Modern Header */}
        {showHeader && (
          <CardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Timeline sx={{ color: "white", fontSize: 20 }} />
              </Box>
            }
            title={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  {t("dashboard.recentActivity")}
                </Typography>
                {filterStats.hasFilters && (
                  <Chip
                    label={filterStats.activeFiltersCount}
                    size="small"
                    color="primary"
                    sx={{ fontSize: "0.7rem", height: 20 }}
                  />
                )}
              </Box>
            }
            action={
              <Stack direction="row" spacing={1}>
                {/* View mode toggle */}
                <Tooltip
                  title={viewMode === "list" ? "Timeline view" : "List view"}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      setViewMode((prev) =>
                        prev === "list" ? "timeline" : "list"
                      )
                    }
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.1
                      )}`,
                      "&:hover": {
                        backgroundColor: alpha(
                          muiTheme.palette.primary.main,
                          0.04
                        ),
                        borderColor: alpha(muiTheme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    {viewMode === "list" ? <Timeline /> : <ViewList />}
                  </IconButton>
                </Tooltip>

                {/* Filters */}
                {showFilters && (
                  <Tooltip title={t("common.filters")}>
                    <IconButton
                      size="small"
                      onClick={handleFilterMenuOpen}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          muiTheme.palette.divider,
                          0.1
                        )}`,
                        "&:hover": {
                          backgroundColor: alpha(
                            muiTheme.palette.primary.main,
                            0.04
                          ),
                          borderColor: alpha(
                            muiTheme.palette.primary.main,
                            0.2
                          ),
                        },
                        ...(filterStats.hasFilters && {
                          backgroundColor: alpha(
                            muiTheme.palette.primary.main,
                            0.04
                          ),
                          borderColor: alpha(
                            muiTheme.palette.primary.main,
                            0.2
                          ),
                        }),
                      }}
                    >
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Refresh */}
                <Tooltip title={t("common.refresh")}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleRefresh}
                      disabled={isFetching}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          muiTheme.palette.divider,
                          0.1
                        )}`,
                        "&:hover": {
                          backgroundColor: alpha(
                            muiTheme.palette.primary.main,
                            0.04
                          ),
                          borderColor: alpha(
                            muiTheme.palette.primary.main,
                            0.2
                          ),
                        },
                      }}
                    >
                      <Refresh 
                        sx={{
                          ...(isFetching && {
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": {
                              "0%": { transform: "rotate(0deg)" },
                              "100%": { transform: "rotate(360deg)" },
                            },
                          }),
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Expand/Collapse */}
                <Tooltip
                  title={isExpanded ? t("common.collapse") : t("common.expand")}
                >
                  <IconButton
                    size="small"
                    onClick={handleToggleExpanded}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.1
                      )}`,
                      "&:hover": {
                        backgroundColor: alpha(
                          muiTheme.palette.primary.main,
                          0.04
                        ),
                        borderColor: alpha(muiTheme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Tooltip>
              </Stack>
            }
            sx={{ pb: 1 }}
          />
        )}

        <CardContent sx={{ pt: showHeader ? 0 : 3 }}>
          {/* Context7 Enhanced Search */}
          {showSearch && isExpanded && (
            <Box mb={2}>
              <TextField
                size="small"
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(muiTheme.palette.primary.main, 0.3),
                      },
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: muiTheme.palette.primary.main,
                      },
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* Context7 Enhanced Content */}
          <Collapse in={isExpanded} timeout={300}>
            {filteredActivities.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: muiTheme.palette.text.secondary,
                }}
              >
                <Timeline sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                <Typography variant="body2">
                  {searchQuery
                    ? t("common.noSearchResults")
                    : t("dashboard.noActivity")}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {filteredActivities.map((activity, index) => (
                  <Fade
                    key={activity.id}
                    in
                    timeout={400}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          muiTheme.palette.divider,
                          0.05
                        )}`,
                        background: muiTheme.palette.background.paper,
                        transition: "all 0.2s ease-in-out",
                        cursor: onActivityClick ? "pointer" : "default",
                        "&:hover": onActivityClick
                          ? {
                              boxShadow: muiTheme.shadows[4],
                              transform: "translateY(-2px)",
                              borderColor: alpha(
                                muiTheme.palette.primary.main,
                                0.2
                              ),
                            }
                          : {},
                      }}
                      onClick={() => onActivityClick?.(activity)}
                    >
                      <ActivityItem
                        activity={activity}
                        variant={variant}
                        onClick={onActivityClick}
                        showAvatar={variant !== "minimal"}
                        showStatus={variant === "detailed"}
                        showPriority={variant === "detailed"}
                      />
                    </Box>
                  </Fade>
                ))}

                {/* Load more button */}
                {showLoadMore && filteredActivities.length >= maxItems && (
                  <Box textAlign="center" mt={2}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        /* TODO: Implement load more */
                      }}
                      disabled={isFetching}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      {t("common.loadMore", "Загрузить ещё")}
                    </Button>
                  </Box>
                )}
              </Stack>
            )}
          </Collapse>
        </CardContent>

        {/* Context7 Enhanced Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={handleFilterMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
              boxShadow: muiTheme.shadows[8],
              minWidth: 200,
            },
          }}
        >
          {[
            {
              label: "Проекты",
              value: [ActivityType.PROJECT_CREATED],
              key: "type",
            },
            {
              label: "Требования",
              value: [ActivityType.REQUIREMENT_CREATED],
              key: "type",
            },
            {
              label: "Релизы",
              value: [ActivityType.RELEASE_CREATED],
              key: "type",
            },
            {
              label: "Завершённые",
              value: [ActivityStatus.COMPLETED],
              key: "status",
            },
            {
              label: "Высокий приоритет",
              value: [Priority.HIGH],
              key: "priority",
            },
          ].map((filter, index) => (
            <MenuItem
              key={index}
              onClick={() =>
                handleFilterChange(
                  filter.key as keyof ActivityFilters,
                  filter.value
                )
              }
              sx={{
                "&:hover": {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemText>{filter.label}</ListItemText>
            </MenuItem>
          ))}

          <Divider />

          <MenuItem onClick={handleClearFilters}>
            <ListItemIcon>
              <ClearAll fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {t("common.clearFilters", "Очистить фильтры")}
            </ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    );
  }
);

ActivityFeedWidget.displayName = "ActivityFeedWidget";
