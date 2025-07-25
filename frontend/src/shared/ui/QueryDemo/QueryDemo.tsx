import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Refresh,
  QueryStats,
  Update,
  CachedOutlined,
  NetworkCheck,
  Speed,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

export const QueryDemo = () => {
  const queryClient = useQueryClient();
  const [demoMode, setDemoMode] = useState(false);

  const statsQuery = {
    isPending: false,
    isError: false,
    isFetching: false,
    isSuccess: false,
    data: {
      totalProjects: 100,
      activeRequirements: 50,
      completedTasks: 200,
      teamMembers: 15,
    },
    dataUpdatedAt: Date.now(),
  };

  const activityQuery = {
    isPending: false,
    isError: false,
    isFetching: false,
    isSuccess: false,
    data: [
      { title: "Проект 'Project A' обновлен" },
      { title: "Задача 'Task B' завершена" },
      { title: "Требование 'Requirement C' добавлено" },
    ],
    dataUpdatedAt: Date.now(),
  };

  const handleInvalidateStats = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
  };

  const handleInvalidateActivity = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity'] });
  };

  const handleInvalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const handleClearCache = () => {
    queryClient.removeQueries({ queryKey: ["dashboard"] });
  };

  const getQueryStatus = (query: any) => {
    if (query.isPending) return { status: "loading", color: "info" as const };
    if (query.isError) return { status: "error", color: "error" as const };
    if (query.isFetching)
      return { status: "fetching", color: "warning" as const };
    if (query.isSuccess)
      return { status: "success", color: "success" as const };
    return { status: "idle", color: "default" as const };
  };

  const features = [
    {
      icon: <CachedOutlined />,
      title: "Умное кэширование",
      description:
        "Данные кэшируются автоматически и переиспользуются между компонентами",
      active: true,
    },
    {
      icon: <NetworkCheck />,
      title: "Фоновое обновление",
      description: "Данные обновляются в фоне при переподключении к сети",
      active: true,
    },
    {
      icon: <Speed />,
      title: "Оптимистические обновления",
      description: "Мгновенный отклик UI с автоматическим откатом при ошибках",
      active: true,
    },
    {
      icon: <Update />,
      title: "Автоматические повторы",
      description: "Умные повторы с экспоненциальной задержкой при ошибках",
      active: true,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        React Query Demo
      </Typography>

      <Grid container spacing={3}>
        {/* Query Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Состояние запросов" avatar={<QueryStats />} />
            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2">Статистика:</Typography>
                  <Chip
                    label={getQueryStatus(statsQuery).status}
                    color={getQueryStatus(statsQuery).color}
                    size="small"
                  />
                  {statsQuery.isFetching && <CircularProgress size={16} />}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2">Активность:</Typography>
                  <Chip
                    label={getQueryStatus(activityQuery).status}
                    color={getQueryStatus(activityQuery).color}
                    size="small"
                  />
                  {activityQuery.isFetching && <CircularProgress size={16} />}
                </Box>

                <Divider />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleInvalidateStats}
                    disabled={statsQuery.isFetching}
                  >
                    Обновить статистику
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleInvalidateActivity}
                    disabled={activityQuery.isFetching}
                  >
                    Обновить активность
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleInvalidateAll}
                  >
                    Обновить все
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={handleClearCache}
                  >
                    Очистить кэш
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Возможности React Query" />
            <CardContent>
              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{feature.icon}</ListItemIcon>
                    <ListItemText
                      primary={feature.title}
                      secondary={feature.description}
                    />
                    <Chip
                      label={feature.active ? "Активно" : "Неактивно"}
                      color={feature.active ? "success" : "default"}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Display */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Данные из кэша" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Статистика дашборда
                    </Typography>
                    {statsQuery.isPending ? (
                      <CircularProgress />
                    ) : statsQuery.isError ? (
                      <Alert severity="error">Ошибка загрузки статистики</Alert>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2">
                          Общее количество проектов:{" "}
                          {statsQuery.data?.totalProjects || 0}
                        </Typography>
                        <Typography variant="body2">
                          Активных требований:{" "}
                          {statsQuery.data?.activeRequirements || 0}
                        </Typography>
                        <Typography variant="body2">
                          Завершенных задач:{" "}
                          {statsQuery.data?.completedTasks || 0}
                        </Typography>
                        <Typography variant="body2">
                          Участников команды:{" "}
                          {statsQuery.data?.teamMembers || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Данные кэшированы на{" "}
                          {statsQuery.dataUpdatedAt
                            ? new Date(
                                statsQuery.dataUpdatedAt
                              ).toLocaleTimeString()
                            : "неизвестно"}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Последняя активность
                    </Typography>
                    {activityQuery.isPending ? (
                      <CircularProgress />
                    ) : activityQuery.isError ? (
                      <Alert severity="error">Ошибка загрузки активности</Alert>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2">
                          Событий: {Array.isArray(activityQuery.data) ? activityQuery.data.length : 0}
                        </Typography>
                        {Array.isArray(activityQuery.data) && activityQuery.data
                          ?.slice(0, 3)
                          .map((activity: any, index: number) => (
                            <Typography key={index} variant="body2">
                              • {activity.title}
                            </Typography>
                          ))}
                        <Typography variant="caption" color="text.secondary">
                          Обновлено:{" "}
                          {activityQuery.dataUpdatedAt
                            ? new Date(
                                activityQuery.dataUpdatedAt
                              ).toLocaleTimeString()
                            : "неизвестно"}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
