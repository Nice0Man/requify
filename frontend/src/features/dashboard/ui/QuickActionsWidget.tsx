import React, { memo, useMemo, useCallback, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Chip,
  Badge,
  ButtonBase,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Add,
  Assignment,
  RocketLaunch,
  BugReport,
  FolderOpen,
  Analytics,
  Settings,
  MoreVert,
  Star,
  StarBorder,
  Keyboard,
  Launch,
  Assessment,
  TrendingUp,
  Speed,
  Upload,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useNavigate } from "react-router-dom";

import type { QuickAction } from "@/entities/dashboard";
import { ActionCategory } from "@/entities/dashboard";
import { useQuickActions } from "../model/queries";

interface QuickActionsWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  maxActions?: number;
  showCategories?: boolean;
  showShortcuts?: boolean;
  showFavorites?: boolean;
  category?: ActionCategory;
  className?: string;
  onActionClick?: (action: QuickAction) => void;
}

export const QuickActionsWidget = memo<QuickActionsWidgetProps>(
  ({
    variant = "detailed",
    maxActions = 8,
    showCategories = true,
    showShortcuts = true,
    showFavorites = true,
    onActionClick,
    className,
  }) => {
    const t = i18n.t;
    const theme = useTheme();
    const navigate = useNavigate();

    // Context7 Design System - 8px grid spacing
    const spacing = useMemo(
      () => ({
        xs: 8, // 8px
        sm: 16, // 16px
        md: 24, // 24px
        lg: 32, // 32px
        xl: 40, // 40px
        xxl: 48, // 48px
      }),
      []
    );

    // Context7 Animation System
    const animations = useMemo(
      () => ({
        fast: {
          duration: 150,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        },
        standard: {
          duration: 300,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        },
        complex: {
          duration: 500,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        },
        entrance: {
          duration: 400,
          easing: "cubic-bezier(0.0, 0.0, 0.2, 1)",
        },
      }),
      []
    );

    // Context7 Color System
    const colors = useMemo(
      () => ({
        surface: {
          primary: theme.palette.background.paper,
          secondary: alpha(theme.palette.background.paper, 0.6),
          elevated: alpha(theme.palette.background.paper, 0.9),
        },
        accent: {
          primary: theme.palette.primary.main,
          secondary: theme.palette.secondary.main,
          success: theme.palette.success.main,
          warning: theme.palette.warning.main,
          error: theme.palette.error.main,
          info: theme.palette.info.main,
        },
        elevation: {
          subtle: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
          medium: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
          high: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          extreme: `0 16px 64px ${alpha(theme.palette.common.black, 0.16)}`,
        },
      }),
      [theme.palette]
    );

    // Responsive breakpoints for Context7
    const isCompact = variant === "compact" || variant === "minimal";
    const isMobile = useMemo(() => {
      if (typeof window !== "undefined") {
        return window.innerWidth < 768;
      }
      return false;
    }, []);

    // Local state
    const [favoriteActions, setFavoriteActions] = useState<Set<string>>(
      new Set()
    );
    const [menuAnchor, setMenuAnchor] = useState<{
      element: HTMLElement;
      action: QuickAction;
    } | null>(null);

    // Queries
    const { data: actions, isLoading, error, isError } = useQuickActions();

    // Filtered and categorized actions
    const filteredActions = useMemo(() => {
      if (!actions) return [];
      return actions.slice(0, maxActions);
    }, [actions, maxActions]);

    const groupedActions = useMemo(() => {
      if (!showCategories) return {};

      return filteredActions.reduce((groups, action) => {
        const category = action.category || ActionCategory.CREATE;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(action);
        return groups;
      }, {} as Record<ActionCategory, QuickAction[]>);
    }, [filteredActions, showCategories]);

    // Event handlers
    const handleActionClick = useCallback(
      (action: QuickAction) => {
        if (onActionClick) {
          onActionClick(action);
        } else {
          navigate(action.path);
        }
      },
      [onActionClick, navigate]
    );

    const handleToggleFavorite = useCallback((actionId: string) => {
      setFavoriteActions((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(actionId)) {
          newSet.delete(actionId);
        } else {
          newSet.add(actionId);
        }
        return newSet;
      });
    }, []);

    const handleMenuOpen = useCallback(
      (action: QuickAction, event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchor({ element: event.currentTarget, action });
      },
      []
    );

    const handleMenuClose = useCallback(() => {
      setMenuAnchor(null);
    }, []);

    // Helper functions
    const getCategoryColor = useCallback(
      (category: ActionCategory) => {
        switch (category) {
          case ActionCategory.CREATE:
            return colors.accent.primary;
          case ActionCategory.ANALYZE:
            return colors.accent.info;
          case ActionCategory.MANAGE:
            return colors.accent.success;
          default:
            return colors.accent.secondary;
        }
      },
      [colors.accent]
    );

    const getActionIcon = useCallback((iconName: string) => {
      const iconMap: Record<string, React.ReactNode> = {
        Add: <Add />,
        Assignment: <Assessment />,
        RocketLaunch: <TrendingUp />,
        BugReport: <Speed />,
        Analytics: <Assessment />,
        FileUpload: <Upload />,
      };
      return iconMap[iconName] || <Add />;
    }, []);

    // Рендер действия с Context7 дизайном
    const renderAction = useCallback(
      (action: QuickAction, index: number) => {
        const isFavorite = favoriteActions.has(action.id);
        const actionColor = getCategoryColor(
          action.category || ActionCategory.CREATE
        );

        return (
          <Grid
            item
            xs={12}
            sm={6}
            md={isCompact ? 6 : 4}
            lg={isCompact ? 6 : 3}
            key={action.id}
          >
            <Fade
              in
              timeout={animations.entrance.duration}
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <Card
                onClick={() => handleActionClick(action)}
                sx={{
                  width: "100%",
                  height: isCompact ? 120 : 160,
                  position: "relative",
                  cursor: "pointer",
                  transition: `all ${animations.complex.duration}ms ${animations.complex.easing}`,
                  border: `1px solid ${alpha(actionColor, 0.12)}`,
                  background: `linear-gradient(135deg, 
                    ${alpha(actionColor, 0.06)} 0%, 
                    ${alpha(actionColor, 0.02)} 70%,
                    transparent 100%)`,
                  backdropFilter: "blur(20px)",
                  borderRadius: spacing.md / 8,
                  overflow: "hidden",
                  boxShadow: colors.elevation.subtle,

                  "&:hover": {
                    transform: "translateY(-8px) scale(1.02)",
                    boxShadow: `${colors.elevation.high}, 0 0 32px ${alpha(
                      actionColor,
                      0.25
                    )}`,
                    borderColor: alpha(actionColor, 0.3),

                    "& .action-icon": {
                      transform: "scale(1.15) rotate(8deg)",
                      boxShadow: `0 8px 24px ${alpha(actionColor, 0.4)}`,
                    },

                    "& .action-title": {
                      color: actionColor,
                      transform: "scale(1.02)",
                    },

                    "& .action-card::before": {
                      opacity: 1,
                      transform: "scale(1.05)",
                    },
                  },

                  "&:active": {
                    transform: "translateY(-4px) scale(1.01)",
                    transition: `all ${animations.fast.duration}ms ${animations.fast.easing}`,
                  },

                  "&:focus-visible": {
                    outline: `3px solid ${alpha(actionColor, 0.5)}`,
                    outlineOffset: 2,
                  },

                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${actionColor} 0%, ${alpha(
                      actionColor,
                      0.7
                    )} 100%)`,
                    opacity: 0.7,
                    transform: "scaleX(0.95)",
                    transformOrigin: "center",
                    transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,
                  },
                }}
                className="action-card"
              >
                <CardContent
                  sx={{
                    p: spacing.md / 8,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    "&:last-child": {
                      pb: spacing.md / 8,
                    },
                  }}
                >
                  {/* Context7 Enhanced Favorite Button */}
                  {showFavorites && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: spacing.sm / 8,
                        right: spacing.sm / 8,
                        zIndex: 2,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(action.id);
                        }}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: spacing.sm / 8,
                          background: alpha(colors.surface.elevated, 0.9),
                          backdropFilter: "blur(20px)",
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.15
                          )}`,
                          color: isFavorite
                            ? colors.accent.warning
                            : theme.palette.text.secondary,
                          transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,

                          "&:hover": {
                            transform: "scale(1.1)",
                            background: alpha(colors.accent.warning, 0.1),
                            borderColor: alpha(colors.accent.warning, 0.3),
                          },
                        }}
                      >
                        {isFavorite ? (
                          <Star fontSize="small" />
                        ) : (
                          <StarBorder fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  )}

                  {/* Context7 Enhanced Menu Button */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: spacing.sm / 8,
                      left: spacing.sm / 8,
                      zIndex: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(action, e)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: spacing.sm / 8,
                        background: alpha(colors.surface.elevated, 0.9),
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.15
                        )}`,
                        color: theme.palette.text.secondary,
                        transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,

                        "&:hover": {
                          transform: "scale(1.1)",
                          background: alpha(actionColor, 0.1),
                          borderColor: alpha(actionColor, 0.3),
                          color: actionColor,
                        },
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Context7 Enhanced Action Content */}
                  <Stack
                    spacing={spacing.sm / 8}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: "100%", textAlign: "center" }}
                  >
                    {/* Context7 Enhanced Icon */}
                    <Box
                      className="action-icon"
                      sx={{
                        width: isCompact ? 48 : 64,
                        height: isCompact ? 48 : 64,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, 
                          ${alpha(actionColor, 0.15)} 0%, 
                          ${alpha(actionColor, 0.05)} 100%)`,
                        border: `2px solid ${alpha(actionColor, 0.2)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: actionColor,
                        boxShadow: `0 4px 20px ${alpha(actionColor, 0.25)}`,
                        transition: `all ${animations.complex.duration}ms ${animations.complex.easing}`,
                        backdropFilter: "blur(20px)",
                        fontSize: isCompact ? 28 : 32,
                        mb: spacing.xs / 8,

                        "& > *": {
                          fontSize: "inherit",
                        },
                      }}
                    >
                      {getActionIcon(action.icon)}
                    </Box>

                    {/* Context7 Enhanced Title */}
                    <Typography
                      variant={isCompact ? "body2" : "subtitle2"}
                      className="action-title"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: isCompact ? "0.85rem" : "0.95rem",
                        lineHeight: 1.2,
                        textAlign: "center",
                        transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,
                        letterSpacing: "-0.01em",
                        px: spacing.xs / 8,
                      }}
                    >
                      {action.title}
                    </Typography>

                    {/* Context7 Enhanced Description */}
                    {!isCompact && action.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          textAlign: "center",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: "0.8rem",
                          opacity: 0.8,
                          px: spacing.xs / 8,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {action.description}
                      </Typography>
                    )}

                    {/* Context7 Enhanced Shortcut */}
                    {showShortcuts && action.shortcut && (
                      <Chip
                        icon={<Keyboard />}
                        label={action.shortcut}
                        size="small"
                        sx={{
                          fontSize: "0.65rem",
                          height: 24,
                          borderRadius: spacing.sm / 8,
                          background: alpha(actionColor, 0.1),
                          border: `1px solid ${alpha(actionColor, 0.2)}`,
                          color: actionColor,
                          fontWeight: 600,
                          mt: spacing.xs / 8,

                          "& .MuiChip-icon": {
                            color: actionColor,
                            fontSize: 14,
                          },
                        }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        );
      },
      [
        variant,
        isCompact,
        colors,
        spacing,
        animations,
        theme.palette,
        favoriteActions,
        showFavorites,
        showShortcuts,
        handleActionClick,
        handleToggleFavorite,
        handleMenuOpen,
        getActionIcon,
        getCategoryColor,
      ]
    );

    // Context7 Loading States
    if (isLoading) {
      return (
        <Box className={className}>
          <Stack spacing={spacing.lg / 8} mb={spacing.xl / 8}>
            <Box>
              <Skeleton
                variant="text"
                width="min(240px, 60vw)"
                height={32}
                sx={{
                  borderRadius: spacing.sm / 8,
                  animation: "contextPulse 2s ease-in-out infinite",
                  "@keyframes contextPulse": {
                    "0%, 100%": { opacity: 0.3 },
                    "50%": { opacity: 0.6 },
                  },
                }}
              />
              <Skeleton
                variant="text"
                width="min(360px, 80vw)"
                height={20}
                sx={{
                  mt: spacing.xs / 8,
                  borderRadius: spacing.xs / 8,
                  animation: "contextPulse 2s ease-in-out infinite 0.3s",
                }}
              />
            </Box>
          </Stack>

          <Grid container spacing={spacing.md / 8}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={isCompact ? 6 : 3} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={isCompact ? 120 : 160}
                  sx={{
                    borderRadius: spacing.md / 8,
                    animation: `contextSlideIn 0.6s ease-out ${
                      index * 0.1
                    }s both`,
                    "@keyframes contextSlideIn": {
                      "0%": {
                        opacity: 0,
                        transform: "translateY(20px)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    // Context7 Error State
    if (isError) {
      return (
        <Box className={className}>
          <Alert
            severity="error"
            sx={{
              borderRadius: spacing.md / 8,
              border: `1px solid ${alpha(colors.accent.error, 0.2)}`,
              background: `linear-gradient(135deg, 
                ${alpha(colors.accent.error, 0.06)} 0%, 
                ${alpha(colors.accent.error, 0.03)} 100%)`,
              backdropFilter: "blur(20px)",
              boxShadow: colors.elevation.medium,
              "& .MuiAlert-icon": {
                fontSize: 32,
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t("errors.loadingError")}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {error?.message || "Unknown error"}
            </Typography>
          </Alert>
        </Box>
      );
    }

    return (
      <Card
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
          background: theme.palette.background.paper,
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
              <RocketLaunch sx={{ color: "white", fontSize: 20 }} />
            </Box>
          }
          title={
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1.1rem",
                color: theme.palette.text.primary,
              }}
            >
              {t("dashboard.quickActions.title", "Quick Actions")}
            </Typography>
          }
          subheader={
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
              }}
            >
              {t(
                "dashboard.quickActions.subtitle",
                "Frequently used functions"
              )}
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {/* Context7 Enhanced Actions Grid */}
          {showCategories ? (
            <Stack spacing={spacing.xl / 8}>
              {Object.entries(groupedActions).map(([cat, categoryActions]) => (
                <Box key={cat}>
                  <Typography
                    variant={isCompact ? "subtitle1" : "h6"}
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      mb: spacing.md / 8,
                      fontSize: isCompact ? "1rem" : "1.1rem",
                      letterSpacing: "-0.01em",
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.sm / 8,

                      "&::before": {
                        content: '""',
                        width: 4,
                        height: 20,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, 
                        ${getCategoryColor(cat as ActionCategory)} 0%, 
                        ${alpha(
                          getCategoryColor(cat as ActionCategory),
                          0.7
                        )} 100%)`,
                      },
                    }}
                  >
                    {t(`dashboard.categories.${cat}`, cat)}
                  </Typography>
                  <Grid container spacing={spacing.md / 8}>
                    {(categoryActions as QuickAction[]).map(
                      (action: QuickAction, index: number) =>
                        renderAction(action, index)
                    )}
                  </Grid>
                </Box>
              ))}
            </Stack>
          ) : (
            <Grid container spacing={spacing.md / 8}>
              {filteredActions.map((action, index) =>
                renderAction(action, index)
              )}
            </Grid>
          )}

          {/* Context7 Enhanced Context Menu */}
          <Menu
            anchorEl={menuAnchor?.element}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                borderRadius: spacing.md / 8,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                background: `linear-gradient(135deg, 
                ${alpha(colors.surface.elevated, 0.95)} 0%, 
                ${alpha(colors.surface.elevated, 0.85)} 100%)`,
                backdropFilter: "blur(20px)",
                boxShadow: colors.elevation.extreme,
                minWidth: 200,
                overflow: "hidden",
              },
            }}
          >
            {menuAnchor && (
              <>
                <MenuItem
                  onClick={() => handleActionClick(menuAnchor.action)}
                  sx={{
                    borderRadius: spacing.sm / 8,
                    mx: spacing.xs / 8,
                    my: spacing.xs / 8,
                    transition: `all ${animations.fast.duration}ms ${animations.fast.easing}`,
                    "&:hover": {
                      background: alpha(colors.accent.primary, 0.08),
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ color: colors.accent.primary, minWidth: 36 }}
                  >
                    <Launch fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ letterSpacing: "0.01em" }}
                    >
                      {t("common.open")}
                    </Typography>
                  </ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => handleToggleFavorite(menuAnchor.action.id)}
                  sx={{
                    borderRadius: spacing.sm / 8,
                    mx: spacing.xs / 8,
                    my: spacing.xs / 8,
                    transition: `all ${animations.fast.duration}ms ${animations.fast.easing}`,
                    "&:hover": {
                      background: alpha(colors.accent.warning, 0.08),
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: favoriteActions.has(menuAnchor.action.id)
                        ? colors.accent.warning
                        : "text.secondary",
                      minWidth: 36,
                    }}
                  >
                    {favoriteActions.has(menuAnchor.action.id) ? (
                      <Star fontSize="small" />
                    ) : (
                      <StarBorder fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ letterSpacing: "0.01em" }}
                    >
                      {favoriteActions.has(menuAnchor.action.id)
                        ? t("common.removeFromFavorites")
                        : t("common.addToFavorites")}
                    </Typography>
                  </ListItemText>
                </MenuItem>

                {menuAnchor.action.shortcut && (
                  <>
                    <Divider sx={{ my: spacing.xs / 8 }} />
                    <MenuItem
                      disabled
                      sx={{
                        borderRadius: spacing.sm / 8,
                        mx: spacing.xs / 8,
                        my: spacing.xs / 8,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: theme.palette.text.secondary,
                          minWidth: 36,
                        }}
                      >
                        <Keyboard fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ letterSpacing: "0.01em" }}
                        >
                          {menuAnchor.action.shortcut}
                        </Typography>
                      </ListItemText>
                    </MenuItem>
                  </>
                )}
              </>
            )}
          </Menu>
        </CardContent>
      </Card>
    );
  }
);

QuickActionsWidget.displayName = "QuickActionsWidget";
