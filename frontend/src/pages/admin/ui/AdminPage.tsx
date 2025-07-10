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
} from "@mui/material";
import {
  People,
  Settings,
  Security,
  Assessment,
  Notifications,
  Storage,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/widgets/layout";

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const adminSections = [
    {
      title: t("admin.userManagement"),
      description: t("admin.userManagementDesc"),
      icon: <People />,
      path: "/admin/users",
      color: theme.palette.primary.main,
    },
    {
      title: t("admin.systemSettings"),
      description: t("admin.systemSettingsDesc"),
      icon: <Settings />,
      path: "/admin/settings",
      color: theme.palette.secondary.main,
    },
    {
      title: t("admin.security"),
      description: t("admin.securityDesc"),
      icon: <Security />,
      path: "/admin/security",
      color: theme.palette.error.main,
    },
    {
      title: t("admin.analytics"),
      description: t("admin.analyticsDesc"),
      icon: <Assessment />,
      path: "/admin/analytics",
      color: theme.palette.info.main,
    },
    {
      title: t("admin.notifications"),
      description: t("admin.notificationsDesc"),
      icon: <Notifications />,
      path: "/admin/notifications",
      color: theme.palette.warning.main,
    },
    {
      title: t("admin.database"),
      description: t("admin.databaseDesc"),
      icon: <Storage />,
      path: "/admin/database",
      color: theme.palette.success.main,
    },
  ];

  return (
    <DashboardLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 1)} 0%, 
            ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
          {/* Заголовок */}
          <Fade in={true} timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 3,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <AdminPanelSettings sx={{ color: "white", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 0.5,
                    }}
                  >
                    {t("admin.title")}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t("admin.description")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>

          {/* Карточки административных секций */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {adminSections.map((section, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
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
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.default, 0.6)} 100%)`,
                      backdropFilter: "blur(20px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: `0 20px 40px ${alpha(section.color, 0.15)}`,
                        border: `1px solid ${alpha(section.color, 0.2)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${section.color}, ${alpha(section.color, 0.8)})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2,
                            boxShadow: `0 8px 16px ${alpha(section.color, 0.3)}`,
                          }}
                        >
                          {React.cloneElement(section.icon, {
                            sx: { color: "white", fontSize: 24 },
                          })}
                        </Box>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{ fontWeight: 700, color: section.color }}
                        >
                          {section.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {section.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${section.color}, ${alpha(section.color, 0.8)})`,
                          boxShadow: `0 4px 12px ${alpha(section.color, 0.3)}`,
                          "&:hover": {
                            background: `linear-gradient(135deg, ${alpha(section.color, 0.9)}, ${alpha(section.color, 0.7)})`,
                            boxShadow: `0 6px 20px ${alpha(section.color, 0.4)}`,
                          },
                        }}
                        onClick={() => {
                          // TODO: Implement navigation
                          console.log("Navigate to:", section.path);
                        }}
                      >
                        {t("common.open")}
                      </Button>
                    </CardActions>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>

          {/* Разделитель */}
          <Box
            sx={{
              position: "relative",
              my: 4,
              "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "10%",
                right: "10%",
                transform: "translateY(-50%)",
                height: 1,
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${alpha(theme.palette.divider, 0.3)} 20%, 
                  ${alpha(theme.palette.divider, 0.6)} 50%, 
                  ${alpha(theme.palette.divider, 0.3)} 80%, 
                  transparent 100%)`,
              },
            }}
          />

          {/* Быстрые действия */}
          <Fade in={true} timeout={800}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                {t("admin.quickActions")}
              </Typography>

              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.default, 0.6)} 100%)`,
                  backdropFilter: "blur(20px)",
                }}
              >
                <List sx={{ p: 0 }}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <ListItemIcon>
                      <People sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600 }}>
                          {t("admin.viewAllUsers")}
                        </Typography>
                      }
                      secondary={t("admin.viewAllUsersDesc")}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.info.main, 0.04),
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <ListItemIcon>
                      <Assessment sx={{ color: theme.palette.info.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600 }}>
                          {t("admin.systemReport")}
                        </Typography>
                      }
                      secondary={t("admin.systemReportDesc")}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.error.main, 0.04),
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <ListItemIcon>
                      <Security sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600 }}>
                          {t("admin.auditLog")}
                        </Typography>
                      }
                      secondary={t("admin.auditLogDesc")}
                    />
                  </ListItem>
                </List>
              </Card>
            </Box>
          </Fade>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export { AdminPage };
