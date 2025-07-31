/**
 * DepartmentCard - Карточка департамента (MUI версия)
 * UI компонент для отображения краткой информации о департаменте
 */

import { memo } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Avatar,
  Fade,
  alpha,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  AccountTree as HierarchyIcon,
} from "@mui/icons-material";
import { Department, isDepartmentActive } from "../model";
import {
  APP_COLORS,
  cardStyles,
  buttonStyles,
  badgeStyles,
  iconStyles,
  createGradientBackground,
  animations,
} from "@/shared/styles/commonStyles";

// =============================================================================
// Types
// =============================================================================

export interface DepartmentCardProps {
  department: Department;
  onView?: (department: Department) => void;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
  onSettings?: (department: Department) => void;
  showActions?: boolean;
  showHierarchy?: boolean;
  variant?: "default" | "compact" | "hierarchical";
  level?: number;
  className?: string;
}

// =============================================================================
// Configurations
// =============================================================================

const TYPE_CONFIG = {
  development: {
    color: APP_COLORS.accent.primary,
    label: "Разработка",
    icon: "Code",
  },
  marketing: {
    color: APP_COLORS.accent.pink,
    label: "Маркетинг",
    icon: "TrendingUp",
  },
  sales: {
    color: APP_COLORS.accent.success,
    label: "Продажи",
    icon: "AttachMoney",
  },
  support: {
    color: APP_COLORS.accent.orange,
    label: "Поддержка",
    icon: "Headset",
  },
  hr: {
    color: APP_COLORS.accent.purple,
    label: "HR",
    icon: "Groups",
  },
  finance: {
    color: APP_COLORS.accent.warning,
    label: "Финансы",
    icon: "AccountBalance",
  },
  operations: {
    color: APP_COLORS.accent.info,
    label: "Операции",
    icon: "Settings",
  },
  legal: {
    color: APP_COLORS.accent.secondary,
    label: "Юридический",
    icon: "Gavel",
  },
  research: {
    color: APP_COLORS.accent.indigo,
    label: "Исследования",
    icon: "Science",
  },
  design: {
    color: APP_COLORS.accent.pink,
    label: "Дизайн",
    icon: "Palette",
  },
  qa: {
    color: APP_COLORS.accent.error,
    label: "Тестирование",
    icon: "BugReport",
  },
  devops: {
    color: APP_COLORS.accent.info,
    label: "DevOps",
    icon: "Rocket",
  },
  data: {
    color: APP_COLORS.accent.indigo,
    label: "Данные",
    icon: "Analytics",
  },
  product: {
    color: APP_COLORS.accent.primary,
    label: "Продукт",
    icon: "Inventory",
  },
  business: {
    color: APP_COLORS.accent.secondary,
    label: "Бизнес",
    icon: "Business",
  },
  administration: {
    color: APP_COLORS.status.inactive,
    label: "Администрация",
    icon: "CorporateFare",
  },
  customer_success: {
    color: APP_COLORS.accent.success,
    label: "Клиентский успех",
    icon: "Handshake",
  },
  procurement: {
    color: APP_COLORS.accent.warning,
    label: "Закупки",
    icon: "ShoppingCart",
  },
  security: {
    color: APP_COLORS.accent.error,
    label: "Безопасность",
    icon: "Security",
  },
  other: {
    color: APP_COLORS.status.inactive,
    label: "Другое",
    icon: "Folder",
  },
} as const;

// =============================================================================
// Component
// =============================================================================

