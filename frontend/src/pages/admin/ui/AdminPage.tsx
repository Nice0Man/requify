import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  alpha,
  useTheme,
  Container,
  Fade,
  Slide,
  Paper,
  Chip,
} from "@mui/material";
import {
  People,
  Settings,
  Security,
  Assessment,
  Notifications,
  Storage,
  AdminPanelSettings,
  TrendingUp,
  Speed,
  Shield,
  Analytics,
  ArrowForward,
} from "@mui/icons-material";
import { PageLayout } from "@/shared/ui";

// Современная цветовая схема (согласованная с сайдбаром)
const ADMIN_COLORS = {
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    hover: "#f1f5f9",
    active: "#e2e8f0",
    gradient: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
  },
  border: {
    light: "#e2e8f0",
    medium: "#cbd5e1",
    focus: "#3b82f6",
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    muted: "#94a3b8",
    inverse: "#ffffff",
  },
  accent: {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    purple: "#8b5cf6",
    indigo: "#6366f1",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
} as const;

const AdminPage: React.FC = () => {
  const adminSections = [
    {
      title: "Управление пользователями",
      description: "Создание, редактирование и управление пользователями системы",
      icon: <People />,
      path: "/admin/users",
      color: ADMIN_COLORS.accent.primary,
      stats: "1,247 пользователей",
      badge: "Активно",
      badgeColor: ADMIN_COLORS.accent.success,
    },
    {
      title: "Настройки системы",
      description: "Конфигурация параметров и настроек приложения",
      icon: <Settings />,
      path: "/admin/settings",
      color: ADMIN_COLORS.accent.purple,
      stats: "12 модулей",
      badge: "Настроено",
      badgeColor: ADMIN_COLORS.accent.primary,
    },
    {
      title: "Безопасность",
      description: "Управление ролями, правами доступа и аудитом",
      icon: <Security />,
      path: "/admin/security",
      color: ADMIN_COLORS.accent.error,
      stats: "8 ролей",
      badge: "Защищено",
      badgeColor: ADMIN_COLORS.accent.success,
    },
    {
      title: "Аналитика",
      description: "Системная аналитика и отчеты о производительности",
      icon: <Assessment />,
      path: "/admin/analytics",
      color: ADMIN_COLORS.accent.indigo,
      stats: "94% производительность",
      badge: "Оптимально",
      badgeColor: ADMIN_COLORS.accent.success,
    },
    {
      title: "Уведомления",
      description: "Настройка системы уведомлений и рассылок",
      icon: <Notifications />,
      path: "/admin/notifications",
      color: ADMIN_COLORS.accent.warning,
      stats: "3 активных канала",
      badge: "Работает",
      badgeColor: ADMIN_COLORS.accent.success,
    },
    {
      title: "База данных",
      description: "Управление базой данных, резервное копирование",
      icon: <Storage />,
      path: "/admin/database",
      color: ADMIN_COLORS.accent.success,
      stats: "2.4 ГБ данных",
      badge: "Резерв создан",
      badgeColor: ADMIN_COLORS.accent.primary,
    },
  ];

  const quickActions = [
    {
      title: "Просмотр всех пользователей",
      description: "Управление учетными записями пользователей",
      icon: <People />,
      color: ADMIN_COLORS.accent.primary,
      count: "1,247",
      trend: "+12%",
    },
    {
      title: "Системный отчет",
      description: "Генерация отчета о состоянии системы",
      icon: <Assessment />,
      color: ADMIN_COLORS.accent.indigo,
      count: "94%",
      trend: "+2%",
    },
    {
      title: "Журнал аудита",
      description: "Просмотр событий безопасности системы",
      icon: <Security />,
      color: ADMIN_COLORS.accent.error,
      count: "156",
      trend: "0%",
    },
  ];

  return (
    <PageLayout title="Панель Администратора">
      <Box
        sx={{
          minHeight: "100vh",
          background: ADMIN_COLORS.background.gradient,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(ADMIN_COLORS.accent.primary, 0.1)} 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(ADMIN_COLORS.accent.purple, 0.08)} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />

        <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Fade in={true} timeout={600}>
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.background.primary, 0.9)} 0%, ${alpha(ADMIN_COLORS.background.secondary, 0.8)} 100%)`,
                backdropFilter: "blur(20px)",
                borderRadius: 4,
                border: `1px solid ${ADMIN_COLORS.border.light}`,
                p: 4,
                mb: 4,
                boxShadow: ADMIN_COLORS.shadow.lg,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${ADMIN_COLORS.accent.primary} 0%, ${ADMIN_COLORS.accent.indigo} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 3,
                      boxShadow: `0 8px 24px ${alpha(ADMIN_COLORS.accent.primary, 0.3)}`,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: -2,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${ADMIN_COLORS.accent.primary}, ${ADMIN_COLORS.accent.indigo})`,
                        opacity: 0.3,
                        filter: "blur(8px)",
                      },
                    }}
                  >
                    <AdminPanelSettings sx={{ color: "white", fontSize: 32, position: "relative" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 800,
                        background: `linear-gradient(135deg, ${ADMIN_COLORS.text.primary} 0%, ${ADMIN_COLORS.accent.primary} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 0.5,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Панель Администратора
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ 
                        color: ADMIN_COLORS.text.secondary,
                        fontWeight: 500,
                        fontSize: "1.1rem",
                      }}
                    >
                      Управление системой и настройки приложения
                    </Typography>
                  </Box>
                </Box>

                {/* Quick stats */}
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
                  {[
                    { label: "Пользователи", value: "1,247", icon: <People />, color: ADMIN_COLORS.accent.primary },
                    { label: "Производительность", value: "94%", icon: <Speed />, color: ADMIN_COLORS.accent.success },
                    { label: "Безопасность", value: "Высокая", icon: <Shield />, color: ADMIN_COLORS.accent.success },
                  ].map((stat, index) => (
                    <Box
                      key={index}
                      sx={{
                        textAlign: "center",
                        minWidth: 100,
                        p: 2,
                        borderRadius: 2,
                        background: alpha(stat.color, 0.1),
                        border: `1px solid ${alpha(stat.color, 0.2)}`,
                      }}
                    >
                      <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color, fontSize: "1rem" }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ADMIN_COLORS.text.muted, fontSize: "0.75rem" }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Fade>

          {/* Admin sections grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {adminSections.map((section, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Slide
                  direction="up"
                  in={true}
                  timeout={400 + index * 100}
                  style={{ transformOrigin: "center bottom" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      border: `1px solid ${ADMIN_COLORS.border.light}`,
                      background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.background.primary, 0.9)} 0%, ${alpha(ADMIN_COLORS.background.secondary, 0.8)} 100%)`,
                      backdropFilter: "blur(20px)",
                      boxShadow: ADMIN_COLORS.shadow.md,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 20px 40px ${alpha(section.color, 0.15)}`,
                        border: `1px solid ${alpha(section.color, 0.3)}`,
                        "& .card-icon": {
                          transform: "scale(1.1) rotate(5deg)",
                        },
                        "& .arrow-icon": {
                          transform: "translateX(4px)",
                        },
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${section.color} 0%, ${alpha(section.color, 0.7)} 100%)`,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box
                          className="card-icon"
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${section.color} 0%, ${alpha(section.color, 0.8)} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 8px 16px ${alpha(section.color, 0.3)}`,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: -2,
                              borderRadius: 2.5,
                              background: `linear-gradient(135deg, ${section.color}, ${alpha(section.color, 0.8)})`,
                              opacity: 0.2,
                              filter: "blur(4px)",
                            },
                          }}
                        >
                          {React.cloneElement(section.icon, {
                            sx: { color: "white", fontSize: 28, position: "relative" },
                          })}
                        </Box>
                        
                        <Chip
                          label={section.badge}
                          size="small"
                          sx={{
                            backgroundColor: alpha(section.badgeColor, 0.1),
                            color: section.badgeColor,
                            border: `1px solid ${alpha(section.badgeColor, 0.2)}`,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ 
                          fontWeight: 700, 
                          color: ADMIN_COLORS.text.primary,
                          mb: 1,
                          fontSize: "1.1rem",
                        }}
                      >
                        {section.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: ADMIN_COLORS.text.secondary,
                          lineHeight: 1.6,
                          mb: 2,
                        }}
                      >
                        {section.description}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TrendingUp sx={{ color: section.color, fontSize: 16 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: section.color,
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          {section.stats}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForward className="arrow-icon" sx={{ transition: "all 0.3s ease" }} />}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${section.color} 0%, ${alpha(section.color, 0.8)} 100%)`,
                          boxShadow: `0 4px 12px ${alpha(section.color, 0.3)}`,
                          color: "white",
                          py: 1.5,
                          "&:hover": {
                            background: `linear-gradient(135deg, ${alpha(section.color, 0.9)} 0%, ${alpha(section.color, 0.7)} 100%)`,
                            boxShadow: `0 6px 20px ${alpha(section.color, 0.4)}`,
                          },
                        }}
                        onClick={() => {
                          // TODO: Implement navigation
                          console.log("Navigate to:", section.path);
                        }}
                      >
                        Открыть
                      </Button>
                    </CardActions>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>

          {/* Quick actions */}
          <Fade in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${ADMIN_COLORS.border.light}`,
                background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.background.primary, 0.9)} 0%, ${alpha(ADMIN_COLORS.background.secondary, 0.8)} 100%)`,
                backdropFilter: "blur(20px)",
                boxShadow: ADMIN_COLORS.shadow.md,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: ADMIN_COLORS.text.primary,
                    mb: 1,
                  }}
                >
                  Быстрые действия
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: ADMIN_COLORS.text.secondary,
                    mb: 3,
                  }}
                >
                  Часто используемые операции администрирования
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {quickActions.map((action, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        py: 3,
                        px: 3,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: alpha(action.color, 0.04),
                          "& .action-icon": {
                            transform: "scale(1.1)",
                            backgroundColor: alpha(action.color, 0.1),
                          },
                          "& .trend-indicator": {
                            transform: "translateX(4px)",
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Box
                          className="action-icon"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: alpha(action.color, 0.08),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            border: `1px solid ${alpha(action.color, 0.2)}`,
                          }}
                        >
                          {React.cloneElement(action.icon, {
                            sx: { color: action.color, fontSize: 24 },
                          })}
                        </Box>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, color: ADMIN_COLORS.text.primary }}>
                            {action.title}
                          </Typography>
                        }
                        secondary={action.description}
                        sx={{
                          "& .MuiListItemText-secondary": {
                            color: ADMIN_COLORS.text.secondary,
                          },
                        }}
                      />

                      <Box sx={{ textAlign: "right", minWidth: 120 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: action.color,
                            fontSize: "1.25rem",
                          }}
                        >
                          {action.count}
                        </Typography>
                        <Box 
                          className="trend-indicator"
                          sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "flex-end",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <Analytics sx={{ color: ADMIN_COLORS.text.muted, fontSize: 14, mr: 0.5 }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: ADMIN_COLORS.text.muted,
                              fontWeight: 500,
                            }}
                          >
                            {action.trend}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < quickActions.length - 1 && (
                      <Divider sx={{ borderColor: alpha(ADMIN_COLORS.border.light, 0.5) }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Fade>
        </Container>
      </Box>
    </PageLayout>
  );
};

export { AdminPage };

// Добавляем default export для React.lazy()
export default AdminPage;
