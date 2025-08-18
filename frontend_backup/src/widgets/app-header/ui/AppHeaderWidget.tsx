import React, { memo, useCallback, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  TextField,
  InputAdornment,
  Autocomplete,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  alpha,
  useTheme,
  Tooltip,
  Button,
  MenuList,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Language as LanguageIcon,
  FlashOn as FlashOnIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  Update as UpdateIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  ViewModule as ViewModuleIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { notificationsDAO, type Notification } from "@/entities/notifications";
import { type QuickAction } from "@/features/actions";
import { navigationDAO, type NavigationItem } from "@/entities/navigation";
import { ErrorBoundary } from "@/shared/ui";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

/**
 * Пропы для AppHeaderWidget
 */
interface AppHeaderWidgetProps {
  /** Заголовок приложения */
  title?: string;

  /** Подзаголовок */
  subtitle?: string;

  /** Логотип */
  logo?: React.ReactNode;

  /** Пользователь */
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };

  /** Показывать поиск */
  showSearch?: boolean;

  /** Показывать уведомления */
  showNotifications?: boolean;

  /** Показывать быстрые действия */
  showQuickActions?: boolean;

  /** Показывать кнопку меню (для мобильных) */
  showMenuButton?: boolean;

  /** Обработчик переключения сайдбара */
  onToggleSidebar?: () => void;

  /** Обработчик логаута */
  onLogout?: () => void;

  /** Обработчик переключения темы */
  onToggleTheme?: () => void;

  /** Обработчик смены языка */
  onLanguageChange?: (language: string) => void;

  /** Текущий язык */
  currentLanguage?: string;

  /** Темная тема */
  isDarkMode?: boolean;

  /** Класс стилей */
  className?: string;

  /** Дополнительные стили */
  sx?: any;
}

/**
 * Компонент поиска в хедере
 */
const HeaderSearch = memo<{
  onSearch: (query: string) => void;
  onResultClick: (item: NavigationItem) => void;
}>(({ onSearch, onResultClick }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const searchItems = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const items = await navigationDAO.searchNavigationItems(
        searchQuery,
        undefined,
        10
      );
      setResults(items);
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        searchItems(query);
        onSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchItems, onSearch]);

  return (
    <Autocomplete
      freeSolo
      open={open && results.length > 0}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={results}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.title
      }
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          onClick={() => onResultClick(option)}
          sx={{ "& svg": { mr: 2, flexShrink: 0 } }}
        >
          {option.icon}
          <Box>
            <Typography variant="body2">{option.title}</Typography>
            {option.description && (
              <Typography variant="caption" color="text.secondary">
                {option.description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Поиск..."
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: alpha("#fff", 0.15),
              borderRadius: 2,
              "&:hover": {
                bgcolor: alpha("#fff", 0.25),
              },
              "&.Mui-focused": {
                bgcolor: "#fff",
                "& input::placeholder": {
                  color: "text.secondary",
                },
              },
            },
            "& .MuiOutlinedInput-input": {
              color: "inherit",
              "&::placeholder": {
                color: alpha("#fff", 0.7),
                opacity: 1,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "inherit" }} />
              </InputAdornment>
            ),
          }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
    />
  );
});

HeaderSearch.displayName = "HeaderSearch";

/**
 * Меню уведомлений
 */
