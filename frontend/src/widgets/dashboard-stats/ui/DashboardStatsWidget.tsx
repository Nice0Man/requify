import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert, alpha, useTheme, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Assignment, CheckCircle, Group, FolderOpen } from '@mui/icons-material';
import { useDashboardStats } from '@/features/dashboard/model/useDashboardQuery';

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
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
    },
    {
      title: 'Активных требований',
      icon: Assignment,
      color: theme.palette.secondary.main,
      key: 'activeRequirements' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
    },
    {
      title: 'Завершенных задач',
      icon: CheckCircle,
      color: theme.palette.success.main,
      key: 'completedTasks' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
    },
    {
      title: 'Участников команды',
      icon: Group,
      color: theme.palette.info.main,
      key: 'teamMembers' as const,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <CircularProgress size={40} thickness={4} />
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.light, 0.03)} 100%)`,
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
                border: `1px solid ${alpha(card.color, 0.1)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px ${alpha(card.color, 0.15)}`,
                  border: `1px solid ${alpha(card.color, 0.2)}`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '50%',
                  height: '100%',
                  background: `radial-gradient(circle at top right, ${alpha(card.color, 0.08)} 0%, transparent 60%)`,
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 24px ${alpha(card.color, 0.25)}`,
                    }}
                  >
                    <Icon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Chip
                    label={`${isPositive ? '+' : ''}${change}%`}
                    size="small"
                    icon={isPositive ? <TrendingUp /> : <TrendingDown />}
                    sx={{
                      backgroundColor: alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                      color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderRadius: 2,
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    mb: 0.5,
                    fontWeight: 700,
                    color: card.color,
                    fontSize: '2rem',
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
                  color="text.secondary"
                  sx={{ fontSize: '0.85rem' }}
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
