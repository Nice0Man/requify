import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  CircularProgress, 
  Alert,
  Chip 
} from '@mui/material';
import { 
  Assignment, 
  CheckCircle, 
  Person, 
  Code, 
  BugReport 
} from '@mui/icons-material';
import { useRecentActivity } from '@/features/dashboard/model/useDashboardQuery';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'requirement':
      return <Assignment />;
    case 'task':
      return <CheckCircle />;
    case 'user':
      return <Person />;
    case 'code':
      return <Code />;
    case 'bug':
      return <BugReport />;
    default:
      return <Assignment />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'requirement':
      return '#1976d2';
    case 'task':
      return '#2e7d32';
    case 'user':
      return '#9c27b0';
    case 'code':
      return '#ed6c02';
    case 'bug':
      return '#d32f2f';
    default:
      return '#1976d2';
  }
};

export const ActivityFeedWidget = () => {
  const { data: activities, isLoading, error, isError } = useRecentActivity();

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title="Последняя активность" />
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title="Последняя активность" />
        <CardContent>
          <Alert severity="error">
            Ошибка при загрузке активности: {error?.message || 'Неизвестная ошибка'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="Последняя активность" 
        action={
          <Chip 
            label={`${activities?.length || 0} событий`} 
            size="small" 
            color="primary" 
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {activities?.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="Нет активности"
                secondary="Активность появится здесь по мере работы с проектом"
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          ) : (
            activities?.map((activity) => (
              <ListItem 
                key={activity.id} 
                alignItems="flex-start"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      backgroundColor: getActivityColor(activity.type),
                      width: 40, 
                      height: 40 
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.title}
                      </Typography>
                      <Chip 
                        label={activity.type} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 18,
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(activity.timestamp), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
}; 
