import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  alpha,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Add,
  Assignment,
  Group,
  Settings,
  BugReport,
  Analytics,
  RocketLaunch,
  MoreVert,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { DashboardMode, DashboardDensity } from "@/widgets/dashboard-container";
import { useDashboardSizing, useCardSizing } from "@/shared/hooks";

// Types
enum ActionCategory {
  CREATE = "create",
  MANAGE = "manage",
  ANALYZE = "analyze",
  CONFIGURE = "configure",
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  category: ActionCategory;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string | number;
  color?: string;
  priority?: number;
}

interface QuickActionsWidgetProps {
  variant?: "minimal" | "compact" | "detailed";
  mode?: DashboardMode;
  density?: DashboardDensity;
  layout?: "grid" | "list" | "masonry";
  maxActions?: number;
  showCategories?: boolean;
  showShortcuts?: boolean;
  onActionClick?: (action: QuickAction) => void;
  className?: string;
  // New masonry support
  masonry?: boolean;
  flexible?: boolean;
  maxHeight?: number;
  overflow?: string;
}

export const QuickActionsWidget = memo<QuickActionsWidgetProps>(
  ({
    variant = "detailed",
    mode = "detailed",
    density = "comfortable",
    layout = "grid",
    maxActions = 9,
    showCategories = true,
    showShortcuts = true,
    onActionClick,
    className,
    masonry = false,
    flexible = false,
    maxHeight,
    overflow = "visible",
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    
    // New adaptive sizing system
    const sizing = useDashboardSizing({ 
      mode, 
      density, 
      layout, 
      masonry, 
      flexible 
    });
    
    const cardSizing = useCardSizing(mode, density, masonry);

    // State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<ActionCategory | "all">("all");

    const isCompact = variant === "minimal" || mode === "minimal";

    // Define quick actions with priorities for masonry
    const quickActions = useMemo((): QuickAction[] => {
      return [
        {
          id: "create-project",
          title: t("quickActions.createProject", "Create Project"),
          description: t("quickActions.createProjectDesc", "Start a new project"),
          icon: <Add />,
          category: ActionCategory.CREATE,
          shortcut: "Ctrl+N",
          onClick: () => console.log("Create project"),
          color: theme.palette.primary.main,
          priority: 1,
        },
        {
          id: "create-requirement",
          title: t("quickActions.createRequirement", "New Requirement"),
          description: t("quickActions.createRequirementDesc", "Add requirement"),
          icon: <Assignment />,
          category: ActionCategory.CREATE,
          shortcut: "Ctrl+R",
          onClick: () => console.log("Create requirement"),
          color: theme.palette.secondary.main,
          priority: 2,
        },
        {
          id: "manage-team",
          title: t("quickActions.manageTeam", "Team Management"),
          description: t("quickActions.manageTeamDesc", "Manage team members"),
          icon: <Group />,
          category: ActionCategory.MANAGE,
          onClick: () => console.log("Manage team"),
          color: theme.palette.info.main,
          priority: 3,
        },
        {
          id: "view-analytics",
          title: t("quickActions.viewAnalytics", "Analytics"),
          description: t("quickActions.viewAnalyticsDesc", "View project analytics"),
          icon: <Analytics />,
          category: ActionCategory.ANALYZE,
          onClick: () => console.log("View analytics"),
          color: theme.palette.success.main,
          priority: 4,
        },
        {
          id: "system-settings",
          title: t("quickActions.systemSettings", "Settings"),
          description: t("quickActions.systemSettingsDesc", "Configure system"),
          icon: <Settings />,
          category: ActionCategory.CONFIGURE,
          onClick: () => console.log("System settings"),
          color: theme.palette.warning.main,
          priority: 5,
        },
        {
          id: "report-bug",
          title: t("quickActions.reportBug", "Report Bug"),
          description: t("quickActions.reportBugDesc", "Submit bug report"),
          icon: <BugReport />,
          category: ActionCategory.MANAGE,
          onClick: () => console.log("Report bug"),
          color: theme.palette.error.main,
          priority: 6,
        },
        {
          id: "quick-deploy",
          title: t("quickActions.quickDeploy", "Quick Deploy"),
          description: t("quickActions.quickDeployDesc", "Deploy latest changes"),
          icon: <RocketLaunch />,
          category: ActionCategory.MANAGE,
          shortcut: "Ctrl+D",
          onClick: () => console.log("Quick deploy"),
          badge: "NEW",
          color: theme.palette.secondary.main,
          priority: 7,
        },
      ];
    }, [theme, t]);

    // Filter actions based on category and maxActions
    const filteredActions = useMemo(() => {
      let filtered = quickActions;
      
      if (selectedCategory !== "all") {
        filtered = filtered.filter(action => action.category === selectedCategory);
      }
      
      return filtered.slice(0, maxActions);
    }, [quickActions, selectedCategory, maxActions]);

    // Get category color helper
    const getCategoryColor = (category: ActionCategory): string => {
      switch (category) {
        case ActionCategory.CREATE:
          return theme.palette.primary.main;
        case ActionCategory.MANAGE:
          return theme.palette.info.main;
        case ActionCategory.ANALYZE:
          return theme.palette.success.main;
        case ActionCategory.CONFIGURE:
          return theme.palette.warning.main;
        default:
          return theme.palette.grey[500];
      }
    };

    // Handle action click
    const handleActionClick = useCallback((action: QuickAction) => {
      action.onClick();
      onActionClick?.(action);
    }, [onActionClick]);

    // Handle menu
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    // Responsive grid configuration using new sizing system
    const getGridConfig = () => {
      if (layout === "list") {
        return { xs: 12 }; // Full width for list
      }
      
      // Use sizing system for responsive grid
      const { columns } = sizing.gridConfig;
      
      // Improved responsive grid based on dashboard mode and screen size
      if (mode === "minimal") {
        return { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 };
      }
      
      if (mode === "compact") {
        return { xs: 12, sm: 6, md: 4, lg: 4, xl: 3 };
      }
      
      if (mode === "fullscreen") {
        return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
      }
      
      // Detailed mode - adaptive based on screen size and available columns
      if (columns >= 6) {
        return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
      } else if (columns >= 4) {
        return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
      } else if (columns >= 3) {
        return { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 };
      } else {
        return { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 };
      }
    };

    const gridConfig = getGridConfig();

    // Action Card component with new sizing
    const ActionCard: React.FC<{ action: QuickAction; index: number }> = ({ action, index }) => {
      const actionColor = action.color || getCategoryColor(action.category);

      return (
        <Card
          onClick={() => handleActionClick(action)}
          sx={{
            cursor: action.disabled ? "not-allowed" : "pointer",
            borderRadius: cardSizing.borderRadius,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: cardSizing.elevation,
            background: theme.palette.background.paper,
            height: "100%",
            minHeight: mode === "minimal" ? 120 : mode === "compact" ? 140 : cardSizing.minHeight,
            maxHeight: maxHeight || (mode === "minimal" ? 180 : mode === "compact" ? 220 : 280),
            overflow: overflow,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: action.disabled ? 0.6 : 1,
            "&:hover": action.disabled ? {} : {
              transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
              boxShadow: mode === "minimal" 
                ? `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`
                : `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              borderColor: alpha(actionColor, mode === "minimal" ? 0.15 : 0.2),
            },
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: mode === "minimal" ? 1.5 : cardSizing.padding.xs,
                sm: mode === "minimal" ? 2 : cardSizing.padding.sm,
                md: mode === "minimal" ? 2.5 : cardSizing.padding.md,
              },
              "&:last-child": { 
                pb: mode === "minimal" ? 1.5 : cardSizing.padding.sm 
              },
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack spacing={2} sx={{ height: "100%" }}>
              {/* Header */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box
                  sx={{
                    width: (mode === "minimal" ? 32 : mode === "compact" ? 36 : cardSizing.iconSize + 16),
                    height: (mode === "minimal" ? 32 : mode === "compact" ? 36 : cardSizing.iconSize + 16),
                    borderRadius: cardSizing.borderRadius,
                    background: `linear-gradient(135deg, ${alpha(actionColor, 0.1)}, ${alpha(actionColor, 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${alpha(actionColor, 0.1)}`,
                  }}
                >
                  {React.cloneElement(action.icon, {
                    sx: { 
                      color: actionColor, 
                      fontSize: mode === "minimal" ? 18 : mode === "compact" ? 20 : cardSizing.iconSize 
                    },
                  })}
                </Box>
                
                {/* Badge or Category */}
                {action.badge ? (
                  <Chip
                    label={action.badge}
                    size="small"
                    sx={{
                      backgroundColor: alpha(actionColor, 0.1),
                      color: actionColor,
                      fontSize: sizing.typography.caption,
                      fontWeight: 600,
                    }}
                  />
                ) : showCategories ? (
                  <Chip
                    label={action.category}
                    size="small"
                    variant="outlined"
                    sx={{
                      textTransform: "capitalize",
                      borderColor: alpha(actionColor, 0.2),
                      color: actionColor,
                      fontSize: sizing.typography.caption,
                    }}
                  />
                ) : null}
              </Box>

              {/* Title */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: sizing.typography.subtitle,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {action.title}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: sizing.typography.body,
                  color: theme.palette.text.secondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: isCompact ? 1 : 2,
                  WebkitBoxOrient: "vertical",
                  flex: 1,
                }}
              >
                {action.description}
              </Typography>

              {/* Footer */}
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{ mt: "auto" }}
              >
                {/* Shortcut */}
                {showShortcuts && action.shortcut && (
                  <Chip
                    label={action.shortcut}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: sizing.typography.caption,
                      fontFamily: "monospace",
                      color: theme.palette.text.secondary,
                      borderColor: alpha(theme.palette.divider, 0.3),
                    }}
                  />
                )}
                
                {/* Arrow indicator */}
                <KeyboardArrowRight
                  sx={{
                    color: actionColor,
                    fontSize: 20,
                    opacity: 0.7,
                    ml: "auto",
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      );
    };

    return (
      <Box className={className} sx={{ width: "100%", overflow: overflow }}>
        {/* Container with adaptive sizing */}
        <Box
          sx={{
            p: {
              xs: sizing.padding.xs,
              sm: sizing.padding.sm,
              md: sizing.padding.md,
            },
            borderRadius: sizing.borderRadius.medium,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: sizing.elevation.widget,
            width: "100%",
            maxHeight: maxHeight,
            overflow: overflow,
          }}
        >
          <Stack spacing={sizing.spacing}>
            {/* Header Section */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: sizing.headerHeight - 20,
                      height: sizing.headerHeight - 20,
                      borderRadius: sizing.borderRadius.small,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RocketLaunch sx={{ color: "white", fontSize: 18 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: sizing.typography.title,
                    }}
                  >
                    {t("dashboard.quickActions.title", "Quick Actions")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: sizing.typography.body,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t("dashboard.quickActions.subtitle", "Frequently used functions")}
                </Typography>
              </Stack>

              {/* Menu */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  borderRadius: sizing.borderRadius.small,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>

            {/* Category Filter */}
            {showCategories && (
              <Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label="All"
                    onClick={() => setSelectedCategory("all")}
                    variant={selectedCategory === "all" ? "filled" : "outlined"}
                    color={selectedCategory === "all" ? "primary" : "default"}
                    size="small"
                    sx={{ fontSize: sizing.typography.caption }}
                  />
                  {Object.values(ActionCategory).map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? "filled" : "outlined"}
                      color={selectedCategory === category ? "primary" : "default"}
                      size="small"
                      sx={{ 
                        textTransform: "capitalize",
                        fontSize: sizing.typography.caption,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Actions Grid */}
            <Box>
              {filteredActions.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: sizing.borderRadius.small }}>
                  {t("quickActions.noActions", "No actions available for the selected category.")}
                </Alert>
              ) : (
                <Grid 
                  container 
                  spacing={{
                    xs: sizing.spacing.xs,
                    sm: sizing.spacing.sm,
                    md: sizing.spacing.md,
                  }}
                >
                  {filteredActions.map((action, index) => (
                    <Grid item {...gridConfig} key={action.id}>
                      <ActionCard action={action} index={index} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Settings sx={{ mr: 2 }} />
            {t("quickActions.settings", "Settings")}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Add sx={{ mr: 2 }} />
            {t("quickActions.addCustom", "Add Custom Action")}
          </MenuItem>
        </Menu>
      </Box>
    );
  }
);

QuickActionsWidget.displayName = "QuickActionsWidget";
