import React, { memo } from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Assignment,
  FolderOpen,
  RocketLaunch,
  BugReport,
  Person,
  CheckCircle,
  Code,
  Comment,
  MoreVert,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import type {
  ActivityItem as ActivityItemType,
  ActivityType,
  ActivityStatus,
  Priority,
} from "../model/types";

interface ActivityItemProps {
  activity: ActivityItemType;
  loading?: boolean;
  variant?: "minimal" | "detailed" | "compact";
  onClick?: (activity: ActivityItemType) => void;
  onActionClick?: (activity: ActivityItemType, action: string) => void;
  showAvatar?: boolean;
  showStatus?: boolean;
  showPriority?: boolean;
  className?: string;
}

export const ActivityItem = memo<ActivityItemProps>(
  ({
    activity,
    loading = false,
    variant = "detailed",
    onClick,
    onActionClick,
    showAvatar = true,
    showStatus = true,
    showPriority = true,
    className,
  }) => {
    const theme = useTheme();

    const getActivityIcon = (type: ActivityType) => {
      const iconMap = {
        project_created: FolderOpen,
        project_updated: FolderOpen,
        requirement_created: Assignment,
        requirement_updated: Assignment,
        requirement_approved: CheckCircle,
        release_created: RocketLaunch,
        release_published: RocketLaunch,
        test_executed: BugReport,
        user_joined: Person,
        comment_added: Comment,
      };

      const IconComponent = iconMap[type] || Assignment;
      return <IconComponent fontSize="small" />;
    };

    const getActivityColor = (type: ActivityType) => {
      const colorMap = {
        project_created: theme.palette.primary.main,
        project_updated: theme.palette.primary.main,
        requirement_created: theme.palette.info.main,
        requirement_updated: theme.palette.info.main,
        requirement_approved: theme.palette.success.main,
        release_created: theme.palette.secondary.main,
        release_published: theme.palette.secondary.main,
        test_executed: theme.palette.warning.main,
        user_joined: theme.palette.success.main,
        comment_added: theme.palette.text.secondary,
      };

      return colorMap[type] || theme.palette.text.secondary;
    };

    const getStatusColor = (status: ActivityStatus) => {
      const colorMap = {
        pending: theme.palette.warning.main,
        in_progress: theme.palette.info.main,
        completed: theme.palette.success.main,
        failed: theme.palette.error.main,
      };

      return colorMap[status];
    };

    const getPriorityColor = (priority: Priority) => {
      const colorMap = {
        low: theme.palette.success.main,
        medium: theme.palette.warning.main,
        high: theme.palette.error.main,
        critical: theme.palette.error.dark,
      };

      return colorMap[priority];
    };

    const formatActivityTime = (timestamp: string) => {
      try {
        return formatDistanceToNow(new Date(timestamp), {
          addSuffix: true,
          locale: ru,
        });
      } catch {
        return "недавно";
      }
    };

    if (loading) {
      return (
        <Box
          className={className}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            background: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" spacing={2}>
            {showAvatar && (
              <Skeleton variant="circular" width={40} height={40} />
            )}
            <Box flex={1}>
              <Stack spacing={1}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="30%" height={14} />
              </Stack>
            </Box>
          </Stack>
        </Box>
      );
    }

    const isInteractive = Boolean(onClick);

    return (
      <Box
        className={className}
        onClick={isInteractive ? () => onClick!(activity) : undefined}
        sx={{
          p: variant === "compact" ? 1.5 : 2,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
          transition: "all 0.2s ease-in-out",
          cursor: isInteractive ? "pointer" : "default",
          position: "relative",

          ...(isInteractive && {
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
              borderColor: alpha(theme.palette.primary.main, 0.2),
            },
          }),

          "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }}
        tabIndex={isInteractive ? 0 : -1}
        role={isInteractive ? "button" : undefined}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* Avatar or Icon */}
          {showAvatar && (
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={activity.user.avatar}
                sx={{
                  width: variant === "compact" ? 32 : 40,
                  height: variant === "compact" ? 32 : 40,
                  bgcolor: alpha(getActivityColor(activity.type), 0.1),
                  color: getActivityColor(activity.type),
                }}
              >
                {activity.user.avatar ? null : getActivityIcon(activity.type)}
              </Avatar>

              {/* Activity type indicator */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: getActivityColor(activity.type),
                  border: `2px solid ${theme.palette.background.paper}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 10,
                }}
              >
                {getActivityIcon(activity.type)}
              </Box>
            </Box>
          )}

          {/* Content */}
          <Box flex={1} minWidth={0}>
            <Stack spacing={variant === "compact" ? 0.5 : 1}>
              {/* Title and Status */}
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1}
              >
                <Box flex={1} minWidth={0}>
                  <Typography
                    variant={variant === "compact" ? "body2" : "subtitle2"}
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: variant === "compact" ? 1 : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {activity.title}
                  </Typography>

                  {/* User name */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {activity.user.name}
                  </Typography>
                </Box>

                {/* Action button */}
                {onActionClick && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick(activity, "menu");
                    }}
                    sx={{ opacity: 0.7 }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              {/* Description */}
              {variant !== "compact" && activity.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {activity.description}
                </Typography>
              )}

              {/* Footer with chips and time */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ mt: "auto" }}
              >
                {/* Status and Priority chips */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {showStatus && activity.status && (
                    <Chip
                      label={activity.status}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        borderColor: getStatusColor(activity.status),
                        color: getStatusColor(activity.status),
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  )}

                  {showPriority && activity.priority && (
                    <Chip
                      label={activity.priority}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        bgcolor: alpha(
                          getPriorityColor(activity.priority),
                          0.1
                        ),
                        color: getPriorityColor(activity.priority),
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  )}
                </Stack>

                {/* Timestamp */}
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.disabled,
                    fontWeight: 400,
                    flexShrink: 0,
                  }}
                >
                  {formatActivityTime(activity.timestamp)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    );
  }
);

ActivityItem.displayName = "ActivityItem";
