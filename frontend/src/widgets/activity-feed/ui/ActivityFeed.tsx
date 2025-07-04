import React, { useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
import {
  Timeline,
  Refresh,
  FilterList,
  ChevronRight,
  Assignment,
  BugReport,
  RocketLaunch,
  Person,
  Settings,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

// Using features according to FSD
import { useDashboard } from "@/features/dashboard";
import { dashboardKeys } from "@/features/dashboard/model/dashboard.hooks";

// Using shared utilities
import { formatDate } from "@/shared/utils";
import { LoadingSpinner } from "@/shared/ui";

// Using entities for types
import type { DashboardActivity } from "@/features/dashboard/api/dashboard.api";

// Widget props from types
import type { ActivityFeedProps } from "../../types";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "requirement":
      return <Assignment />;
    case "project":
      return <RocketLaunch />;
    case "test":
      return <BugReport />;
    case "user":
      return <Person />;
    default:
      return <Settings />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "requirement":
      return "primary";
    case "project":
      return "success";
    case "test":
      return "warning";
    case "user":
      return "info";
    default:
      return "default";
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 10,
  showFilters = true,
  className,
  onActivityClick,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { activity, isLoading, error } = useDashboard();
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activity : activity.slice(0, limit);

  const handleActivityClick = (activityItem: DashboardActivity) => {
    if (onActivityClick) {
      onActivityClick(activityItem.id);
    }
  };

  const refreshActivity = () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.activity() });
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="error" variant="body2">
            Error loading activity
          </Typography>
          <Button onClick={refreshActivity} size="small" sx={{ mt: 1 }}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Timeline sx={{ color: "white", fontSize: 20 }} />
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Recent Activity
          </Typography>
        }
        action={
          <Box display="flex" gap={1}>
            {showFilters && (
              <IconButton size="small" sx={{ opacity: 0.7 }}>
                <FilterList />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={refreshActivity}
              disabled={isLoading}
            >
              <Refresh />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ flex: 1, pt: 0, overflow: "hidden" }}>
        {isLoading ? (
          <LoadingSpinner
            variant="skeleton"
            skeletonCount={5}
            skeletonHeight={60}
          />
        ) : displayedActivities.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
            color="text.secondary"
          >
            <Timeline sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
            <Typography variant="body2">No recent activity</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, maxHeight: 400, overflow: "auto" }}>
            {displayedActivities.map((activityItem, index) => (
              <ListItem
                key={activityItem.id}
                onClick={() => handleActivityClick(activityItem)}
                sx={{
                  cursor: onActivityClick ? "pointer" : "default",
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": onActivityClick
                    ? {
                        backgroundColor: alpha(theme.palette.action.hover, 0.5),
                      }
                    : {},
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: `${getActivityColor(activityItem.type)}.light`,
                      color: `${getActivityColor(activityItem.type)}.main`,
                    }}
                  >
                    {getActivityIcon(activityItem.type)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, flex: 1 }}
                      >
                        {activityItem.title}
                      </Typography>
                      <Chip
                        label={activityItem.type}
                        size="small"
                        color={getActivityColor(activityItem.type) as any}
                        variant="outlined"
                        sx={{
                          fontSize: "0.7rem",
                          height: 20,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        by {activityItem.user_name} •{" "}
                        {formatDate(activityItem.created_at)}
                      </Typography>
                      {activityItem.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {activityItem.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />

                {onActivityClick && (
                  <ChevronRight
                    sx={{ color: "text.secondary", opacity: 0.5 }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}

        {!isLoading &&
          displayedActivities.length > 0 &&
          !showAll &&
          activity.length > limit && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                size="small"
                onClick={() => setShowAll(true)}
                sx={{ textTransform: "none" }}
              >
                Show more activity
              </Button>
            </Box>
          )}
      </CardContent>
    </Card>
  );
};
