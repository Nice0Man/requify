import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  useTheme, 
  alpha,
  Chip,
  Fade,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  BugReport,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { LiquidGlassIcon } from '@/shared/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  color,
  delay = 0 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return theme.palette.success.main;
      case 'down': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Schedule;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Fade in timeout={1000 + delay}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 5, // More rounded for Apple design
          position: 'relative',
          overflow: 'hidden',
          // Authentic Liquid Glass background
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 50%,
              ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(color, 0.08)} 0%, 
              transparent 60%
            ),
            ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.85)}
          `,
          // Advanced backdrop filter
          backdropFilter: 'blur(40px) saturate(150%) contrast(120%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%) contrast(120%)',
          // Multi-layer border
          border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)}`,
          // Enhanced shadow system
          boxShadow: `
            inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.3)},
            inset 0 -1px 0 ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)},
            0 4px 24px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)},
            0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)},
            0 0 0 1px ${alpha(color, 0.08)}
          `,
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            backdropFilter: 'blur(50px) saturate(180%) contrast(130%)',
            WebkitBackdropFilter: 'blur(50px) saturate(180%) contrast(130%)',
            // Enhanced hover state
            background: `
              linear-gradient(135deg, 
                ${alpha(theme.palette.common.white, isDark ? 0.18 : 0.35)} 0%, 
                ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 50%,
                ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 100%
              ),
              linear-gradient(225deg, 
                ${alpha(color, 0.12)} 0%, 
                transparent 60%
              ),
              ${alpha(theme.palette.background.paper, isDark ? 0.6 : 0.9)}
            `,
            border: `1px solid ${alpha(color, 0.2)}`,
            boxShadow: `
              inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.2 : 0.4)},
              inset 0 -1px 0 ${alpha(theme.palette.common.black, isDark ? 0.25 : 0.08)},
              0 8px 32px ${alpha(color, 0.2)},
              0 2px 12px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.1)},
              0 0 0 1px ${alpha(color, 0.15)},
              0 0 20px ${alpha(color, 0.1)}
            `,
          },

          // Top light refraction
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: `
              linear-gradient(180deg, 
                ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)} 0%, 
                ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.1)} 40%,
                transparent 100%
              )
            `,
            borderRadius: '20px 20px 0 0',
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
          },

          // Dynamic specular highlights
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: `
              conic-gradient(from 45deg at 25% 25%, 
                ${alpha(color, 0.2)} 0deg,
                transparent 90deg,
                transparent 180deg,
                ${alpha(color, 0.15)} 270deg,
                transparent 360deg
              )
            `,
            borderRadius: 22,
            opacity: 0,
            transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            zIndex: -1,
            filter: 'blur(1px)',
          },

          '&:hover::after': {
            opacity: 1,
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <LiquidGlassIcon
              icon={Icon}
              color={color}
              size={64}
              variant="secondary"
            />
            <Chip
              icon={<TrendIcon sx={{ fontSize: '1rem !important' }} />}
              label={change}
              size="small"
              sx={{
                // Liquid Glass chip
                background: `
                  linear-gradient(135deg, 
                    ${alpha(getTrendColor(), isDark ? 0.15 : 0.2)} 0%, 
                    ${alpha(getTrendColor(), isDark ? 0.08 : 0.12)} 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: getTrendColor(),
                border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                borderRadius: 3,
                boxShadow: `
                  inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)},
                  0 2px 8px ${alpha(getTrendColor(), 0.15)}
                `,
                '& .MuiChip-icon': {
                  filter: `drop-shadow(0 1px 2px ${alpha(theme.palette.common.black, 0.2)})`,
                },
              }}
            />
          </Box>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              mb: 0.5,
              // Text with subtle glow
              color: theme.palette.text.primary,
              textShadow: `0 1px 2px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.1)}`,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: alpha(theme.palette.text.secondary, 0.8),
              fontWeight: 500,
              textShadow: `0 1px 1px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)}`,
            }}
          >
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export const DashboardStatsWidget: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Всего требований',
      value: 157,
      change: '+12%',
      trend: 'up' as const,
      icon: Assignment,
      color: theme.palette.primary.main,
    },
    {
      title: 'Активные проекты',
      value: 23,
      change: '+5%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: theme.palette.success.main,
    },
    {
      title: 'Открытые дефекты',
      value: 8,
      change: '-3%',
      trend: 'down' as const,
      icon: BugReport,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <StatCard {...stat} delay={index * 150} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 
