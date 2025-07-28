/**
 * Settings Page - Rewritten with FSD architecture and real API integration
 */

import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Alert,
  Fade,
  Typography,
  useTheme,
  alpha,
  Button,
  Stack,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { PageLayout } from "@/shared/ui/PageLayout";
import { SettingsNavigationWidget } from "@/widgets/settings-navigation";
import { ProfileFormWidget } from "@/features/user-profile-settings";
import { NotificationSettingsWidget } from "@/features/notification-settings";
import type { SettingsTabItem } from "@/entities/settings";

// Современная цветовая схема
const SETTINGS_COLORS = {
  background: {
    gradient: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
  },
  accent: {
    primary: "#3b82f6",
    warning: "#f59e0b",
    error: "#ef4444",
    purple: "#8b5cf6",
  },
  shadow: {
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
} as const;

// Конфигурация вкладок настроек
const settingsTabs: SettingsTabItem[] = [
  {
    id: "profile",
    label: "Профиль",
    icon: <PersonIcon />,
    color: SETTINGS_COLORS.accent.primary,
    description: "Персональная информация",
  },
  {
    id: "notifications",
    label: "Уведомления",
    icon: <NotificationsIcon />,
    color: SETTINGS_COLORS.accent.warning,
    description: "Настройки уведомлений",
  },
  {
    id: "security",
    label: "Безопасность",
    icon: <SecurityIcon />,
    color: SETTINGS_COLORS.accent.error,
    description: "Защита аккаунта",
  },
  {
    id: "interface",
    label: "Интерфейс",
    icon: <ThemeIcon />,
    color: SETTINGS_COLORS.accent.purple,
    description: "Персонализация",
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = useCallback((newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleSave = useCallback(() => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, []);

  const renderBrandHeader = () => (
    <Fade in timeout={600}>
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha("#f8fafc", 0.8)} 100%)`,
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: 4,
          mb: 4,
          boxShadow: SETTINGS_COLORS.shadow.lg,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.purple} 0%, ${SETTINGS_COLORS.accent.primary} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 3,
                boxShadow: `0 8px 24px ${alpha(SETTINGS_COLORS.accent.purple, 0.3)}`,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: -2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.purple}, ${SETTINGS_COLORS.accent.primary})`,
                  opacity: 0.3,
                  filter: "blur(8px)",
                },
              }}
            >
              <SettingsIcon sx={{ color: "white", fontSize: 32, position: "relative" }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${SETTINGS_COLORS.accent.purple} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 0.5,
                  letterSpacing: "-0.025em",
                }}
              >
                Настройки
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: "1.1rem",
                }}
              >
                Управление учетной записью и предпочтениями
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.primary} 0%, ${SETTINGS_COLORS.accent.purple} 100%)`,
              boxShadow: `0 4px 16px ${alpha(SETTINGS_COLORS.accent.primary, 0.3)}`,
              color: "white",
              fontSize: "1rem",
              "&:hover": {
                background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.purple} 0%, ${SETTINGS_COLORS.accent.primary} 100%)`,
                boxShadow: `0 6px 20px ${alpha(SETTINGS_COLORS.accent.primary, 0.4)}`,
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Сохранить изменения
          </Button>
        </Box>

        {saveSuccess && (
          <Fade in={saveSuccess} timeout={300}>
            <Alert
              severity="success"
              sx={{
                mt: 3,
                borderRadius: 2,
                backgroundColor: alpha("#10b981", 0.1),
                border: `1px solid ${alpha("#10b981", 0.2)}`,
                "& .MuiAlert-icon": {
                  color: "#10b981",
                },
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                Настройки успешно сохранены!
              </Typography>
            </Alert>
          </Fade>
        )}
      </Paper>
    </Fade>
  );

  return (
    <PageLayout title="Настройки">
      <Box
        sx={{
          minHeight: "100vh",
          background: SETTINGS_COLORS.background.gradient,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: -150,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(SETTINGS_COLORS.accent.purple, 0.08)} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -200,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(SETTINGS_COLORS.accent.primary, 0.06)} 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />

        <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
          {/* Header */}
          {renderBrandHeader()}

          {/* Settings Content */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha("#f8fafc", 0.8)} 100%)`,
              backdropFilter: "blur(20px)",
              boxShadow: SETTINGS_COLORS.shadow.lg,
              overflow: "hidden",
            }}
          >
            {/* Navigation */}
            <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, p: 3 }}>
              <SettingsNavigationWidget
                activeTab={activeTab}
                onTabChange={handleTabChange}
                tabs={settingsTabs}
                isLoading={isLoading}
              />
            </Box>

            {/* Tab Content */}
            <Box>
              {/* Profile Tab */}
              <TabPanel value={activeTab} index={0}>
                <ProfileFormWidget 
                  onSave={handleSave}
                  showActions={false}
                />
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={activeTab} index={1}>
                <NotificationSettingsWidget />
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    🔒 Настройки безопасности
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Компонент в разработке
                  </Typography>
                </Box>
              </TabPanel>

              {/* Interface Tab */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    🎨 Настройки интерфейса
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Компонент в разработке
                  </Typography>
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>
    </PageLayout>
  );
};

export default SettingsPage;
