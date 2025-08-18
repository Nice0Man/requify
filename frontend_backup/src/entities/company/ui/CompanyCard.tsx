/**
 * CompanyCard - Карточка компании (MUI версия)
 * UI компонент для отображения краткой информации о компании
 */

import React, {memo} from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Avatar,
  IconButton,
  Fade,
  alpha,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import {
  Company,
  getCompanyTypeText,
  formatEmployeeCount,
  isCompanyActive,
  CompanyWithDetails,
} from "../model";
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

export interface CompanyCardProps {
  company: CompanyWithDetails;
  onView?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onSettings?: (company: Company) => void;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export const CompanyCard = memo(({
  company,
  onView,
  onEdit,
  onDelete,
  onSettings,
  showActions = true,
  variant = "default",
  className,
}: CompanyCardProps) => {
  const theme = useTheme();
  const typeLabel = getCompanyTypeText(company.type);
  const isActive = isCompanyActive(company);
  const employeeCount = formatEmployeeCount(company.employee_count || 0);

  const getStatusChipProps = () => {
    const colorMap = {
      active: APP_COLORS.status.active,
      inactive: APP_COLORS.status.inactive,
      suspended: APP_COLORS.status.failed,
      trial: APP_COLORS.status.pending,
      archived: APP_COLORS.status.inactive,
    };

    const statusLabels = {
      active: "Активная",
      inactive: "Неактивная",
      suspended: "Заблокирована",
      trial: "Пробная",
      archived: "Архивирована",
    };

    const color = colorMap[company.status] || APP_COLORS.status.inactive;

    return {
      label: statusLabels[company.status] || company.status,
      sx: badgeStyles.colored(color),
    };
  };

  const getTypeChipProps = () => ({
    label: typeLabel,
    variant: "outlined" as const,
    sx: {
      ...badgeStyles.base,
      borderColor: alpha(APP_COLORS.accent.info, 0.3),
      color: APP_COLORS.accent.info,
      backgroundColor: alpha(APP_COLORS.accent.info, 0.05),
    },
  });

  const companyInitials = company.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (variant === "compact") {
    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            ...cardStyles.base,
            ...cardStyles.hover,
            p: 2,
            opacity: isActive ? 1 : 0.7,
            ...animations.fadeIn,
            cursor: onView ? "pointer" : "default",
          }}
          onClick={onView ? () => onView(company) : undefined}
          className={className}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: createGradientBackground(
                  APP_COLORS.accent.primary,
                  APP_COLORS.accent.purple
                ),
                fontSize: "1rem",
                fontWeight: 600,
              }}
              src={company.branding?.logo_url}
            >
              {!company.branding?.logo_url && companyInitials}
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
                {company.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.875rem",
                }}
              >
                {employeeCount} сотрудников
              </Typography>
            </Box>

            <Chip {...getStatusChipProps()} size="small" />

            {showActions && (
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(APP_COLORS.accent.primary, 0.1),
                  },
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
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
                <Avatar
                  sx={{
                    ...iconStyles.container(APP_COLORS.accent.primary, 56),
                  }}
                  src={company.branding?.logo_url}
                >
                  {!company.branding?.logo_url && companyInitials}
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
                    {company.name}
                  </Typography>
                  {company.description && (
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
                      {company.description}
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
                {company.employee_count && (
                  <Chip
                    icon={<PeopleIcon sx={{ fontSize: "1rem !important" }} />}
                    label={employeeCount}
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
            {/* Company Details */}
            {(company.contacts?.find((contact) => contact.is_primary)
              ?.address ||
              company.contacts?.find((contact) => contact.is_primary)
                ?.website ||
              company.contacts?.find((contact) => contact.is_primary)
                ?.phone) && (
              <Stack spacing={1}>
                {company.contacts?.find((contact) => contact.is_primary)
                  ?.address && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationIcon
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
                      {
                        company.contacts?.find((contact) => contact.is_primary)
                          ?.address
                      }
                    </Typography>
                  </Stack>
                )}

                {company.contacts?.find((contact) => contact.is_primary)
                  ?.website && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WebsiteIcon
                      sx={{
                        fontSize: "1rem",
                        color: theme.palette.text.secondary,
                      }}
                    />
                    <Typography
                      variant="body2"
                      component="a"
                      href={
                        company.contacts?.find((contact) => contact.is_primary)
                          ?.website
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: APP_COLORS.accent.primary,
                        textDecoration: "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {
                        company.contacts?.find((contact) => contact.is_primary)
                          ?.website
                      }
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}

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
                    onClick={() => onView(company)}
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
                    onClick={() => onEdit(company)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.secondary)}
                  >
                    Редактировать
                  </Button>
                )}
                {onSettings && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => onSettings(company)}
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
                    onClick={() => onDelete(company)}
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
                Создана:{" "}
                {new Date(company.created_at).toLocaleDateString("ru-RU", {
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
});
