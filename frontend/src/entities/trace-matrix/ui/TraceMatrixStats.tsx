/**
 * TraceMatrixStats - Статистика матрицы трассируемости (MUI версия)
 * UI компонент для отображения основных метрик трассируемости
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  LinearProgress,
  Grid,
  Fade,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AccountTree as MatrixIcon,
  Link as LinksIcon,
  RemoveCircle as OrphanIcon,
  Loop as CircularIcon,
  TrendingUp as CoverageIcon,
  Assessment as StatsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { TraceMatrixStatistics } from '../model';
import { 
  APP_COLORS, 
  cardStyles, 
  badgeStyles, 
  progressStyles,
  iconStyles,
  animations,
} from '@/shared/styles/commonStyles';

// =============================================================================
// Types
// =============================================================================

export interface TraceMatrixStatsProps {
  statistics: TraceMatrixStatistics;
  className?: string;
  showDetails?: boolean;
  variant?: 'default' | 'compact';
}

// =============================================================================
// Component
// =============================================================================

export const TraceMatrixStats: React.FC<TraceMatrixStatsProps> = ({
  statistics,
  className,
  showDetails = true,
  variant = 'default',
}) => {
  const theme = useTheme();
  const {
    total_requirements,
    total_links,
    coverage_percentage,
    orphan_requirements,
    circular_dependencies,
    requirements_by_type,
    average_connections_per_requirement,
    most_connected_requirement,
  } = statistics;

  const getCoverageColor = (percentage: number): string => {
    if (percentage >= 80) return APP_COLORS.status.active;
    if (percentage >= 60) return APP_COLORS.status.pending;
    if (percentage >= 40) return APP_COLORS.accent.warning;
    return APP_COLORS.status.failed;
  };

  const getCoverageLabel = (percentage: number): string => {
    if (percentage >= 80) return 'Отличное покрытие';
    if (percentage >= 60) return 'Хорошее покрытие';
    if (percentage >= 40) return 'Среднее покрытие';
    return 'Низкое покрытие';
  };

  const coverageColor = getCoverageColor(coverage_percentage);
  const coverageLabel = getCoverageLabel(coverage_percentage);

  if (variant === 'compact') {
    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            ...cardStyles.base,
            p: 2,
            ...animations.fadeIn,
          }}
          className={className}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                ...iconStyles.small(APP_COLORS.accent.indigo),
                borderRadius: 1.5,
              }}
            >
              <MatrixIcon sx={{ fontSize: '1.25rem', color: 'white' }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Матрица трассируемости
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                {total_requirements} требований • {total_links} связей
              </Typography>
            </Box>

            <Chip
              label={`${coverage_percentage.toFixed(1)}%`}
              size="small"
              sx={badgeStyles.colored(coverageColor)}
            />
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
          ...animations.fadeIn,
        }}
        className={className}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                ...iconStyles.medium(APP_COLORS.accent.indigo),
                borderRadius: 2,
              }}
            >
              <StatsIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
            </Box>
            
            <Box>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                Статистика трассируемости
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                Анализ покрытия и качества связей требований
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Stack spacing={3}>
            {/* Main Metrics */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
                    <MatrixIcon sx={{ fontSize: '1.25rem', color: APP_COLORS.accent.primary }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: APP_COLORS.accent.primary,
                      }}
                    >
                      {total_requirements}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                    }}
                  >
                    Требований
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
                    <LinksIcon sx={{ fontSize: '1.25rem', color: APP_COLORS.accent.purple }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: APP_COLORS.accent.purple,
                      }}
                    >
                      {total_links}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                    }}
                  >
                    Связей
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
                    <OrphanIcon sx={{ fontSize: '1.25rem', color: APP_COLORS.accent.warning }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: orphan_requirements > 0 ? APP_COLORS.accent.warning : APP_COLORS.status.active,
                      }}
                    >
                      {orphan_requirements}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                    }}
                  >
                    Без связей
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
                    <CircularIcon sx={{ fontSize: '1.25rem', color: APP_COLORS.status.failed }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: circular_dependencies > 0 ? APP_COLORS.status.failed : APP_COLORS.status.active,
                      }}
                    >
                      {circular_dependencies}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                    }}
                  >
                    Циклов
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Coverage */}
            <Box>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <CoverageIcon sx={{ fontSize: '1rem', color: coverageColor }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    Покрытие трассируемости
                  </Typography>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: coverageColor }}
                >
                  {coverage_percentage.toFixed(1)}%
                </Typography>
              </Stack>
              
              <LinearProgress
                variant="determinate"
                value={coverage_percentage}
                sx={{
                  ...progressStyles.colored(coverageColor),
                  mb: 1,
                }}
              />
              
              <Typography
                variant="caption"
                sx={{
                  color: coverageColor,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {coverageLabel}
              </Typography>
            </Box>

            {/* Details */}
            {showDetails && (
              <>
                {/* Average Connections */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Среднее связей на требование:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    {average_connections_per_requirement?.toFixed(1) || '0.0'}
                  </Typography>
                </Stack>

                {/* Most Connected Requirement */}
                {most_connected_requirement && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}
                    >
                      Наиболее связанное требование:
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: alpha(APP_COLORS.accent.primary, 0.1),
                        border: `1px solid ${alpha(APP_COLORS.accent.primary, 0.2)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {most_connected_requirement.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: APP_COLORS.accent.primary }}
                      >
                        {most_connected_requirement.connections} связей
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Requirements by Type */}
                {requirements_by_type && Object.keys(requirements_by_type).length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}
                    >
                      Требования по типам:
                    </Typography>
                    <Stack spacing={1}>
                      {Object.entries(requirements_by_type).map(([type, count]) => (
                        <Stack 
                          key={type} 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center"
                        >
                          <Chip
                            label={type}
                            variant="outlined"
                            size="small"
                            sx={{
                              ...badgeStyles.base,
                              borderColor: alpha(theme.palette.text.secondary, 0.2),
                              color: theme.palette.text.secondary,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                          >
                            {count}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Warnings */}
                <Stack spacing={1}>
                  {orphan_requirements > 0 && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WarningIcon sx={{ fontSize: '1rem', color: APP_COLORS.accent.warning }} />
                      <Typography
                        variant="body2"
                        sx={{ color: APP_COLORS.accent.warning, fontSize: '0.875rem' }}
                      >
                        {orphan_requirements} требований без связей
                      </Typography>
                    </Stack>
                  )}
                  
                  {circular_dependencies > 0 && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ErrorIcon sx={{ fontSize: '1rem', color: APP_COLORS.status.failed }} />
                      <Typography
                        variant="body2"
                        sx={{ color: APP_COLORS.status.failed, fontSize: '0.875rem' }}
                      >
                        Обнаружено {circular_dependencies} циклических зависимостей
                      </Typography>
                    </Stack>
                  )}
                  
                  {coverage_percentage < 50 && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InfoIcon sx={{ fontSize: '1rem', color: APP_COLORS.accent.info }} />
                      <Typography
                        variant="body2"
                        sx={{ color: APP_COLORS.accent.info, fontSize: '0.875rem' }}
                      >
                        Рекомендуется улучшить покрытие трассируемости
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Paper>
    </Fade>
  );
};