import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import {
  Assignment,
  RocketLaunch,
  CheckCircle,
  Person,
  Refresh,
  FilterList,
  BugReport,
  Code,
  Notifications,
  Timeline,
  ChevronRight,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/model/dashboard.hooks";
import { LoadingSpinner } from "@/shared/ui";
import { formatDate } from "@/shared/utils";

interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  className?: string;
  onActivityClick?: (activityId: string) => void;
}

interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  user_name: string;
  created_at: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "user_created":
    case "user_updated":
      return <Person />;
    case "requirement_created":
    case "requirement_updated":
      return <Assignment />;
    case "test_created":
    case "test_executed":
      return <BugReport />;
    case "project_created":
    case "project_updated":
      return <RocketLaunch />;
    case "release_created":
    case "release_published":
      return <Code />;
    case "task_completed":
      return <CheckCircle />;
    default:
      return <Notifications />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "user_created":
    case "user_updated":
      return "primary";
    case "requirement_created":
    case "requirement_updated":
      return "info";
    case "test_created":
    case "test_executed":
      return "warning";
    case "project_created":
    case "project_updated":
      return "secondary";
    case "release_created":
    case "release_published":
      return "success";
    case "task_completed":
      return "success";
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
  const [showAll, setShowAll] = useState(false);

  const {
    data: activity = [],
    isLoading,
    error,
  } = useQuery<DashboardActivity[]>({
    queryKey: dashboardKeys.activity(),
    queryFn: async () => {
      // Mock data for now until real API is implemented
      return [
        {
          id: "1",
          type: "requirement_created",
          title: "New requirement added",
          description: "User authentication requirement has been created",
          user_name: "John Doe",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          type: "project_updated",
          title: "Project updated",
          description: "Project settings have been modified",
          user_name: "Jane Smith",
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
      ] as DashboardActivity[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

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
      <Card className={className} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="center">
            <Timeline
              sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3 }}
            />
            <Typography color="error" variant="body2" textAlign="center">
              Error loading activity
            </Typography>
            <Button
              onClick={refreshActivity}
              size="small"
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Try again
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        borderRadius: 3,
        boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
        overflow: "hidden",
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
          <Stack direction="row" spacing={1}>
            {showFilters && (
              <IconButton
                size="small"
                sx={{
                  opacity: 0.7,
                  borderRadius: 2,
                  "&:hover": { opacity: 1 },
                }}
              >
                <FilterList />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={refreshActivity}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Stack>
        }
        sx={{
          pb: 1,
          "& .MuiCardHeader-content": {
            overflow: "hidden",
          },
        }}
      />

      <Divider sx={{ opacity: 0.5 }} />

      <CardContent sx={{ flex: 1, p: 0, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <LoadingSpinner
              variant="inline"
              size="medium"
              message="Loading activity..."
            />
          </Box>
        ) : displayedActivities.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
            px={3}
            color="text.secondary"
          >
            <Timeline sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
            <Typography variant="body2" textAlign="center">
              No recent activity
            </Typography>
            <Typography variant="caption" textAlign="center" sx={{ mt: 1 }}>
              Activity will appear here when users interact with the system
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {displayedActivities.map((activityItem, index) => (
              <React.Fragment key={activityItem.id}>
                <ListItem
                  onClick={() => handleActivityClick(activityItem)}
                  sx={{
                    cursor: onActivityClick ? "pointer" : "default",
                    py: 2,
                    px: 3,
                    transition: "all 0.2s ease",
                    "&:hover": onActivityClick
                      ? {
                          backgroundColor: alpha(
                            theme.palette.action.hover,
                            0.3
                          ),
                        }
                      : {},
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: alpha(
                          ((
                            theme.palette[
                              getActivityColor(
                                activityItem.type
                              ) as keyof typeof theme.palette
                            ] as any
                          )?.main as string) || theme.palette.primary.main,
                          0.1
                        ),
                        color:
                          ((
                            theme.palette[
                              getActivityColor(
                                activityItem.type
                              ) as keyof typeof theme.palette
                            ] as any
                          )?.main as string) || theme.palette.primary.main,
                        border: `1px solid ${alpha(
                          ((
                            theme.palette[
                              getActivityColor(
                                activityItem.type
                              ) as keyof typeof theme.palette
                            ] as any
                          )?.main as string) || theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      {getActivityIcon(activityItem.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={activityItem.title}
                    secondary={
                      <React.Fragment>
                        <Typography variant="caption" color="text.secondary">
                          by {activityItem.user_name} •{" "}
                          {formatDate(activityItem.created_at)}
                        </Typography>
                        {activityItem.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              fontSize: "0.75rem",
                              opacity: 0.8,
                              mt: 0.5,
                            }}
                          >
                            {activityItem.description}
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: {
                        fontWeight: 500,
                        fontSize: "0.875rem",
                      },
                    }}
                    secondaryTypographyProps={{
                      component: "div",
                      sx: { mt: 0.5 },
                    }}
                  />

                  {/* Activity Type Chip */}
                  <Box
                    sx={{
                      ml: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <Chip
                      label={activityItem.type.replace("_", " ")}
                      size="small"
                      color={getActivityColor(activityItem.type) as any}
                      variant="outlined"
                      sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        textTransform: "capitalize",
                        "& .MuiChip-label": { px: 1 },
                        borderRadius: 1,
                      }}
                    />
                  </Box>

                  {onActivityClick && (
                    <ChevronRight
                      sx={{
                        color: "text.secondary",
                        opacity: 0.5,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItem>

                {index < displayedActivities.length - 1 && (
                  <Divider sx={{ mx: 3, opacity: 0.3 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}

        {!isLoading &&
          displayedActivities.length > 0 &&
          !showAll &&
          activity.length > limit && (
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              <Button
                size="small"
                onClick={() => setShowAll(true)}
                sx={{
                  textTransform: "none",
                  width: "100%",
                  borderRadius: 2,
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Show {activity.length - limit} more activities
              </Button>
            </Box>
          )}
      </CardContent>
    </Card>
  );
};
