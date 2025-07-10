import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  Collapse,
  Badge,
  Paper,
  Fade,
  Chip,
} from "@mui/material";
import { ExpandLess, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useSidebar,
  useSidebarConfig,
  useSidebarItems,
  useSidebarBottomItems,
} from "../model";
import { SidebarItem } from "../model/types";

interface SidebarItemProps {
  item: SidebarItem;
  level?: number;
  isCollapsed?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onItemClick: (item: SidebarItem) => void;
  onToggleExpanded?: (itemId: string) => void;
  navigate?: (path: string) => void;
  isMobile?: boolean;
  setOpen?: (open: boolean) => void;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  level = 0,
  isCollapsed = false,
  isActive = false,
  isExpanded = false,
  onItemClick,
  onToggleExpanded,
  navigate,
  isMobile,
  setOpen,
}): JSX.Element => {
  const theme = useTheme();
  const Icon = item.icon;
  const hasChildren = Boolean(item.children);
  const isNestedItem = level > 0;

  const itemContent = (
    <ListItemButton
      onClick={() => onItemClick(item)}
      disabled={item.disabled}
      sx={{
        mx: isNestedItem ? 0.5 : 1,
        mb: 0.5,
        borderRadius: 3,
        minHeight: 44,
        pl: isNestedItem ? 3 : 1.5,
        pr: 1,
        backgroundColor: isActive
          ? alpha(theme.palette.primary.main, 0.12)
          : "transparent",
        border: isActive
          ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
          : "2px solid transparent",
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
          borderColor: alpha(theme.palette.primary.main, 0.2),
          transform: "translateX(2px)",
        },
        transition: "all 0.2s ease",
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: isActive
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          transition: "color 0.2s ease",
        }}
      >
        <Badge
          badgeContent={item.badge}
          color="error"
          invisible={!item.badge || (isCollapsed && !isNestedItem)}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.7rem",
              minWidth: 14,
              height: 14,
              fontWeight: 600,
            },
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Badge>
      </ListItemIcon>

      {!isCollapsed && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: isNestedItem ? "0.8rem" : "0.85rem",
            fontWeight: isActive ? 600 : 400,
            color: isActive
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          }}
        />
      )}

      {/* Индикатор новых функций */}
      {item.isNew && !isCollapsed && (
        <Chip
          label="NEW"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.6rem",
            fontWeight: 700,
            backgroundColor: theme.palette.success.main,
            color: "white",
            borderRadius: 3,
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />
      )}

      {hasChildren && !isCollapsed && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpanded?.(item.id);
          }}
          sx={{
            p: 0.25,
            color: theme.palette.text.secondary,
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "all 0.2s ease",
          }}
        >
          <ExpandLess sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </ListItemButton>
  );

  return (
    <>
      <ListItem disablePadding>
        {isCollapsed && !isNestedItem ? (
          <Tooltip
            title={
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: item.children ? 1 : 0 }}
                >
                  {item.label}
                </Typography>
                {item.badge && (
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                      display: "block",
                      mb: item.children ? 1 : 0,
                    }}
                  >
                    {item.badge} уведомлений
                  </Typography>
                )}
                {item.children && (
                  <Box sx={{ mt: 0.5 }}>
                    {item.children.map((child) => (
                      <Box
                        key={child.id}
                        component="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (child.path && navigate) {
                            navigate(child.path);
                            if (isMobile && setOpen) {
                              setOpen(false);
                            }
                          }
                        }}
                        sx={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: "2px 4px",
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontSize: "0.7rem",
                            lineHeight: 1.2,
                            color: "inherit",
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          • {child.label}
                          {child.badge && (
                            <span style={{ marginLeft: 4, fontWeight: 600 }}>
                              ({child.badge})
                            </span>
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            }
            placement="right"
            arrow
            PopperProps={{
              sx: {
                "& .MuiTooltip-tooltip": {
                  backgroundColor: theme.palette.grey[900],
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  boxShadow: theme.shadows[12],
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                },
                "& .MuiTooltip-arrow": {
                  color: theme.palette.grey[900],
                },
              },
            }}
          >
            <Box sx={{ width: "100%" }}>{itemContent}</Box>
          </Tooltip>
        ) : (
          itemContent
        )}
      </ListItem>

      {/* Вложенные элементы с улучшенной анимацией */}
      {hasChildren && !isCollapsed && (
        <Collapse
          in={isExpanded}
          timeout={400}
          unmountOnExit
          sx={{
            "& .MuiCollapse-wrapper": {
              overflow: "visible",
            },
          }}
        >
          <Box>
            <List component="div" disablePadding>
              {item.children!.map((child) => (
                <SidebarItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  isActive={isActive}
                  onItemClick={onItemClick}
                  navigate={navigate}
                  isMobile={isMobile}
                  setOpen={setOpen}
                />
              ))}
            </List>
          </Box>
        </Collapse>
      )}
    </>
  );
};

