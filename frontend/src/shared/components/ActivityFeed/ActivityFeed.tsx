import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert,
  FolderOpen,
  Assignment,
  RocketLaunch,
  Person,
  BugReport,
  Info,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { ActivityItem } from "@/features/dashboard/api/dashboard.api";

export interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  title?: string;
  maxItems?: number;
  showMoreButton?: boolean;
  onShowMore?: () => void;
  onActivityClick?: (activity: ActivityItem) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  title = "Recent Activity",
  maxItems = 10,
  showMoreButton = false,
  onShowMore,
  onActivityClick,
}) => {
  const theme = useTheme();

  const getActivityIcon = (type: string, status?: string) => {
    const iconProps = { fontSize: "small" as const };

    switch (type) {
      case "project":
        return <FolderOpen {...iconProps} />;
      case "requirement":
        return <Assignment {...iconProps} />;
      case "release":
        return <RocketLaunch {...iconProps} />;
      case "user":
        return <Person {...iconProps} />;
      case "testing":
        return <BugReport {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (status === "completed" || status === "approved")
      return theme.palette.success.main;
    if (status === "failed" || status === "rejected")
      return theme.palette.error.main;
    if (status === "pending" || status === "in_progress")
      return theme.palette.warning.main;

    switch (type) {
      case "project":
        return theme.palette.primary.main;
      case "requirement":
        return theme.palette.secondary.main;
      case "release":
        return theme.palette.success.main;
      case "user":
        return theme.palette.info.main;
      case "testing":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return theme.palette.error.main;
      case "high":
        return theme.palette.warning.main;
      case "medium":
        return theme.palette.info.main;
      case "low":
        return theme.palette.grey[500];
      default:
        return undefined;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <CardHeader title={title} />
        <CardContent sx={{ pt: 0 }}>
          <List disablePadding>
            {Array.from({ length: 5 }).map((_, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%" />}
                  secondary={<Skeleton variant="text" width="40%" />}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        background: theme.palette.background.paper,
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            {title}
          </Typography>
        }
        action={
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {displayedActivities.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <Info
              sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }}
            />
            <Typography color="text.secondary" align="center">
              No recent activity to display
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {displayedActivities.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  cursor: onActivityClick ? "pointer" : "default",
                  borderRadius: 2,
                  transition: "background-color 0.2s",
                  "&:hover": onActivityClick
                    ? {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      }
                    : {},
                  ...(index < displayedActivities.length - 1 && {
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.08
                    )}`,
                  }),
                }}
                onClick={() => onActivityClick?.(activity)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(
                        getActivityColor(activity.type, activity.status),
                        0.12
                      ),
                      color: getActivityColor(activity.type, activity.status),
                      width: 36,
                      height: 36,
                    }}
                    src={activity.user_avatar}
                  >
                    {activity.user_avatar
                      ? undefined
                      : getActivityIcon(activity.type, activity.status)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          flex: 1,
                        }}
                      >
                        {activity.title}
                      </Typography>
                      {activity.priority && (
                        <Chip
                          label={activity.priority}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            backgroundColor: alpha(
                              getPriorityColor(activity.priority) ||
                                theme.palette.grey[500],
                              0.1
                            ),
                            color: getPriorityColor(activity.priority),
                            border: `1px solid ${alpha(
                              getPriorityColor(activity.priority) ||
                                theme.palette.grey[500],
                              0.2
                            )}`,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem", mb: 0.5 }}
                      >
                        {activity.description}
                      </Typography>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {activity.user_name} ·{" "}
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                        {activity.project_name && (
                          <Chip
                            label={activity.project_name}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {showMoreButton && activities.length > maxItems && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Typography
              variant="button"
              sx={{
                color: theme.palette.primary.main,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={onShowMore}
            >
              View All Activity ({activities.length})
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