export const DepartmentCard = memo(
  ({
    department,
    onView,
    onEdit,
    onDelete,
    onSettings,
    showActions = true,
    showHierarchy = false,
    variant = "default",
    level = 0,
    className,
  }: DepartmentCardProps) => {
    const theme = useTheme();
    const isActive = isDepartmentActive(department);
    const typeConfig = TYPE_CONFIG[department.type] || TYPE_CONFIG.other;

    const getStatusChipProps = () => ({
      label: isActive ? "Активный" : "Неактивный",
      sx: badgeStyles.colored(
        isActive ? APP_COLORS.status.active : APP_COLORS.status.inactive
      ),
    });

    const getTypeChipProps = () => ({
      label: `${typeConfig.icon} ${typeConfig.label}`,
      variant: "outlined" as const,
      sx: badgeStyles.colored(typeConfig.color, "outlined"),
    });

    // Отступ для иерархической структуры
    const hierarchyIndent = variant === "hierarchical" ? level * 24 : 0;

    if (variant === "compact") {
      return (
        <Fade in timeout={300}>
          <Paper
            elevation={0}
            sx={{
              ...cardStyles.base,
              ...cardStyles.hover,
              p: 2,
              ml: hierarchyIndent / 8, // Меньший отступ для компактного вида
              opacity: isActive ? 1 : 0.7,
              ...animations.fadeIn,
              cursor: onView ? "pointer" : "default",
            }}
            onClick={onView ? () => onView(department) : undefined}
            className={className}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {showHierarchy && level > 0 && (
                <Box
                  sx={{
                    width: 2,
                    height: 32,
                    backgroundColor: alpha(typeConfig.color, 0.3),
                    borderRadius: 1,
                  }}
                />
              )}

              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: createGradientBackground(
                    typeConfig.color,
                    alpha(typeConfig.color, 0.8)
                  ),
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {typeConfig.icon}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {department.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.875rem",
                  }}
                >
                  {department.employee_count || 0} сотрудников
                </Typography>
              </Box>

              <Chip {...getStatusChipProps()} size="small" />
            </Stack>
          </Paper>
        </Fade>
      );
    }

    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            ...cardStyles.base,
            ...cardStyles.hover,
            ml: hierarchyIndent / 8,
            opacity: isActive ? 1 : 0.7,
            ...animations.fadeIn,
          }}
          className={className}
        >
          {/* Header */}
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack direction="row" spacing={3} alignItems="flex-start">
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  {showHierarchy && level > 0 && (
                    <Box
                      sx={{
                        width: 3,
                        height: 56,
                        backgroundColor: alpha(typeConfig.color, 0.4),
                        borderRadius: 1.5,
                        mr: 1,
                      }}
                    />
                  )}

                  <Avatar
                    sx={{
                      ...iconStyles.container(typeConfig.color, 56),
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {typeConfig.icon}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {department.name}
                    </Typography>
                    {department.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                        }}
                      >
                        {department.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
                >
                  <Chip {...getStatusChipProps()} size="small" />
                  <Chip {...getTypeChipProps()} size="small" />
                  {department.employee_count && (
                    <Chip
                      icon={<PeopleIcon sx={{ fontSize: "1rem !important" }} />}
                      label={`${department.employee_count} сотрудников`}
                      variant="outlined"
                      size="small"
                      sx={{
                        ...badgeStyles.base,
                        borderColor: alpha(theme.palette.text.secondary, 0.2),
                        color: theme.palette.text.secondary,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ px: 3, pb: 2 }}>
            <Stack spacing={2}>
              {/* Department Details */}
              <Stack spacing={1}>
                {department.head && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Руководитель: {department.head.name}
                    </Typography>
                  </Stack>
                )}

                {showHierarchy && department.parent && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HierarchyIcon
                      sx={{
                        fontSize: "1rem",
                        color: theme.palette.text.secondary,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Подразделение: {department.parent.name}
                    </Typography>
                  </Stack>
                )}

                {department.location && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Местоположение: {department.location}
                  </Typography>
                )}
              </Stack>

              {/* Statistics */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.3),
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: "block",
                    }}
                  >
                    Команды
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    {department.team_count || 0}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: "block",
                    }}
                  >
                    Бюджет
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: typeConfig.color }}
                  >
                    {department.budget_allocated
                      ? `$${department.budget_allocated.toLocaleString()}`
                      : "Не указан"}
                  </Typography>
                </Box>
              </Box>

              {/* Actions */}
              {showActions && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    pt: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  {onView && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => onView(department)}
                      sx={buttonStyles.outlined(APP_COLORS.accent.primary)}
                    >
                      Просмотр
                    </Button>
                  )}
                  {onEdit && isActive && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(department)}
                      sx={buttonStyles.outlined(typeConfig.color)}
                    >
                      Редактировать
                    </Button>
                  )}
                  {onSettings && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => onSettings(department)}
                      sx={buttonStyles.outlined(APP_COLORS.accent.info)}
                    >
                      Настройки
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDelete(department)}
                      sx={buttonStyles.outlined(APP_COLORS.accent.error)}
                    >
                      Удалить
                    </Button>
                  )}
                </Stack>
              )}

              {/* Footer */}
              <Box
                sx={{
                  pt: 1,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                  }}
                >
                  Создан:{" "}
                  {new Date(department.created_at).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Fade>
    );
  }
);
