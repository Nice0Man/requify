import React, { memo, useMemo, useCallback, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Chip,
} from "@mui/material";
import {
  Add,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Assessment,
  TrendingUp,
  Speed,
  Upload,
  Dashboard as DashboardIcon,
  InsertChart,
  BarChart,
  FileDownload,
  Settings,
  ImportExport,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useNavigate } from "react-router-dom";

import type { QuickAction } from "@/entities/dashboard";
import { ActionCategory } from "@/entities/dashboard";

interface QuickActionsWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  maxActions?: number;
  showCategories?: boolean;
  showShortcuts?: boolean;
  className?: string;
  onActionClick?: (action: QuickAction) => void;
}

export const QuickActionsWidget = memo<QuickActionsWidgetProps>(
  ({
    variant = "detailed",
    maxActions = 9,
    showCategories = true,
    showShortcuts = true,
    onActionClick,
    className,
  }) => {
    const t = i18n.t;
    const theme = useTheme();
    const navigate = useNavigate();

    const isCompact = variant === "compact" || variant === "minimal";

    // Mock actions data with balanced Create, Analyze, and Manage categories
    const mockActions: QuickAction[] = useMemo(() => [
      // Create Actions
      {
        id: "create-project",
        title: "Создать проект",
        description: "Создать новый проект",
        icon: "Add",
        path: "/projects/create",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+P",
      },
      {
        id: "create-requirement",
        title: "Создать требование", 
        description: "Добавить новое требование",
        icon: "Assignment",
        path: "/requirements/create",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+R",
      },
      {
        id: "create-release",
        title: "Создать релиз",
        description: "Создать новый релиз",
        icon: "RocketLaunch",
        path: "/releases/create", 
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+L",
      },
      {
        id: "create-test-case",
        title: "Создать тест-кейс",
        description: "Создать новый тест-кейс",
        icon: "BugReport",
        path: "/testing/create",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+T",
      },
      // Analyze Actions
      {
        id: "analytics-dashboard",
        title: "Аналитика",
        description: "Просмотр аналитики и отчетов",
        icon: "Analytics",
        path: "/analytics",
        category: ActionCategory.ANALYZE,
        shortcut: "Ctrl+A",
      },
      {
        id: "project-metrics",
        title: "Метрики проекта",
        description: "Анализ показателей проекта",
        icon: "Assessment",
        path: "/analytics/projects",
        category: ActionCategory.ANALYZE,
        shortcut: "Ctrl+M",
      },
      {
        id: "progress-reports",
        title: "Отчеты прогресса",
        description: "Просмотр отчетов о прогрессе",
        icon: "TrendingUp",
        path: "/reports/progress",
        category: ActionCategory.ANALYZE,
        shortcut: "Ctrl+G",
      },
      // Manage Actions
      {
        id: "import-requirements",
        title: "Импорт требований",
        description: "Импортировать требования из файла",
        icon: "Upload",
        path: "/requirements/import",
        category: ActionCategory.MANAGE,
        shortcut: "Ctrl+I",
      },
      {
        id: "export-data",
        title: "Экспорт данных",
        description: "Экспорт проектных данных",
        icon: "FileDownload",
        path: "/export",
        category: ActionCategory.MANAGE,
        shortcut: "Ctrl+E",
      },
    ], []);

    // Filter and categorize actions
    const filteredActions = useMemo(() => {
      return mockActions.slice(0, maxActions);
    }, [mockActions, maxActions]);

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

    // Helper functions
    const getCategoryColor = useCallback(
      (category: ActionCategory) => {
        switch (category) {
          case ActionCategory.CREATE:
            return theme.palette.primary.main;
          case ActionCategory.ANALYZE:
            return theme.palette.info.main;
          case ActionCategory.MANAGE:
            return theme.palette.success.main;
          default:
            return theme.palette.secondary.main;
        }
      },
      [theme.palette]
    );

    const getActionIcon = useCallback((iconName: string) => {
      const iconMap: Record<string, React.ReactNode> = {
        Add: <Add />,
        Assignment: <Assignment />,
        RocketLaunch: <RocketLaunch />,
        BugReport: <BugReport />,
        Analytics: <Analytics />,
        Assessment: <Assessment />,
        TrendingUp: <TrendingUp />,
        Upload: <Upload />,
        FileDownload: <FileDownload />,
        Settings: <Settings />,
        ImportExport: <ImportExport />,
      };
      return iconMap[iconName] || <Add />;
    }, []);

    const getCategoryTitle = useCallback((category: ActionCategory) => {
      switch (category) {
        case ActionCategory.CREATE:
          return "Create";
        case ActionCategory.ANALYZE:
          return "Analyze";
        case ActionCategory.MANAGE:
          return "Manage";
        default:
          return category;
      }
    }, []);

    // Action Card component - matching Key Metrics style
    const renderAction = useCallback(
      (action: QuickAction, index: number) => {
        const actionColor = getCategoryColor(action.category || ActionCategory.CREATE);

        return (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={action.id}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 320 }}>
              <Card
                onClick={() => handleActionClick(action)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: theme.palette.background.paper,
                  height: 180,
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.12)}`,
                    borderColor: alpha(actionColor, 0.2),
                  },
                }}
              >
                <CardContent
                  sx={{ 
                    p: 3, 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    {/* Header */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          background: `linear-gradient(135deg, ${alpha(
                            actionColor,
                            0.1
                          )}, ${alpha(actionColor, 0.05)})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid ${alpha(actionColor, 0.1)}`,
                        }}
                      >
                        <Box
                          sx={{ 
                            color: actionColor, 
                            fontSize: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getActionIcon(action.icon)}
                        </Box>
                      </Box>

                      {/* Shortcut chip */}
                      {showShortcuts && action.shortcut && (
                        <Chip
                          label={action.shortcut}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.75rem",
                            height: 24,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            "& .MuiChip-label": { px: 1 },
                            borderRadius: 1.5,
                            borderColor: alpha(actionColor, 0.2),
                            color: actionColor,
                          }}
                        />
                      )}
                    </Box>

                    {/* Content */}
                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          fontSize: isCompact ? "1rem" : "1.125rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {action.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          letterSpacing: "0.02em",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Stack>

                    {/* Category indicator */}
                    <Box
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${actionColor}, ${alpha(
                          actionColor,
                          0.7
                        )})`,
                        opacity: 0.6,
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        );
      },
      [
        theme.palette,
        isCompact,
        showShortcuts,
        handleActionClick,
        getActionIcon,
        getCategoryColor,
      ]
    );

    return (
      <Box className={className} sx={{ width: "100%" }}>
        {/* Container with same styling as Key Metrics */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: theme.palette.background.paper,
            width: "100%",
          }}
        >
          <Stack spacing={3}>
            {/* Header Section - matching Key Metrics pattern */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
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
                      fontSize: isCompact ? "1.25rem" : "1.5rem",
                    }}
                  >
                    {t("dashboard.quickActions.title", "Quick Actions")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.875rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t("dashboard.quickActions.subtitle", "Frequently used functions")}
                </Typography>
              </Stack>
            </Box>

            {/* Content Section */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* Actions Grid - matching Key Metrics centered layout */}
              {showCategories ? (
                <Box sx={{ width: "100%" }}>
                  <Stack spacing={4}>
                    {Object.entries(groupedActions).map(
                      ([cat, categoryActions]) => (
                        <Box key={cat}>
                          <Typography
                            variant={isCompact ? "subtitle1" : "h6"}
                            sx={{
                              color: "text.primary",
                              fontWeight: 600,
                              mb: 2,
                              fontSize: isCompact ? "1rem" : "1.1rem",
                              letterSpacing: "-0.01em",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,

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
                            {getCategoryTitle(cat as ActionCategory)}
                          </Typography>
                          <Grid 
                            container 
                            spacing={3} 
                            alignItems="stretch"
                            justifyContent="flex-start"
                            sx={{
                              maxWidth: "100%",
                              width: "100%",
                            }}
                          >
                            {(categoryActions as QuickAction[]).map(
                              (action: QuickAction, index: number) =>
                                renderAction(action, index)
                            )}
                          </Grid>
                        </Box>
                      )
                    )}
                  </Stack>
                </Box>
              ) : (
                <Grid 
                  container 
                  spacing={3} 
                  alignItems="stretch"
                  justifyContent="flex-start"
                  sx={{
                    maxWidth: "100%",
                    width: "100%",
                  }}
                >
                  {filteredActions.map((action, index) =>
                    renderAction(action, index)
                  )}
                </Grid>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }
);

QuickActionsWidget.displayName = "QuickActionsWidget";

export default QuickActionsWidget;
