/**
 * ReportCard - Карточка отчета (MUI версия)
 * UI компонент для отображения краткой информации об отчете
 */

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  LinearProgress,
  IconButton,
  Fade,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RegenerateIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Settings as GeneratingIcon,
  Cancel as CancelledIcon,
  AccessTime as ExpiredIcon,
  Folder as ProjectIcon,
  Person as PersonIcon,
  FilePresent as FileIcon,
  AccessTime,
} from "@mui/icons-material";
import {
  Report,
  ReportGenerationJob,
  getReportTypeText,
  getReportTypeIcon,
  getReportTypeColor,
  getReportFormatText,
  getReportFormatIcon,
  getReportStatusText,
  getReportStatusColor,
  getReportStatusIcon,
  isReportReady,
  isReportGenerating,
  hasReportFailed,
  isReportExpired,
  canDownloadReport,
  formatFileSize,
  getFileSizeColorClass,
  formatGenerationTime,
  getTimeUntilExpiration,
} from "../model";
import {
  APP_COLORS,
  cardStyles,
  buttonStyles,
  badgeStyles,
  progressStyles,
  iconStyles,
  createGradientBackground,
  animations,
} from "@/shared/styles/commonStyles";

// =============================================================================
// Types
// =============================================================================

export interface ReportCardProps {
  report: Report;
  generationJob?: ReportGenerationJob;
  onView?: (report: Report) => void;
  onDownload?: (report: Report) => void;
  onRegenerate?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  onShare?: (report: Report) => void;
  showActions?: boolean;
  variant?: "default" | "compact";
  className?: string;
  pagesCount?: number;
}

// =============================================================================
// Configurations
// =============================================================================

const STATUS_CONFIG = {
  pending: {
    color: APP_COLORS.status.pending,
    icon: PendingIcon,
    label: "Ожидает",
  },
  generating: {
    color: APP_COLORS.accent.info,
    icon: GeneratingIcon,
    label: "Генерируется",
  },
  completed: {
    color: APP_COLORS.status.active,
    icon: CompletedIcon,
    label: "Готов",
  },
  failed: {
    color: APP_COLORS.status.failed,
    icon: ErrorIcon,
    label: "Ошибка",
  },
  cancelled: {
    color: APP_COLORS.status.inactive,
    icon: CancelledIcon,
    label: "Отменен",
  },
  expired: {
    color: APP_COLORS.accent.warning,
    icon: ExpiredIcon,
    label: "Истек",
  },
} as const;

const FORMAT_COLORS = {
  pdf: APP_COLORS.accent.error,
  html: APP_COLORS.accent.info,
  docx: APP_COLORS.accent.primary,
  xlsx: APP_COLORS.accent.success,
  json: APP_COLORS.accent.secondary,
  csv: APP_COLORS.accent.warning,
  xml: APP_COLORS.accent.orange,
} as const;

