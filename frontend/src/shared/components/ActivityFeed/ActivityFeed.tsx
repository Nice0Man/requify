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
  Button,
  Fade,
} from "@mui/material";
import {
  MoreVert,
  FolderOpen,
  Assignment,
  RocketLaunch,
  Person,
  BugReport,
  Info,
  ArrowForward,
  Circle,
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
          borderRadius: 4,
          boxShadow: `0 8px 32px -8px ${alpha(theme.palette.common.black, 0.12)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <CardHeader 
          title={
            <Skeleton variant="text" width={150} height={28} />
          }
          sx={{ pb: 2 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <List disablePadding>
            {Array.from({ length: 5 }).map((_, index) => (
              <ListItem key={index} sx={{ px: 0, py: 2 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={44} height={44} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="70%" height={24} />}
                  secondary={<Skeleton variant="text" width="50%" height={20} />}
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
        borderRadius: 4,
        boxShadow: `0 8px 32px -8px ${alpha(theme.palette.common.black, 0.12)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        background: theme.palette.background.paper,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.8)}, transparent)`,
          zIndex: 1,
        },
      }}
    >
      <CardHeader
        title={
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: "1.1rem",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </Typography>
        }
        action={
          <IconButton 
            size="small"
            sx={{
              color: theme.palette.action.active,
              opacity: 0.6,
              transition: "all 0.2s ease",
              "&:hover": {
                opacity: 1,
                backgroundColor: alpha(theme.palette.action.active, 0.08),
              },
            }}
          >
            <MoreVert />
          </IconButton>
        }
        sx={{ pb: 2 }}
      />

      <CardContent sx={{ pt: 0, pb: showMoreButton ? 2 : 3 }}>
        {displayedActivities.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.1)}, ${alpha(theme.palette.grey[400], 0.05)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Info
                sx={{ fontSize: 28, color: theme.palette.grey[400] }}
              />
            </Box>
            <Typography 
              color="text.secondary" 
              align="center"
              sx={{ 
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              No recent activity to display
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {displayedActivities.map((activity, index) => (
              <Fade
                key={activity.id}
                in={true}
                timeout={300 + index * 100}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    cursor: onActivityClick ? "pointer" : "default",
                    borderRadius: 3,
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    position: "relative",
                    "&:hover": onActivityClick
                      ? {
                          backgroundColor: alpha(theme.palette.action.hover, 0.04),
                          transform: "translateX(8px)",
                        }
                      : {},
                    "&:not(:last-child)": {
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    },
                  }}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(getActivityColor(activity.type, activity.status), 0.12),
                        color: getActivityColor(activity.type, activity.status),
                        width: 44,
                        height: 44,
                        border: `1px solid ${alpha(getActivityColor(activity.type, activity.status), 0.2)}`,
                      }}
                      src={activity.user_avatar}
                    >
                      {getActivityIcon(activity.type, activity.status)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: "0.875rem",
                            lineHeight: 1.4,
                            flex: 1,
                          }}
                        >
                          {activity.title}
                        </Typography>
                        {activity.priority && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Circle
                              sx={{
                                fontSize: 8,
                                color: getPriorityColor(activity.priority),
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: getPriorityColor(activity.priority),
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                              }}
                            >
                              {activity.priority}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.8rem",
                            lineHeight: 1.4,
                            mb: 1,
                          }}
                        >
                          {activity.description}
                        </Typography>
                        
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="space-between"
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              {formatTimeAgo(activity.timestamp)}
                            </Typography>
                            
                            {activity.user_name && (
                              <>
                                <Circle sx={{ fontSize: 4, color: theme.palette.divider }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  by {activity.user_name}
                                </Typography>
                              </>
                            )}
                            
                            {activity.project_name && (
                              <>
                                <Circle sx={{ fontSize: 4, color: theme.palette.divider }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.primary.main,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {activity.project_name}
                                </Typography>
                              </>
                            )}
                          </Box>
                          
                          {activity.status && (
                            <Chip
                              label={activity.status.replace("_", " ")}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                backgroundColor: alpha(getActivityColor(activity.type, activity.status), 0.12),
                                color: getActivityColor(activity.type, activity.status),
                                border: `1px solid ${alpha(getActivityColor(activity.type, activity.status), 0.2)}`,
                                textTransform: "capitalize",
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
                  
                  {onActivityClick && (
                    <Box
                      sx={{
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                        ".MuiListItem-root:hover &": {
                          opacity: 1,
                        },
                      }}
                    >
                      <ArrowForward 
                        sx={{ 
                          fontSize: 16, 
                          color: theme.palette.action.active 
                        }} 
                      />
                    </Box>
                  )}
                </ListItem>
              </Fade>
            ))}
          </List>
        )}

        {showMoreButton && displayedActivities.length > 0 && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="text"
              onClick={onShowMore}
              endIcon={<ArrowForward />}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: "0.875rem",
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              View All Activity
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
