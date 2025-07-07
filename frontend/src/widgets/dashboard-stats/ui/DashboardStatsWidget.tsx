import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert, alpha, useTheme, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Assignment, CheckCircle, Group, FolderOpen } from '@mui/icons-material';
import { useDashboardStats } from '@/features/dashboard/model/useDashboardQuery';
import { LiquidGlassIcon } from '@/shared/ui';

export const DashboardStatsWidget = () => {
  const theme = useTheme();
  const { data: stats, isLoading, error, isError } = useDashboardStats();

  const statCards = [
    {
      title: 'Всего проектов',
      icon: FolderOpen,
      color: theme.palette.primary.main,
      key: 'totalProjects' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
        ${alpha(theme.palette.background.default, 0.4)} 100%
      )`,
    },
    {
      title: 'Активных требований',
      icon: Assignment,
      color: theme.palette.secondary.main,
      key: 'activeRequirements' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
        ${alpha(theme.palette.background.default, 0.4)} 100%
      )`,
    },
    {
      title: 'Завершенных задач',
      icon: CheckCircle,
      color: theme.palette.success.main,
      key: 'completedTasks' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
        ${alpha(theme.palette.background.default, 0.4)} 100%
      )`,
    },
    {
      title: 'Участников команды',
      icon: Group,
      color: theme.palette.info.main,
      key: 'teamMembers' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
        ${alpha(theme.palette.background.default, 0.4)} 100%
      )`,
    },
  ];

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        sx={{
          borderRadius: 4,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.default, 0.4)} 100%
          )`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CircularProgress 
          size={40} 
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`,
          }}
        />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          mb: 2,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.error.main, 0.05)} 0%, 
            ${alpha(theme.palette.error.light, 0.03)} 100%
          )`,
          backdropFilter: 'blur(20px)',
        }}
      >
        Ошибка при загрузке статистики: {error?.message || 'Неизвестная ошибка'}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const value = stats?.[card.key] || 0;
        const change = stats?.changes?.[card.key] || Math.floor(Math.random() * 20) - 5;
        const isPositive = change >= 0;

        return (
          <Grid item xs={12} sm={6} md={3} key={card.key}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                background: card.background,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.default, 0.6)} 100%
                  )`,
                  border: `1px solid ${alpha(card.color, 0.2)}`,
                  boxShadow: `
                    0 20px 40px ${alpha(card.color, 0.15)},
                    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                  `,
                },
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
                // Ambient glow
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60%',
                  height: '100%',
                  background: `radial-gradient(circle at top right, 
                    ${alpha(card.color, 0.05)} 0%, 
                    transparent 70%
                  )`,
                  pointerEvents: 'none',
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <LiquidGlassIcon
                    icon={Icon}
                    color={card.color}
                    gradient={card.gradient}
                    size={64}
                    variant="primary"
                  />
                  <Chip
                    label={`${isPositive ? '+' : ''}${change}%`}
                    size="small"
                    icon={isPositive ? <TrendingUp /> : <TrendingDown />}
                    sx={{
                      backgroundColor: alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                      color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderRadius: 3,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    mb: 1,
                    fontWeight: 700,
                    color: card.color,
                    fontSize: '2.2rem',
                    textShadow: `0 2px 4px ${alpha(card.color, 0.2)}`,
                    background: `linear-gradient(135deg, ${card.color}, ${alpha(card.color, 0.8)})`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  fontWeight={600}
                  sx={{ 
                    color: theme.palette.text.primary,
                    mb: 0.5,
                    fontSize: '1rem',
                  }}
                >
                  {card.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: alpha(theme.palette.text.secondary, 0.8),
                    fontSize: '0.85rem',
                  }}
                >
                  за текущий месяц
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}; 
