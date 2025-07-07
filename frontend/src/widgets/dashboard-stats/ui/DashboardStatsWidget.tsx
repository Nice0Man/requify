import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { TrendingUp, TrendingDown, Assignment, CheckCircle, Group, FolderOpen } from '@mui/icons-material';
import { useDashboardStats } from '@/features/dashboard/model/useDashboardQuery';

const statCards = [
  {
    title: 'Всего проектов',
    icon: FolderOpen,
    color: '#1976d2',
    bgColor: 'rgba(25, 118, 210, 0.1)',
    key: 'totalProjects' as const,
  },
  {
    title: 'Активных требований',
    icon: Assignment,
    color: '#ed6c02',
    bgColor: 'rgba(237, 108, 2, 0.1)',
    key: 'activeRequirements' as const,
  },
  {
    title: 'Завершенных задач',
    icon: CheckCircle,
    color: '#2e7d32',
    bgColor: 'rgba(46, 125, 50, 0.1)',
    key: 'completedTasks' as const,
  },
  {
    title: 'Участников команды',
    icon: Group,
    color: '#9c27b0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    key: 'teamMembers' as const,
  },
];

export const DashboardStatsWidget = () => {
  const { data: stats, isLoading, error, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка при загрузке статистики: {error?.message || 'Неизвестная ошибка'}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] || 0;
        const change = stats?.changes?.[card.key] || 0;
        const isPositive = change >= 0;

        return (
          <Grid item xs={12} sm={6} md={3} key={card.key}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    backgroundColor: card.bgColor,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 40, color: card.color }} />
                </Box>
                
                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {card.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isPositive ? (
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isPositive ? 'success.main' : 'error.main',
                      fontWeight: 'medium',
                    }}
                  >
                    {isPositive ? '+' : ''}{change}% за месяц
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}; 