// =============================================================================
// Component
// =============================================================================

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  generationJob,
  onView,
  onDownload,
  onRegenerate,
  onDelete,
  onShare,
  showActions = true,
  variant = "default",
  className,
  pagesCount,
}) => {
  const theme = useTheme();
  const typeText = getReportTypeText(report.type);
  const typeIcon = getReportTypeIcon(report.type);
  const typeColor = getReportTypeColor(report.type);
  const formatText = getReportFormatText(report.format);
  const formatIcon = getReportFormatIcon(report.format);

  const isReady = isReportReady(report);
  const isGenerating = isReportGenerating(report);
  const hasFailed = hasReportFailed(report);
  const isExpired = isReportExpired(report);
  const canDownload = canDownloadReport(report);

  const fileSize = formatFileSize(report.file_size);
  const fileSizeColor = getFileSizeColorClass(report.file_size);
  const timeUntilExpiration = getTimeUntilExpiration(report.expires_at);

  const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
  const formatColor = FORMAT_COLORS[report.format] || APP_COLORS.accent.primary;

  if (variant === "compact") {
    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            ...cardStyles.base,
            ...cardStyles.hover,
            p: 2,
            opacity: isExpired ? 0.6 : 1,
            ...animations.fadeIn,
            cursor: onView ? "pointer" : "default",
          }}
          onClick={onView ? () => onView(report) : undefined}
          className={className}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ fontSize: "1.5rem" }}>{typeIcon}</Box>
              <Box sx={{ fontSize: "1.25rem" }}>{formatIcon}</Box>
            </Stack>

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
                {report.name || `${typeText} отчет`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.875rem",
                }}
              >
                {formatText} • {fileSize}
              </Typography>
            </Box>

            <Chip
              icon={<statusConfig.icon sx={{ fontSize: "1rem !important" }} />}
              label={statusConfig.label}
              size="small"
              sx={badgeStyles.colored(statusConfig.color)}
            />

            {showActions && canDownload && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(report);
                }}
                sx={{
                  color: APP_COLORS.accent.success,
                  "&:hover": {
                    backgroundColor: alpha(APP_COLORS.accent.success, 0.1),
                  },
                }}
              >
                <DownloadIcon fontSize="small" />
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
          opacity: isExpired ? 0.6 : 1,
          ...animations.fadeIn,
        }}
        className={className}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{ fontSize: "2rem", display: "flex", alignItems: "center" }}
              >
                {typeIcon}
              </Box>
              <Box
                sx={{
                  ...iconStyles.small(formatColor),
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {formatIcon}
                </Box>
              </Box>
            </Stack>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
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
                {report.name || `${typeText} отчет`}
              </Typography>

              {report.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                    mb: 1,
                  }}
                >
                  {report.description}
                </Typography>
              )}

              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                <Chip
                  icon={
                    <statusConfig.icon sx={{ fontSize: "1rem !important" }} />
                  }
                  label={statusConfig.label}
                  size="small"
                  sx={badgeStyles.colored(statusConfig.color)}
                />
                <Chip
                  label={formatText}
                  size="small"
                  variant="outlined"
                  sx={badgeStyles.colored(formatColor, "outlined")}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack spacing={2}>
            {/* Project Info */}
            {report.project && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ProjectIcon
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
                  {report.project.name} ({report.project.code})
                </Typography>
              </Stack>
            )}

            {/* Generation Progress */}
            {isGenerating && generationJob && (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    Прогресс генерации
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    {generationJob.progress}%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={generationJob.progress}
                  sx={{
                    ...progressStyles.colored(APP_COLORS.accent.info),
                    mb: 1,
                  }}
                />

                {generationJob.current_step && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                    }}
                  >
                    {generationJob.current_step}
                  </Typography>
                )}
              </Box>
            )}

            {/* Error Message */}
            {hasFailed && report.error_message && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: alpha(APP_COLORS.status.failed, 0.1),
                  border: `1px solid ${alpha(APP_COLORS.status.failed, 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <ErrorIcon
                    sx={{
                      fontSize: "1rem",
                      color: APP_COLORS.status.failed,
                      mt: 0.1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: APP_COLORS.status.failed,
                      fontSize: "0.875rem",
                    }}
                  >
                    <strong>Ошибка:</strong> {report.error_message}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* File Info */}
            {isReady && (
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
                    Размер файла
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FileIcon sx={{ fontSize: "1rem", color: formatColor }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: formatColor }}
                    >
                      {fileSize}
                    </Typography>
                  </Stack>
                </Box>

                {pagesCount && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        display: "block",
                      }}
                    >
                      Страниц
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {pagesCount}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Generation Time */}
            {generationJob?.processing_time_ms && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Время генерации:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  {formatGenerationTime(generationJob.processing_time_ms)}
                </Typography>
              </Stack>
            )}

            {/* Expiration */}
            {timeUntilExpiration && (
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime
                  sx={{
                    fontSize: "1rem",
                    color: isExpired
                      ? APP_COLORS.status.failed
                      : APP_COLORS.accent.warning,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: isExpired
                      ? APP_COLORS.status.failed
                      : APP_COLORS.accent.warning,
                    fontWeight: 500,
                  }}
                >
                  {isExpired
                    ? "Истек"
                    : `Истекает через ${timeUntilExpiration}`}
                </Typography>
              </Stack>
            )}

            {/* Creator */}
            {report.generated_by_user && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon
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
                  Создал:{" "}
                  {report.generated_by_user.full_name ||
                    report.generated_by_user.username}
                </Typography>
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
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {onView && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => onView(report)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.primary)}
                  >
                    Просмотр
                  </Button>
                )}
                {onDownload && canDownload && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => onDownload(report)}
                    sx={{
                      ...buttonStyles.primary,
                      background: createGradientBackground(
                        APP_COLORS.accent.success,
                        APP_COLORS.accent.info
                      ),
                    }}
                  >
                    Скачать
                  </Button>
                )}
                {onShare && isReady && !isExpired && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => onShare(report)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.info)}
                  >
                    Поделиться
                  </Button>
                )}
                {onRegenerate && (hasFailed || isExpired) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RegenerateIcon />}
                    onClick={() => onRegenerate(report)}
                    sx={buttonStyles.outlined(APP_COLORS.accent.warning)}
                  >
                    Пересоздать
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(report)}
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
                {new Date(report.created_at).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Fade>
  );
};