export const SidebarWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const config = useSidebarConfig();
  const items = useSidebarItems();
  const bottomItems = useSidebarBottomItems();

  const {
    isCollapsed,
    isMobile,
    isOpen,
    isPinned,
    expandedItems,
    activeItem,
    toggleCollapse,
    toggleExpanded,
    setOpen,
  } = useSidebar();

  const handleItemClick = (item: SidebarItem) => {
    if (item.children) {
      // В свернутом режиме, если есть дети, сначала раскрываем сайдбар
      if (isCollapsed) {
        toggleCollapse();
        // Автоматически разворачиваем элемент после небольшой задержки
        setTimeout(() => {
          if (!expandedItems.includes(item.id)) {
            toggleExpanded(item.id);
          }
        }, 150);
      } else {
        // В развернутом режиме просто переключаем раскрытие
        toggleExpanded(item.id);
      }
    } else if (item.path) {
      // Прямая навигация
      navigate(item.path);
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  const isItemActive = (item: SidebarItem): boolean => {
    if (activeItem === item.id) return true;
    if (item.children) {
      return item.children.some((child) => activeItem === child.id);
    }
    return false;
  };

  const sidebarWidth = isCollapsed ? config.collapsedWidth : config.width;

  return (
    <>
      {/* Мобильная заглушка */}
      {isMobile && isOpen && (
        <Fade in={isOpen} timeout={200}>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: alpha(theme.palette.common.black, 0.5),
              zIndex: theme.zIndex.drawer - 1,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setOpen(false)}
          />
        </Fade>
      )}

      {/* Строгая боковая панель - минималистичный дизайн */}
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          left: isMobile ? (isOpen ? 0 : -sidebarWidth) : 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, 
              ${alpha(theme.palette.grey[900], 0.98)} 0%, 
              ${alpha(theme.palette.grey[800], 0.95)} 100%)`
              : `linear-gradient(180deg, 
              ${alpha(theme.palette.grey[50], 0.98)} 0%, 
              ${alpha(theme.palette.common.white, 0.95)} 100%)`,
          backdropFilter: "blur(12px)",
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: isOpen
            ? isMobile
              ? `0 0 40px ${alpha(theme.palette.common.black, 0.2)}`
              : `2px 0 20px ${alpha(theme.palette.common.black, 0.08)}`
            : "none",
          zIndex: theme.zIndex.drawer,
          transition: `all ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Строгий заголовок */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            px: isCollapsed ? 1 : 2,
            py: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            minHeight: 56,
            background: "transparent",
          }}
        >
          {!isCollapsed && (
            <Fade in={!isCollapsed} timeout={200}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Минималистичный логотип */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    backgroundColor: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    R
                  </Typography>
                </Box>

                {/* Простое название */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "1.1rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Requify
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Простая кнопка сворачивания/открытия */}
          <Tooltip
            title={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
            placement="right"
            arrow
          >
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                width: 32,
                height: 32,
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                },
                transition: "all 0.2s ease",
              }}
            >
              {isCollapsed ? (
                <ChevronRight sx={{ fontSize: 16 }} />
              ) : (
                <ChevronLeft sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Основная навигация */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden auto",
            py: 1,
            "&::-webkit-scrollbar": {
              width: 4,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 2,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.4),
              },
            },
          }}
        >
          <List disablePadding>
            {items.map((item) => (
              <SidebarItemComponent
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isItemActive(item)}
                isExpanded={expandedItems.includes(item.id)}
                onItemClick={handleItemClick}
                onToggleExpanded={toggleExpanded}
                navigate={navigate}
                isMobile={isMobile}
                setOpen={setOpen}
              />
            ))}
          </List>
        </Box>

        {/* Простой разделитель */}
        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Нижняя секция */}
        <Box sx={{ py: 0.5 }}>
          <List disablePadding>
            {bottomItems.map((item) => (
              <SidebarItemComponent
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isItemActive(item)}
                onItemClick={handleItemClick}
                navigate={navigate}
                isMobile={isMobile}
                setOpen={setOpen}
              />
            ))}
          </List>
        </Box>
      </Paper>
    </>
  );
};
