import React, { memo, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  Refresh,
  FilterList,
  Search,
  Person,
  Business,
  Assignment,
  CheckCircle,
} from "@mui/icons-material";
import {
  useActivityFeedWithFilters,
  useDashboardActivity,
} from "@/features/dashboard";
import type { ActivityItem, ActivityFilters } from "@/entities/dashboard";
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
  maxItems?: number;
  infiniteScroll?: boolean;
  showFilters?: boolean;
  className?: string;
  title?: string;
  emptyMessage?: string;
  refreshable?: boolean;
  externalFilters?: Partial<ActivityFilters>;
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
  <List>
    {Array.from({ length: 5 }, (_, index) => (
      <ListItem key={index}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" />}
          secondary={<Skeleton variant="text" width="80%" />}
        />
      </ListItem>
    ))}
  </List>
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
    <ListItem divider>
      <ListItemAvatar>
        <Avatar src={item.user?.avatar}>
          {item.user?.name?.[0] || getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box component="span" display="flex" alignItems="center" gap={1}>
            <Typography component="span" variant="body2" fontWeight="medium">
              {item.title}
            </Typography>
            {item.status && (
              <Chip
                label={item.status}
                size="small"
                color={item.status === "completed" ? "success" : "default"}
              />
            )}
          </Box>
        }
        secondary={
          <Box component="span" display="block">
            {item.description && (
              <Typography component="span" variant="body2" color="text.secondary" display="block">
                {item.description}
              </Typography>
            )}
            <Typography component="span" variant="caption" color="text.secondary" display="block">
              {item.user?.name && `${item.user.name} • `}
              {formatTimestamp(item.timestamp)}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
});

// Main component
export const ActivityFeedWidget = memo<ActivityFeedWidgetProps>(
  ({
    maxItems = 10,
    infiniteScroll = false,
    showFilters = true,
    className,
    title = "Recent Activity",
    emptyMessage = "No recent activity",
    refreshable = true,
    externalFilters,
  }) => {
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
        limit: infiniteScroll ? undefined : maxItems,
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
    }, [externalFilters, typeFilter, statusFilter, infiniteScroll, maxItems]);

    // Fetch data with safe error handling
    const infiniteQuery = useActivityFeedWithFilters(
      infiniteScroll ? combinedFilters : undefined
    );
    const regularQuery = useDashboardActivity(
      !infiniteScroll ? combinedFilters : undefined
    );

    // Choose appropriate query result
    const queryResult = infiniteScroll ? infiniteQuery : regularQuery;

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

    // Render error state
    if (isError) {
      return (
        <Card className={className}>
          <CardContent>
            <Box textAlign="center" py={3}>
              <Typography color="error" gutterBottom>
                Ошибка загрузки активности
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {error?.message || "Неизвестная ошибка"}
              </Typography>
              {refreshable && (
              <Button
                  startIcon={<Refresh />}
                onClick={handleRefresh}
                  variant="outlined"
                size="small"
              >
                  Повторить
              </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className}>
        <CardContent>
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
              <Button
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={isLoading || isFetching}
                size="small"
              >
                Обновить
              </Button>
                )}
              </Box>

          {/* Filters */}
          {showFilters && (
            <Box mb={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск активности..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search fontSize="small" />,
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Тип</InputLabel>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      label="Тип"
                    >
                      <MenuItem value="all">Все</MenuItem>
                      <MenuItem value="user">Пользователи</MenuItem>
                      <MenuItem value="project">Проекты</MenuItem>
                      <MenuItem value="requirement">Требования</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Статус"
                    >
                      <MenuItem value="all">Все</MenuItem>
                      <MenuItem value="active">Активные</MenuItem>
                      <MenuItem value="completed">Завершенные</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Content */}
          {isLoading ? (
            <ActivitySkeleton />
          ) : activities.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">{emptyMessage}</Typography>
              </Box>
            ) : (
            <>
              <List disablePadding>
                {activities.slice(0, maxItems).map((activity) => (
                  <ActivityItemComponent key={activity.id} item={activity} />
                ))}
              </List>

              {/* Load more button for infinite scroll */}
              {infiniteScroll && infiniteQuery?.hasNextPage && (
                  <Box textAlign="center" mt={2}>
                    <Button
                    onClick={handleLoadMore}
                    disabled={infiniteQuery?.isFetchingNextPage}
                    startIcon={
                      infiniteQuery?.isFetchingNextPage ? (
                        <CircularProgress size={16} />
                      ) : undefined
                    }
                  >
                    {infiniteQuery?.isFetchingNextPage
                      ? "Загрузка..."
                      : "Загрузить ещё"}
                    </Button>
                  </Box>
                )}
            </>
            )}
        </CardContent>
      </Card>
    );
  }
);

ActivityFeedWidget.displayName = "ActivityFeedWidget";
ActivityItemComponent.displayName = "ActivityItemComponent";

export default ActivityFeedWidget;
