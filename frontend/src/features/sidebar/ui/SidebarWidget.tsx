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
  Zoom,
  Slide,
  Chip,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  MenuOpen,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
} from "@mui/icons-material";
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
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  level = 0,
  isCollapsed = false,
  isActive = false,
  isExpanded = false,
  onItemClick,
  onToggleExpanded,
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
        minHeight: 48,
        pl: isNestedItem ? 3.5 : 2,
        pr: 1.5,
        position: "relative",
        overflow: "hidden",
        backgroundColor: isActive
          ? alpha(item.color || theme.palette.primary.main, 0.15)
          : "transparent",
        border: isActive
          ? `1px solid ${alpha(item.color || theme.palette.primary.main, 0.3)}`
          : "1px solid transparent",
        boxShadow: isActive
          ? `0 4px 16px ${alpha(item.color || theme.palette.primary.main, 0.25)}`
          : "none",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isActive
            ? `linear-gradient(135deg, 
                ${alpha(item.color || theme.palette.primary.main, 0.08)} 0%, 
                ${alpha(item.color || theme.palette.primary.main, 0.02)} 100%)`
            : "transparent",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        "&::after": isActive ? {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 4,
          height: "60%",
          backgroundColor: item.color || theme.palette.primary.main,
          borderRadius: "0 2px 2px 0",
          boxShadow: `2px 0 8px ${alpha(item.color || theme.palette.primary.main, 0.3)}`,
        } : {},
        "&:hover": {
          backgroundColor: alpha(
            item.color || theme.palette.primary.main,
            0.08
          ),
          transform: "translateX(3px) scale(1.02)",
          boxShadow: `0 6px 20px ${alpha(
            item.color || theme.palette.primary.main,
            0.2
          )}`,
          "&::before": {
            background: `linear-gradient(135deg, 
              ${alpha(item.color || theme.palette.primary.main, 0.12)} 0%, 
              ${alpha(item.color || theme.palette.primary.main, 0.04)} 100%)`,
          },
        },
        "&:active": {
          transform: "translateX(2px) scale(1.01)",
        },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 40,
          color: isActive
            ? item.color || theme.palette.primary.main
            : theme.palette.text.secondary,
          transition: "all 0.3s ease",
          display: "flex",
          justifyContent: "center",
          transform: isActive ? "scale(1.1)" : "scale(1)",
        }}
      >
        <Badge
          badgeContent={item.badge}
          color="error"
          invisible={!item.badge || (isCollapsed && !isNestedItem)}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.7rem",
              minWidth: 16,
              height: 16,
              fontWeight: 600,
              animation: item.badge ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.1)" },
                "100%": { transform: "scale(1)" },
              },
            },
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Badge>
      </ListItemIcon>

      {!isCollapsed && (
        <Fade in={!isCollapsed} timeout={250}>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: isNestedItem ? "0.85rem" : "0.9rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive
                ? item.color || theme.palette.primary.main
                : theme.palette.text.primary,
              lineHeight: 1.4,
            }}
            sx={{
              mr: hasChildren ? 0 : 1,
              overflow: "hidden",
            }}
          />
        </Fade>
      )}

      {/* Индикатор новых функций */}
      {item.isNew && !isCollapsed && (
        <Slide direction="left" in={!isCollapsed} timeout={200}>
          <Chip
            label="NEW"
            size="small"
            sx={{
              height: 18,
              fontSize: "0.6rem",
              fontWeight: 700,
              backgroundColor: theme.palette.success.main,
              color: "white",
              "& .MuiChip-label": {
                px: 0.8,
              },
            }}
          />
        </Slide>
      )}

      {hasChildren && !isCollapsed && (
        <Zoom in={!isCollapsed} timeout={150}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded?.(item.id);
            }}
            sx={{
              p: 0.5,
              color: isActive
                ? item.color || theme.palette.primary.main
                : theme.palette.text.secondary,
              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: alpha(
                  item.color || theme.palette.primary.main,
                  0.1
                ),
                transform: isExpanded ? "rotate(0deg) scale(1.2)" : "rotate(-90deg) scale(1.2)",
              },
            }}
          >
            <ExpandLess />
          </IconButton>
        </Zoom>
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
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.label}
                </Typography>
                {item.badge && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {item.badge} уведомлений
                  </Typography>
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
          <Box
            sx={{
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 24,
                top: 8,
                bottom: 8,
                width: 2,
                background: `linear-gradient(180deg, 
                  ${alpha(item.color || theme.palette.primary.main, 0.3)} 0%, 
                  ${alpha(item.color || theme.palette.primary.main, 0.1)} 100%)`,
                borderRadius: 1,
              },
            }}
          >
            <List component="div" disablePadding>
              {item.children!.map((child, index) => (
                <Slide
                  key={child.id}
                  direction="right"
                  in={isExpanded}
                  timeout={300 + index * 50}
                  style={{ transformOrigin: "left center" }}
                >
                  <div>
                    <SidebarItemComponent
                      item={child}
                      level={level + 1}
                      isCollapsed={isCollapsed}
                      isActive={isActive}
                      onItemClick={onItemClick}
                    />
                  </div>
                </Slide>
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
      toggleExpanded(item.id);
    } else if (item.path) {
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
      {/* Улучшенная мобильная заглушка */}
      {isMobile && isOpen && (
        <Fade in={isOpen} timeout={200}>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, 
                ${alpha(theme.palette.common.black, 0.6)} 0%, 
                ${alpha(theme.palette.common.black, 0.4)} 100%)`,
              zIndex: theme.zIndex.drawer - 1,
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setOpen(false)}
          />
        </Fade>
      )}

      {/* Основная боковая панель с glass morphism */}
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          left: isMobile ? (isOpen ? 0 : -sidebarWidth) : 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.default, 0.90)} 50%,
            ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          backdropFilter: "blur(20px) saturate(180%)",
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: isMobile
            ? `0 0 60px ${alpha(theme.palette.common.black, 0.15)}`
            : `4px 0 40px ${alpha(theme.palette.common.black, 0.06)}`,
          zIndex: theme.zIndex.drawer,
          transition: `all ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 20%, 
              ${alpha(theme.palette.primary.main, 0.02)} 0%, 
              transparent 50%),
              radial-gradient(circle at 80% 80%, 
              ${alpha(theme.palette.secondary.main, 0.02)} 0%, 
              transparent 50%)`,
            pointerEvents: "none",
          },
        }}
      >
        {/* Модернизированный заголовок с логотипом */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            minHeight: 64,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.03)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "80%",
              height: 1,
              background: `linear-gradient(90deg, 
                transparent 0%, 
                ${alpha(theme.palette.primary.main, 0.3)} 50%, 
                transparent 100%)`,
            },
          }}
        >
          {!isCollapsed && (
            <Fade in={!isCollapsed} timeout={300}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Улучшенный логотип */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main} 0%, 
                      ${theme.palette.primary.dark} 50%,
                      ${theme.palette.secondary.main} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 24px ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 2,
                      left: 2,
                      right: 2,
                      bottom: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.common.white, 0.2)} 0%, 
                        transparent 100%)`,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: 900,
                      fontSize: "1.2rem",
                      letterSpacing: "-0.02em",
                      textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.3)}`,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    R
                  </Typography>
                </Box>

                {/* Улучшенное название */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.main} 0%, 
                        ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "1.35rem",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                    }}
                  >
                    Requify
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      color: alpha(theme.palette.text.secondary, 0.8),
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    Requirements Platform
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Улучшенная кнопка сворачивания */}
          <Tooltip
            title={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
            placement="right"
            arrow
          >
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                  ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                color: theme.palette.primary.main,
                backdropFilter: "blur(10px)",
                "&:hover": {
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                    ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                  transform: "scale(1.08) rotate(5deg)",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                "&:active": {
                  transform: "scale(1.05) rotate(3deg)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {isCollapsed ? (
                <ChevronRight sx={{ fontSize: 18 }} />
              ) : (
                <ChevronLeft sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Основная навигация с улучшенной прокруткой */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden auto",
            py: 1.5,
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: alpha(theme.palette.background.default, 0.1),
              borderRadius: 3,
              mx: 1,
            },
            "&::-webkit-scrollbar-thumb": {
              background: `linear-gradient(180deg, 
                ${alpha(theme.palette.primary.main, 0.3)} 0%, 
                ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              borderRadius: 3,
              "&:hover": {
                background: `linear-gradient(180deg, 
                  ${alpha(theme.palette.primary.main, 0.5)} 0%, 
                  ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
              },
            },
          }}
        >
          <List disablePadding>
            {items.map((item, index) => (
              <Slide
                key={item.id}
                direction="right"
                in={true}
                timeout={200 + index * 50}
                style={{ transformOrigin: "left center" }}
              >
                <div>
                  <SidebarItemComponent
                    item={item}
                    isCollapsed={isCollapsed}
                    isActive={isItemActive(item)}
                    isExpanded={expandedItems.includes(item.id)}
                    onItemClick={handleItemClick}
                    onToggleExpanded={toggleExpanded}
                  />
                </div>
              </Slide>
            ))}
          </List>
        </Box>

        {/* Улучшенный разделитель */}
        <Box
          sx={{
            position: "relative",
            mx: 2,
            my: 1,
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              height: 1,
              background: `linear-gradient(90deg, 
                transparent 0%, 
                ${alpha(theme.palette.divider, 0.2)} 20%, 
                ${alpha(theme.palette.divider, 0.4)} 50%, 
                ${alpha(theme.palette.divider, 0.2)} 80%, 
                transparent 100%)`,
            },
          }}
        />

        {/* Нижняя секция */}
        <Box sx={{ py: 1 }}>
          <List disablePadding>
            {bottomItems.map((item, index) => (
              <Slide
                key={item.id}
                direction="right"
                in={true}
                timeout={100 + index * 30}
                style={{ transformOrigin: "left center" }}
              >
                <div>
                  <SidebarItemComponent
                    item={item}
                    isCollapsed={isCollapsed}
                    isActive={isItemActive(item)}
                    onItemClick={handleItemClick}
                  />
                </div>
              </Slide>
            ))}
          </List>
        </Box>
      </Paper>
    </>
  );
};