const NotificationsMenu = memo<{
  anchorEl: HTMLElement | null;
  onClose: () => void;
  userId?: string;
}>(({ anchorEl, onClose, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (anchorEl && userId) {
      setLoading(true);
      notificationsDAO
        .getNotifications(userId, undefined, 10)
        .then((data) => {
          setNotifications(data.notifications);
        })
        .catch((error) => {
          console.error("Ошибка загрузки уведомлений:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [anchorEl, userId]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 400,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Уведомления
        </Typography>
      </Box>
      <Divider />

      {loading ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Загрузка...
          </Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Нет новых уведомлений
          </Typography>
        </Box>
      ) : (
        <MenuList sx={{ py: 0 }}>
          {notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              sx={{
                whiteSpace: "normal",
                maxWidth: "100%",
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor:
                      notification.status === "read"
                        ? "grey.300"
                        : "primary.main",
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </Typography>
                  </Box>
                }
              />
            </MenuItem>
          ))}
        </MenuList>
      )}
    </Menu>
  );
});

NotificationsMenu.displayName = "NotificationsMenu";

/**
 * Меню быстрых действий
 */
const QuickActionsMenu = memo<{
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onActionClick: (action: QuickAction) => void;
}>(({ anchorEl, onClose, onActionClick }) => {
  const quickActions = [
    {
      id: "new-project",
      title: "Новый проект",
      description: "Создать новый проект",
      icon: <BusinessIcon />,
      url: "/projects/new",
    },
    {
      id: "new-requirement",
      title: "Новое требование",
      description: "Добавить требование",
      icon: <ViewModuleIcon />,
      url: "/requirements/new",
    },
    {
      id: "analytics",
      title: "Аналитика",
      description: "Посмотреть отчеты",
      icon: <AnalyticsIcon />,
      url: "/reports",
    },
    {
      id: "team",
      title: "Команда",
      description: "Управление командой",
      icon: <GroupIcon />,
      url: "/team",
    },
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Быстрые действия
        </Typography>
      </Box>
      <Divider />

      <MenuList>
        {quickActions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => {
              onActionClick(action as QuickAction);
              onClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText
              primary={action.title}
              secondary={action.description}
            />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

QuickActionsMenu.displayName = "QuickActionsMenu";

/**
 * Меню настроек
 */
const SettingsMenu = memo<{
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onToggleTheme?: () => void;
  onLanguageChange?: (language: string) => void;
  isDarkMode?: boolean;
  currentLanguage?: string;
}>(
  ({
    anchorEl,
    onClose,
    onToggleTheme,
    onLanguageChange,
    isDarkMode,
    currentLanguage = "ru",
  }) => {
    const navigate = useNavigate();

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: 240,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Настройки
          </Typography>
        </Box>
        <Divider />

        <MenuList>
          <MenuItem
            onClick={() => {
              navigate("/settings");
              onClose();
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Общие настройки" />
          </MenuItem>

          {onToggleTheme && (
            <MenuItem onClick={onToggleTheme}>
              <ListItemIcon>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={isDarkMode ? "Светлая тема" : "Темная тема"}
              />
            </MenuItem>
          )}

          <MenuItem>
            <ListItemIcon>
              <PaletteIcon />
            </ListItemIcon>
            <ListItemText primary="Внешний вид" />
          </MenuItem>

          {onLanguageChange && (
            <MenuItem
              onClick={() => {
                onLanguageChange(currentLanguage === "ru" ? "en" : "ru");
                onClose();
              }}
            >
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText
                primary="Язык"
                secondary={currentLanguage === "ru" ? "Русский" : "English"}
              />
            </MenuItem>
          )}

          <Divider />

          <MenuItem>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText primary="Безопасность" />
          </MenuItem>

          <MenuItem>
            <ListItemIcon>
              <UpdateIcon />
            </ListItemIcon>
            <ListItemText primary="Обновления" />
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }
);

SettingsMenu.displayName = "SettingsMenu";

/**
 * Меню помощи
 */
const HelpMenu = memo<{
  anchorEl: HTMLElement | null;
  onClose: () => void;
}>(({ anchorEl, onClose }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 220,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Помощь
        </Typography>
      </Box>
      <Divider />

      <MenuList>
        <MenuItem onClick={onClose}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Документация" />
        </MenuItem>

        <MenuItem onClick={onClose}>
          <ListItemIcon>
            <FeedbackIcon />
          </ListItemIcon>
          <ListItemText primary="Обратная связь" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={onClose}>
          <ListItemText
            primary="Версия 1.0.0"
            secondary="© 2024 Requify"
            sx={{ fontSize: "0.875rem" }}
          />
        </MenuItem>
      </MenuList>
    </Menu>
  );
});

HelpMenu.displayName = "HelpMenu";

/**
 * AppHeaderWidget - главный хедер приложения с улучшенной стилизацией
 */
export const AppHeaderWidget = memo<AppHeaderWidgetProps>(
  ({
    title = "Requify",
    subtitle,
    logo,
    user,
    showSearch = true,
    showNotifications = true,
    showQuickActions = true,
    onToggleSidebar,
    onLogout,
    onToggleTheme,
    onLanguageChange,
    currentLanguage = "ru",
    isDarkMode = false,
    className,
    sx,
  }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Состояние меню
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
      null
    );
    const [notificationsAnchor, setNotificationsAnchor] =
      useState<HTMLElement | null>(null);
    const [quickActionsAnchor, setQuickActionsAnchor] =
      useState<HTMLElement | null>(null);
    const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(
      null
    );
    const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);

    // Данные
    const [unreadCount, setUnreadCount] = useState(0);

    // Загрузка данных
    useEffect(() => {
      if (user && showNotifications) {
        const loadUnreadCount = async () => {
          try {
            const count = await notificationsDAO.getUnreadCount(user.id);
            setUnreadCount(count);
          } catch (error) {
            console.error(
              "Ошибка получения количества непрочитанных уведомлений:",
              error
            );
          }
        };

        loadUnreadCount();

        const unsubscribe = notificationsDAO.subscribeToNotifications(
          user.id,
          () => {
            loadUnreadCount();
          }
        );

        return unsubscribe;
      }
    }, [user, showNotifications]);

    // Обработчики
    const handleSearch = useCallback((query: string) => {
      console.log("Поиск:", query);
    }, []);

    const handleSearchResultClick = useCallback(
      (item: NavigationItem) => {
        if (item.path) {
          navigate(item.path);
        } else if (item.externalUrl) {
          window.open(item.externalUrl, "_blank");
        }
      },
      [navigate]
    );

    const handleQuickActionClick = useCallback(
      async (action: QuickAction) => {
        try {
          if (action.url) {
            navigate(action.url);
          }
        } catch (error) {
          console.error("Ошибка выполнения быстрого действия:", error);
        }
      },
      [navigate]
    );

    return (
      <ErrorBoundary>
        <AppBar
          position="fixed"
          className={className}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            ...sx,
          }}
        >
          <Toolbar sx={{ minHeight: 64 }}>
            {/* Кнопка меню */}
            {onToggleSidebar && (
              <IconButton
                edge="start"
                onClick={onToggleSidebar}
                sx={{ mr: 2, color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Логотип и заголовок */}
            <Box display="flex" alignItems="center" mr={3}>
              {logo && <Box mr={1}>{logo}</Box>}
              <Box>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Поиск */}
            {showSearch && (
              <Box sx={{ flexGrow: 1, maxWidth: 400, mr: 2 }}>
                <HeaderSearch
                  onSearch={handleSearch}
                  onResultClick={handleSearchResultClick}
                />
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Группа кнопок действий */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Быстрые действия */}
              {showQuickActions && (
                <Tooltip title="Быстрые действия">
                  <IconButton
                    onClick={(e) => setQuickActionsAnchor(e.currentTarget)}
                    sx={{ color: "text.primary" }}
                  >
                    <FlashOnIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* Настройки */}
              <Tooltip title="Настройки">
                <IconButton
                  onClick={(e) => setSettingsAnchor(e.currentTarget)}
                  sx={{ color: "text.primary" }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>

              {/* Помощь */}
              <Tooltip title="Помощь">
                <IconButton
                  onClick={(e) => setHelpAnchor(e.currentTarget)}
                  sx={{ color: "text.primary" }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>

              {/* Уведомления */}
              {showNotifications && user && (
                <Tooltip title="Уведомления">
                  <IconButton
                    onClick={(e) => setNotificationsAnchor(e.currentTarget)}
                    sx={{ color: "text.primary" }}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Toolbar>

          {/* Все меню */}
          <QuickActionsMenu
            anchorEl={quickActionsAnchor}
            onClose={() => setQuickActionsAnchor(null)}
            onActionClick={handleQuickActionClick}
          />

          <SettingsMenu
            anchorEl={settingsAnchor}
            onClose={() => setSettingsAnchor(null)}
            onToggleTheme={onToggleTheme}
            onLanguageChange={onLanguageChange}
            isDarkMode={isDarkMode}
            currentLanguage={currentLanguage}
          />

          <HelpMenu anchorEl={helpAnchor} onClose={() => setHelpAnchor(null)} />

          <NotificationsMenu
            anchorEl={notificationsAnchor}
            onClose={() => setNotificationsAnchor(null)}
            userId={user?.id}
          />

          {/* Меню пользователя */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  width: 240,
                  mt: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={user?.avatar} sx={{ width: 40, height: 40 }}>
                  {user?.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider />

            <MenuList>
              {onLogout && (
                <MenuItem
                  onClick={() => {
                    onLogout();
                    setUserMenuAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Выход" />
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </AppBar>
      </ErrorBoundary>
    );
  }
);

AppHeaderWidget.displayName = "AppHeaderWidget";
