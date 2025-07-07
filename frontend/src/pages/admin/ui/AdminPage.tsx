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

const AdminPage: React.FC = () => {
  const { t } = useTranslation();

  const adminSections = [
    {
      title: t("admin.userManagement"),
      description: t("admin.userManagementDesc"),
      icon: <People />,
      path: "/admin/users",
    },
    {
      title: t("admin.systemSettings"),
      description: t("admin.systemSettingsDesc"),
      icon: <Settings />,
      path: "/admin/settings",
    },
    {
      title: t("admin.security"),
      description: t("admin.securityDesc"),
      icon: <Security />,
      path: "/admin/security",
    },
    {
      title: t("admin.analytics"),
      description: t("admin.analyticsDesc"),
      icon: <Assessment />,
      path: "/admin/analytics",
    },
    {
      title: t("admin.notifications"),
      description: t("admin.notificationsDesc"),
      icon: <Notifications />,
      path: "/admin/notifications",
    },
    {
      title: t("admin.database"),
      description: t("admin.databaseDesc"),
      icon: <Storage />,
      path: "/admin/database",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AdminPanelSettings
          sx={{ mr: 2, fontSize: 32, color: "primary.main" }}
        />
        <Typography variant="h4" component="h1">
          {t("admin.title")}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("admin.description")}
      </Typography>

      <Grid container spacing={3}>
        {adminSections.map((section, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {React.cloneElement(section.icon, {
                    sx: { mr: 2, color: "primary.main" },
                  })}
                  <Typography variant="h6" component="h2">
                    {section.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {section.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // TODO: Implement navigation
                    console.log("Navigate to:", section.path);
                  }}
                >
                  {t("common.open")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("admin.quickActions")}
      </Typography>

      <List>
        <ListItem>
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText
            primary={t("admin.viewAllUsers")}
            secondary={t("admin.viewAllUsersDesc")}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Assessment />
          </ListItemIcon>
          <ListItemText
            primary={t("admin.systemReport")}
            secondary={t("admin.systemReportDesc")}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Security />
          </ListItemIcon>
          <ListItemText
            primary={t("admin.auditLog")}
            secondary={t("admin.auditLogDesc")}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export { AdminPage };
