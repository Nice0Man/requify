import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreHoriz as MoreIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
// TODO: Заменить на shared типы и хуки
// import {
//   useNotifications,
//   useMarkAsRead,
//   useMarkAllAsRead,
//   useDeleteNotification,
//   useArchiveNotification,
//   useUnreadCount,
// } from "@/features/notifications/model/useNotificationQuery";

// Временные заглушки для демонстрации
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  status?: string;
  actionUrl?: string;
  priority?: string;
  createdAt?: Date;
}

interface NotificationCenterProps {
  onSettingsClick?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onSettingsClick,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<
    string | null
  >(null);

  const open = Boolean(anchorEl);

  // Используем хуки для получения уведомлений в реальном времени
  // TODO: Заменить на настоящие хуки из features когда они будут переданы через props
  const allNotifications: Notification[] = [];
  const isLoading = false;
  const unreadCount = 0;

  // Заглушки для мутаций
  const markAsRead = { 
    mutate: (id: string) => console.log('Mark as read:', id),
    mutateAsync: async (id: string) => console.log('Mark as read async:', id)
  };
  const markAllAsRead = { 
    mutate: () => console.log('Mark all as read'),
    mutateAsync: async () => console.log('Mark all as read async'),
    isPending: false
  };
  const deleteNotification = { 
    mutate: (id: string) => console.log('Delete:', id),
    mutateAsync: async (id: string) => console.log('Delete async:', id)
  };
  const archiveNotification = { 
    mutate: (id: string) => console.log('Archive:', id),
    mutateAsync: async (id: string) => console.log('Archive async:', id)
  };

  // Фильтруем уведомления по статусу
  const unreadNotifications = allNotifications.filter(
    (n) => n.status === "unread"
  );
  const readNotifications = allNotifications.filter((n) => n.status === "read");
  const archivedNotifications = allNotifications.filter(
    (n) => n.status === "archived"
  );
  const latestNotifications = unreadNotifications.slice(0, 5);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification.mutateAsync(notificationId);
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification.mutateAsync(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (
    notificationId: string,
    actionUrl?: string
  ) => {
    handleMarkAsRead(notificationId);
    if (actionUrl) {
      window.open(actionUrl, "_blank");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <SuccessIcon sx={{ color: "success.main" }} />;
      case "warning":
        return <WarningIcon sx={{ color: "warning.main" }} />;
      case "error":
        return <ErrorIcon sx={{ color: "error.main" }} />;
      default:
        return <InfoIcon sx={{ color: "info.main" }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "default";
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return format(date, "HH:mm", { locale: ru });
    } else if (isYesterday(date)) {
      return (
        t("common.yesterday") + " " + format(date, "HH:mm", { locale: ru })
      );
    } else {
      return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
    }
  };

  const TabPanel = ({
    children,
    value,
    index,
  }: {
    children: React.ReactNode;
    value: number;
    index: number;
  }) => <div hidden={value !== index}>{value === index && children}</div>;

  const renderNotificationList = (notificationList: Notification[]) => {
    if (notificationList.length === 0) {
      return (
        <Box sx={{ textAlign: "center", p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {t("notifications.noNotifications")}
          </Typography>
        </Box>
      );
    }

    return (
      <List disablePadding>
        {notificationList.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem
              sx={{
                alignItems: "flex-start",
                cursor: notification.actionUrl ? "pointer" : "default",
                backgroundColor:
                  notification.status === "unread"
                    ? "action.hover"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "action.selected",
                },
              }}
              onClick={() =>
                handleNotificationClick(notification.id, notification.actionUrl)
              }
            >
              <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={t(
                        `notifications.priority.${notification.priority}`
                      )}
                      color={getPriorityColor(notification.priority || 'low') as any}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatNotificationDate((notification.createdAt || notification.timestamp)?.toString() || '')}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(notification.id);
                  }}
                >
                  <ArchiveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < notificationList.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <>
      <Tooltip title={t("notifications.title")}>
        <IconButton color="inherit" onClick={handleClick} size="large">
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("notifications.title")}</Typography>
            <Box>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                  startIcon={
                    markAllAsRead.isPending ? (
                      <CircularProgress size={16} />
                    ) : (
                      <MarkReadIcon />
                    )
                  }
                >
                  {t("notifications.markAllAsRead")}
                </Button>
              )}
              {onSettingsClick && (
                <IconButton size="small" onClick={onSettingsClick}>
                  <SettingsIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`${t("notifications.new")} (${unreadCount})`} />
          <Tab label={t("notifications.read")} />
          <Tab label={t("notifications.archived")} />
        </Tabs>

        <Box sx={{ height: 400, overflow: "auto" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                {renderNotificationList(latestNotifications)}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {renderNotificationList(readNotifications)}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {renderNotificationList(archivedNotifications)}
              </TabPanel>
            </>
          )}
        </Box>

        {/* Показать последние уведомления если есть */}
        {latestNotifications.length > 0 && tabValue === 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                // TODO: открыть полную страницу уведомлений
              }}
            >
              {t("notifications.showAll")}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;
