import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  Add,
  Assignment,
  BugReport,
  Group,
  Settings,
  Analytics,
  Folder,
  Description,
  Build,
} from "@mui/icons-material";
import { LiquidGlassIcon } from "@/shared/ui";

interface ActionButton {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  action: () => void;
  description: string;
  category: "create" | "manage" | "analyze";
}

export const QuickActionsWidget = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const actions: ActionButton[] = [
    {
      id: "create-project",
      label: "Новый проект",
      icon: Add,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      action: () => console.log("Создать проект"),
      description: "Создать новый проект",
      category: "create",
    },
    {
      id: "create-requirement",
      label: "Требование",
      icon: Assignment,
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
      action: () => console.log("Создать требование"),
      description: "Добавить новое требование",
      category: "create",
    },
    {
      id: "create-test",
      label: "Тест-кейс",
      icon: BugReport,
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
      action: () => console.log("Создать тест"),
      description: "Создать новый тест-кейс",
      category: "create",
    },
    {
      id: "manage-team",
      label: "Команда",
      icon: Group,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
      action: () => console.log("Управление командой"),
      description: "Управление участниками",
      category: "manage",
    },
    {
      id: "project-settings",
      label: "Настройки",
      icon: Settings,
      color: theme.palette.grey[600],
      gradient: `linear-gradient(135deg, ${theme.palette.grey[600]}, ${theme.palette.grey[800]})`,
      action: () => console.log("Настройки проекта"),
      description: "Настройки проекта",
      category: "manage",
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: Analytics,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
      action: () => console.log("Открыть аналитику"),
      description: "Просмотр аналитики",
      category: "analyze",
    },
    {
      id: "documentation",
      label: "Документация",
      icon: Description,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
      action: () => console.log("Открыть документацию"),
      description: "Техническая документация",
      category: "analyze",
    },
    {
      id: "build-tools",
      label: "Сборка",
      icon: Build,
      color: theme.palette.text.secondary,
      gradient: `linear-gradient(135deg, ${
        theme.palette.text.secondary
      }, ${alpha(theme.palette.text.secondary, 0.8)})`,
      action: () => console.log("Инструменты сборки"),
      description: "Инструменты сборки",
      category: "manage",
    },
  ];

  const handleActionClick = (action: ActionButton) => {
    action.action();
  };

  const getCategoryConfig = (category: ActionButton["category"]) => {
    switch (category) {
      case "create":
        return {
          title: "Создание",
          color: theme.palette.primary.main,
          background: alpha(theme.palette.primary.main, 0.08),
        };
      case "manage":
        return {
          title: "Управление",
          color: theme.palette.secondary.main,
          background: alpha(theme.palette.secondary.main, 0.08),
        };
      case "analyze":
        return {
          title: "Анализ",
          color: theme.palette.success.main,
          background: alpha(theme.palette.success.main, 0.08),
        };
      default:
        return {
          title: "Действия",
          color: theme.palette.text.primary,
          background: alpha(theme.palette.text.primary, 0.08),
        };
    }
  };

  const groupedActions = actions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as Record<string, ActionButton[]>);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        // Authentic Liquid Glass background
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 0%, 
            ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 50%,
            ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 100%
          ),
          linear-gradient(225deg, 
            ${alpha(theme.palette.primary.main, 0.06)} 0%, 
            transparent 60%
          ),
          ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.85)}
        `,
        // Advanced backdrop filter
        backdropFilter: "blur(40px) saturate(150%) contrast(120%)",
        WebkitBackdropFilter: "blur(40px) saturate(150%) contrast(120%)",
        // Multi-layer border
        border: `1px solid ${alpha(
          theme.palette.common.white,
          isDark ? 0.15 : 0.25
        )}`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        // Enhanced shadow system
        boxShadow: `
          inset 0 1px 0 ${alpha(
            theme.palette.common.white,
            isDark ? 0.15 : 0.3
          )},
          inset 0 -1px 0 ${alpha(
            theme.palette.common.black,
            isDark ? 0.2 : 0.05
          )},
          0 4px 24px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)},
          0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)},
          0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}
        `,

        // Top light refraction
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: `
            linear-gradient(180deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.1)} 40%,
              transparent 100%
            )
          `,
          borderRadius: "20px 20px 0 0",
          pointerEvents: "none",
          mixBlendMode: "overlay",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <LiquidGlassIcon
            icon={Folder}
            color={theme.palette.primary.main}
            size={32}
            variant="secondary"
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${
                theme.palette.text.primary
              }, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `0 1px 2px ${alpha(
                theme.palette.common.black,
                isDark ? 0.3 : 0.1
              )}`,
            }}
          >
            Быстрые действия
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {Object.entries(groupedActions).map(
            ([category, categoryActions], categoryIndex) => {
              const categoryConfig = getCategoryConfig(
                category as ActionButton["category"]
              );

              return (
                <Fade in timeout={1000 + categoryIndex * 300} key={category}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: categoryConfig.color,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        textShadow: `0 1px 1px ${alpha(
                          theme.palette.common.black,
                          isDark ? 0.2 : 0.05
                        )}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&::before": {
                          content: '""',
                          width: 3,
                          height: 12,
                          borderRadius: 1.5,
                          background: `linear-gradient(135deg, ${
                            categoryConfig.color
                          }, ${alpha(categoryConfig.color, 0.7)})`,
                          boxShadow: `0 2px 8px ${alpha(
                            categoryConfig.color,
                            0.3
                          )}`,
                        },
                      }}
                    >
                      {categoryConfig.title}
                    </Typography>

                    <Grid container spacing={2}>
                      {categoryActions.map((action, index) => (
                        <Grid item xs={6} sm={4} key={action.id}>
                          <Fade
                            in
                            timeout={1200 + categoryIndex * 300 + index * 150}
                          >
                            <Button
                              onClick={() => handleActionClick(action)}
                              sx={{
                                width: "100%",
                                height: 80,
                                borderRadius: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                position: "relative",
                                overflow: "hidden",
                                textTransform: "none",
                                // Liquid Glass action button
                                background: `
                                linear-gradient(135deg, 
                                  ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.1 : 0.2
                                  )} 0%, 
                                  ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.03 : 0.08
                                  )} 50%,
                                  ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.06 : 0.15
                                  )} 100%
                                ),
                                linear-gradient(225deg, 
                                  ${alpha(action.color, 0.08)} 0%, 
                                  transparent 60%
                                ),
                                ${alpha(
                                  theme.palette.background.paper,
                                  isDark ? 0.4 : 0.7
                                )}
                              `,
                                backdropFilter: "blur(20px) saturate(120%)",
                                WebkitBackdropFilter:
                                  "blur(20px) saturate(120%)",
                                border: `1px solid ${alpha(
                                  action.color,
                                  0.12
                                )}`,
                                boxShadow: `
                                inset 0 1px 0 ${alpha(
                                  theme.palette.common.white,
                                  isDark ? 0.1 : 0.2
                                )},
                                inset 0 -1px 0 ${alpha(
                                  theme.palette.common.black,
                                  isDark ? 0.15 : 0.03
                                )},
                                0 2px 12px ${alpha(action.color, 0.1)},
                                0 1px 4px ${alpha(
                                  theme.palette.common.black,
                                  isDark ? 0.2 : 0.05
                                )}
                              `,
                                transition:
                                  "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",

                                "&:hover": {
                                  transform: "translateY(-3px) scale(1.03)",
                                  background: `
                                  linear-gradient(135deg, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.15 : 0.3
                                    )} 0%, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.08 : 0.15
                                    )} 50%,
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.1 : 0.22
                                    )} 100%
                                  ),
                                  linear-gradient(225deg, 
                                    ${alpha(action.color, 0.15)} 0%, 
                                    transparent 60%
                                  ),
                                  ${alpha(
                                    theme.palette.background.paper,
                                    isDark ? 0.6 : 0.85
                                  )}
                                `,
                                  backdropFilter:
                                    "blur(40px) saturate(150%) contrast(110%)",
                                  WebkitBackdropFilter:
                                    "blur(40px) saturate(150%) contrast(110%)",
                                  border: `1px solid ${alpha(
                                    action.color,
                                    0.25
                                  )}`,
                                  boxShadow: `
                                  inset 0 1px 0 ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.2 : 0.35
                                  )},
                                  inset 0 -1px 0 ${alpha(
                                    theme.palette.common.black,
                                    isDark ? 0.2 : 0.05
                                  )},
                                  0 8px 32px ${alpha(action.color, 0.25)},
                                  0 2px 12px ${alpha(
                                    theme.palette.common.black,
                                    isDark ? 0.3 : 0.08
                                  )},
                                  0 0 0 1px ${alpha(action.color, 0.2)},
                                  0 0 20px ${alpha(action.color, 0.15)}
                                `,
                                },

                                "&:active": {
                                  transform: "translateY(-1px) scale(1.01)",
                                  transition: "all 0.15s ease-out",
                                  backdropFilter: "blur(30px) saturate(130%)",
                                  WebkitBackdropFilter:
                                    "blur(30px) saturate(130%)",
                                },

                                // Top light refraction for button
                                "&::before": {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: "60%",
                                  background: `
                                  linear-gradient(180deg, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.08 : 0.15
                                    )} 0%, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.04 : 0.08
                                    )} 40%,
                                    transparent 100%
                                  )
                                `,
                                  borderRadius: "16px 16px 0 0",
                                  pointerEvents: "none",
                                  mixBlendMode: "overlay",
                                },

                                // Specular highlights on hover
                                "&::after": {
                                  content: '""',
                                  position: "absolute",
                                  top: -2,
                                  left: -2,
                                  right: -2,
                                  bottom: -2,
                                  background: `
                                  conic-gradient(from 45deg at 30% 30%, 
                                    ${alpha(action.color, 0.25)} 0deg,
                                    transparent 90deg,
                                    transparent 180deg,
                                    ${alpha(action.color, 0.2)} 270deg,
                                    transparent 360deg
                                  )
                                `,
                                  borderRadius: 18,
                                  opacity: 0,
                                  transition:
                                    "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                  pointerEvents: "none",
                                  zIndex: -1,
                                  filter: "blur(1px)",
                                },

                                "&:hover::after": {
                                  opacity: 1,
                                },
                              }}
                            >
                              {/* Icon with improved styling */}
                              <LiquidGlassIcon
                                icon={action.icon}
                                color={action.color}
                                size={48}
                                variant="secondary"
                              />

                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  color: theme.palette.text.primary,
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                  position: "relative",
                                  zIndex: 1,
                                  textShadow: `0 1px 2px ${alpha(
                                    theme.palette.common.black,
                                    isDark ? 0.3 : 0.1
                                  )}`,
                                  background: `linear-gradient(135deg, ${
                                    theme.palette.text.primary
                                  }, ${alpha(
                                    theme.palette.text.primary,
                                    0.8
                                  )})`,
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {action.label}
                              </Typography>
                            </Button>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              );
            }
          )}
        </Box>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${alpha(
              theme.palette.divider,
              isDark ? 0.08 : 0.12
            )}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: "0.7rem",
              textAlign: "center",
              display: "block",
              textShadow: `0 1px 1px ${alpha(
                theme.palette.common.black,
                isDark ? 0.1 : 0.02
              )}`,
            }}
          >
            Нажмите на действие для быстрого доступа
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
