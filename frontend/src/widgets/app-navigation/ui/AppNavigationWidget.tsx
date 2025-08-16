import React, { memo, useState, useEffect, useCallback } from "react";
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  MoreHoriz as MoreHorizIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  navigationDAO,
  type BreadcrumbItem,
  type NavigationItem,
} from "@/entities/navigation";
import { ErrorBoundary } from "@/shared/ui";

/**
 * Пропы для AppNavigationWidget
 */
interface AppNavigationWidgetProps {
  /** Пользователь для персонализации */
  user?: {
    id: string;
    name: string;
  };
  
  /** Максимальное количество элементов для отображения */
  maxItems?: number;
  
  /** Показывать иконки */
  showIcons?: boolean;
  
  /** Показывать действия (избранное) */
  showActions?: boolean;
  
  /** Кастомные хлебные крошки (переопределяют автоматические) */
  customBreadcrumbs?: BreadcrumbItem[];
  
  /** Обработчик клика по элементу */
  onItemClick?: (item: BreadcrumbItem) => void;
  
  /** Класс стилей */
  className?: string;
  
  /** Дополнительные стили */
  sx?: any;
}

/**
 * Компонент элемента хлебных крошек
 */
const BreadcrumbItemComponent = memo<{
  item: BreadcrumbItem;
  isLast: boolean;
  showIcons: boolean;
  showActions: boolean;
  userId?: string;
  onItemClick: (item: BreadcrumbItem) => void;
  onToggleFavorite?: (itemId: string, isFavorite: boolean) => void;
}>(({ item, isLast, showIcons, showActions, userId, onItemClick, onToggleFavorite }) => {
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onItemClick(item);
  }, [item, onItemClick]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    try {
      if (isFavorite) {
        await navigationDAO.removeFromFavorites(userId, item.id);
      } else {
        await navigationDAO.addToFavorites(userId, item.id);
      }
      setIsFavorite(!isFavorite);
      onToggleFavorite?.(item.id, !isFavorite);
    } catch (error) {
      console.error("Ошибка обновления избранного:", error);
    }
  }, [userId, item.id, isFavorite, onToggleFavorite]);

  if (isLast) {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {showIcons && item.icon && (
          <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
            {item.icon}
          </Box>
        )}
        <Typography color="text.primary" fontWeight={600}>
          {item.title}
        </Typography>
        {showActions && userId && (
          <IconButton
            size="small"
            onClick={handleToggleFavorite}
            sx={{ 
              ml: 0.5,
              opacity: 0.7,
              "&:hover": { opacity: 1 },
            }}
          >
            {isFavorite ? (
              <StarIcon fontSize="small" color="warning" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Link
      underline="hover"
      color="inherit"
      href={item.path}
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        cursor: "pointer",
        "&:hover": {
          color: theme.palette.primary.main,
        },
      }}
    >
      {showIcons && item.icon && (
        <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
          {item.icon}
        </Box>
      )}
      {item.title}
    </Link>
  );
});

BreadcrumbItemComponent.displayName = "BreadcrumbItemComponent";

/**
 * AppNavigationWidget - виджет навигационных хлебных крошек
 * Использует navigation entity для получения данных о пути
 */
export const AppNavigationWidget = memo<AppNavigationWidgetProps>(({
  user,
  maxItems = 8,
  showIcons = true,
  showActions = true,
  customBreadcrumbs,
  onItemClick,
  className,
  sx,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Состояние
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hiddenItems, setHiddenItems] = useState<BreadcrumbItem[]>([]);

  // Загрузка хлебных крошек
  const loadBreadcrumbs = useCallback(async () => {
    if (customBreadcrumbs) {
      setBreadcrumbs(customBreadcrumbs);
      return;
    }

    setLoading(true);
    try {
      const items = await navigationDAO.getBreadcrumbs(location.pathname);
      
      // Добавляем домашнюю страницу в начало
      const homeItem: BreadcrumbItem = {
        id: "home",
        title: "Главная",
        path: "/dashboard",
        icon: <HomeIcon fontSize="small" />,
      };

      const allItems = [homeItem, ...items];
      
      // Обрабатываем превышение максимального количества элементов
      if (allItems.length > maxItems) {
        const visibleItems = [
          allItems[0], // Всегда показываем первый элемент
          ...allItems.slice(-(maxItems - 2)), // Показываем последние элементы
        ];
        const hidden = allItems.slice(1, -(maxItems - 2));
        
        setBreadcrumbs(visibleItems);
        setHiddenItems(hidden);
      } else {
        setBreadcrumbs(allItems);
        setHiddenItems([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки хлебных крошек:", error);
      setBreadcrumbs([]);
    } finally {
      setLoading(false);
    }
  }, [location.pathname, customBreadcrumbs, maxItems]);

  // Загрузка при изменении пути
  useEffect(() => {
    loadBreadcrumbs();
  }, [loadBreadcrumbs]);

  // Обработчики
  const handleItemClick = useCallback((item: BreadcrumbItem) => {
    if (item.path) {
      navigate(item.path);
    }
    onItemClick?.(item);
  }, [navigate, onItemClick]);

  const handleHiddenItemClick = useCallback((item: BreadcrumbItem) => {
    handleItemClick(item);
    setMenuAnchor(null);
  }, [handleItemClick]);

  const handleToggleFavorite = useCallback((itemId: string, isFavorite: boolean) => {
    console.log("Переключение избранного:", itemId, isFavorite);
  }, []);

  if (loading) {
    return (
      <Box className={className} sx={sx}>
        <Typography variant="body2" color="text.secondary">
          Загрузка навигации...
        </Typography>
      </Box>
    );
  }

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Box
        className={className}
        sx={{
          py: 1,
          px: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          ...sx,
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          maxItems={maxItems}
          aria-label="Навигация"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: "text.disabled",
            },
          }}
        >
          {/* Первый элемент */}
          <BreadcrumbItemComponent
            item={breadcrumbs[0]}
            isLast={breadcrumbs.length === 1}
            showIcons={showIcons}
            showActions={showActions}
            userId={user?.id}
            onItemClick={handleItemClick}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Скрытые элементы через меню */}
          {hiddenItems.length > 0 && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: "text.primary",
                  },
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
              
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                {hiddenItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    onClick={() => handleHiddenItemClick(item)}
                  >
                    {showIcons && item.icon && (
                      <ListItemIcon>{item.icon}</ListItemIcon>
                    )}
                    <ListItemText primary={item.title} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* Остальные видимые элементы */}
          {breadcrumbs.slice(1).map((item, index) => (
            <BreadcrumbItemComponent
              key={item.id}
              item={item}
              isLast={index === breadcrumbs.slice(1).length - 1}
              showIcons={showIcons}
              showActions={showActions}
              userId={user?.id}
              onItemClick={handleItemClick}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </Breadcrumbs>

        {/* Дополнительная информация */}
        {breadcrumbs.length > 1 && (
          <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
            {breadcrumbs[breadcrumbs.length - 1].metadata && (
              Object.entries(breadcrumbs[breadcrumbs.length - 1].metadata || {}).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              ))
            )}
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
});

AppNavigationWidget.displayName = "AppNavigationWidget"; 