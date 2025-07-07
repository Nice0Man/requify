import React, { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Using features according to FSD
import { useAuth } from "@/features/auth";
import { AdminDashboard } from "@/features/admin-panel/ui/AdminDashboard";

// Using widgets according to FSD
import { SystemHealth } from "@/widgets/system-health/ui/SystemHealth";

// Using shared utilities
import { toast } from "@/shared/ui";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // Check admin permissions
  const isAdmin = hasPermission("admin:read");
  const canWrite = hasPermission("admin:write");

  // State management
  const [activeTab, setActiveTab] = useState(0);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      toast.error("Access denied. Admin privileges required.");
      return;
    }
  }, [isAdmin, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            mb: 1,
          }}
        >
          System Administration
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: "1.1rem" }}
        >
          Monitor system health, manage users, and configure settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="admin tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
            },
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="System Health" />
          <Tab label="Users" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Admin Dashboard using AdminDashboard feature component */}
        <AdminDashboard />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* System Health using SystemHealth widget */}
        <SystemHealth
          showDetails={true}
          autoRefresh={true}
          refreshInterval={15000}
          onHealthClick={(component) => {
            console.log("Health component clicked:", component);
          }}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Users Management */}
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            borderRadius: 3,
            border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User management feature will be implemented here. This would use a
            UserManagement widget from @/widgets and user management features
            from @/features/user-management.
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* System Settings */}
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: alpha(theme.palette.warning.main, 0.05),
            borderRadius: 3,
            border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System settings feature will be implemented here. This would use
            settings widgets and configuration features.
          </Typography>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default AdminPage;
