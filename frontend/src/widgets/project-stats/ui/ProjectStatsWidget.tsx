import React from 'react';
import { TrendingUp, Assignment, CheckCircle, Schedule, BugReport } from '@mui/icons-material';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  LinearProgress, 
  alpha, 
  useTheme, 
  Chip,
  Fade,
} from '@mui/material';
import { LiquidGlassIcon } from '@/shared/ui';

interface StatCard {
  id: string;
  title: string;
  value: number;
  total?: number;
  trend: number;
  icon: React.ElementType;
  color: string;
  unit?: string;
}

export const ProjectStatsWidget: React.FC = () => {
  const theme = useTheme();

  const stats: StatCard[] = [
    {
      id: 'requirements',
      title: 'Требования',
      value: 87,
      total: 120,
      trend: 12,
      icon: Assignment,
      color: theme.palette.primary.main,
      unit: '%',
    },
    {
      id: 'completed',
      title: 'Завершено',
      value: 64,
      total: 87,
      trend: 8,
      icon: CheckCircle,
      color: theme.palette.success.main,
      unit: '%',
    },
    {
      id: 'in-progress',
      title: 'В работе',
      value: 15,
      total: 87,
      trend: -3,
      icon: Schedule,
      color: theme.palette.warning.main,
      unit: '%',
    },
    {
      id: 'issues',
      title: 'Проблемы',
      value: 8,
      total: 87,
      trend: 5,
      icon: BugReport,
      color: theme.palette.error.main,
      unit: '%',
    },
  ];

  const getProgressValue = (stat: StatCard) => {
    if (stat.total) {
      return (stat.value / stat.total) * 100;
    }
    return stat.value;
  };

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.8)} 0%, 
          ${alpha(theme.palette.background.default, 0.4)} 100%
        )`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        // Light refraction effect
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.common.white, 0.05)} 0%, 
            transparent 100%
          )`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Статистика проекта
        </Typography>

        <Grid container spacing={2} sx={{ flex: 1 }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const progressValue = getProgressValue(stat);
            const isPositiveTrend = stat.trend >= 0;
            const trendColor = getTrendColor(stat.trend);

            return (
              <Grid item xs={12} sm={6} key={stat.id}>
                <Fade in timeout={800 + index * 200}>
                  <Box>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, 
                          ${alpha(theme.palette.background.paper, 0.6)} 0%, 
                          ${alpha(theme.palette.background.default, 0.3)} 100%
                        )`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: `linear-gradient(135deg, 
                            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                            ${alpha(theme.palette.background.default, 0.6)} 100%
                          )`,
                          border: `1px solid ${alpha(stat.color, 0.2)}`,
                          boxShadow: `
                            0 12px 32px ${alpha(stat.color, 0.15)},
                            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                          `,
                        },
                        // Light refraction on stat card
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '40%',
                          background: `linear-gradient(180deg, 
                            ${alpha(theme.palette.common.white, 0.08)} 0%, 
                            transparent 100%
                          )`,
                          pointerEvents: 'none',
                        },
                        // Stat color accent
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '60%',
                          height: '100%',
                          background: `radial-gradient(circle at top right, 
                            ${alpha(stat.color, 0.03)} 0%, 
                            transparent 70%
                          )`,
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
                        <LiquidGlassIcon
                          icon={Icon}
                          color={stat.color}
                          gradient={`linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`}
                          size={40}
                          variant="secondary"
                        />
                        
                        <Chip
                          label={`${isPositiveTrend ? '+' : ''}${stat.trend}%`}
                          size="small"
                          icon={<TrendingUp sx={{ 
                            transform: isPositiveTrend ? 'none' : 'scaleY(-1)',
                            fontSize: '0.9rem !important',
                          }} />}
                          sx={{
                            backgroundColor: alpha(trendColor, 0.1),
                            color: trendColor,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: 2,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(trendColor, 0.2)}`,
                            height: 24,
                          }}
                        />
                      </Box>

                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 700,
                              color: stat.color,
                              fontSize: '1.8rem',
                              lineHeight: 1,
                              background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                              backgroundClip: 'text',
                              textFillColor: 'transparent',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {stat.value}
                          </Typography>
                          {stat.total && (
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: alpha(theme.palette.text.secondary, 0.7),
                                fontWeight: 500,
                              }}
                            >
                              /{stat.total}
                            </Typography>
                          )}
                        </Box>

                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          {stat.title}
                        </Typography>

                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: alpha(theme.palette.text.secondary, 0.8),
                                fontWeight: 500,
                              }}
                            >
                              Прогресс
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: stat.color,
                                fontWeight: 600,
                              }}
                            >
                              {Math.round(progressValue)}%
                            </Typography>
                          </Box>
                          
                          <LinearProgress
                            variant="determinate"
                            value={progressValue}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(stat.color, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                                boxShadow: `0 2px 8px ${alpha(stat.color, 0.3)}`,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              </Grid>
            );
          })}
        </Grid>

        {/* Overall Project Health */}
        <Box sx={{ mt: 3, p: 2, borderRadius: 3, background: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: theme.palette.info.main,
              fontWeight: 600,
              mb: 1,
              textAlign: 'center',
            }}
          >
            Общее состояние проекта: Хорошее
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha(theme.palette.text.secondary, 0.8),
              textAlign: 'center',
              display: 'block',
            }}
          >
            Проект выполняется в соответствии с планом
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 