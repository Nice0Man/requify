import React from 'react';
import { Card, CardContent, Typography, Box, alpha, useTheme, Fade, LinearProgress, Grid, Chip } from '@mui/material';
import { TrendingUp, Assignment, CheckCircle, Schedule, BugReport } from '@mui/icons-material';

interface ProjectStat {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ElementType;
  trend: string;
}

export const ProjectStatsWidget: React.FC = () => {
  const theme = useTheme();

  const stats: ProjectStat[] = [
    {
      label: 'Требования',
      value: 145,
      total: 200,
      color: theme.palette.primary.main,
      icon: Assignment,
      trend: '+12%',
    },
    {
      label: 'Завершено',
      value: 89,
      total: 145,
      color: theme.palette.success.main,
      icon: CheckCircle,
      trend: '+8%',
    },
    {
      label: 'В работе',
      value: 34,
      total: 145,
      color: theme.palette.warning.main,
      icon: Schedule,
      trend: '+5%',
    },
    {
      label: 'Проблемы',
      value: 12,
      total: 145,
      color: theme.palette.error.main,
      icon: BugReport,
      trend: '-3%',
    },
  ];

  const getPercentage = (value: number, total: number) => Math.round((value / total) * 100);

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.4)} 100%)`,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
        },
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Статистика проекта
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const percentage = getPercentage(stat.value, stat.total);
            const isPositiveTrend = stat.trend.startsWith('+');
            
            return (
              <Grid item xs={12} sm={6} key={index}>
                <Fade in timeout={800 + index * 200}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: `1px solid ${alpha(stat.color, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)} 0%, ${alpha(stat.color, 0.02)} 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        borderColor: alpha(stat.color, 0.2),
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${alpha(stat.color, 0.1)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '40%',
                        height: '100%',
                        background: `radial-gradient(circle at top right, ${alpha(stat.color, 0.06)} 0%, transparent 60%)`,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      {/* Header with icon and trend */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${stat.color}, ${theme.palette.grey[800]})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${alpha(stat.color, 0.3)}`,
                          }}
                        >
                          <Icon sx={{ color: 'white', fontSize: 16 }} />
                        </Box>
                        <Chip
                          label={stat.trend}
                          size="small"
                          sx={{
                            backgroundColor: alpha(isPositiveTrend ? theme.palette.success.main : theme.palette.error.main, 0.1),
                            color: isPositiveTrend ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: 1.5,
                            height: 20,
                          }}
                        />
                      </Box>

                      {/* Value and label */}
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: stat.color,
                          mb: 0.5,
                          fontSize: '1.8rem',
                        }}
                      >
                        {stat.value}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: theme.palette.text.primary,
                          fontWeight: 600,
                          mb: 2,
                        }}
                      >
                        {stat.label}
                      </Typography>

                      {/* Progress bar */}
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            Прогресс
                          </Typography>
                          <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700 }}>
                            {percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(stat.color, 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
                              borderRadius: 3,
                              boxShadow: `0 2px 6px ${alpha(stat.color, 0.3)}`,
                            },
                          }}
                        />
                      </Box>

                      {/* Total count */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        из {stat.total} общего
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}; 