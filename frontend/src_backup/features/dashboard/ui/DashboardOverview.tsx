import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Person as UserIcon,
  Assignment as ProjectIcon,
  Description as RequirementIcon,
  Build as ToolIcon,
} from "@mui/icons-material";
import { useDashboard } from "@/features/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "../model/dashboard.hooks";

interface DashboardStats {
  users: { total: number; active: number };
  projects: { total: number; active: number };
  requirements: { total: number; pending: number };
  tests: { total: number; passed: number };
}

export const DashboardOverview: React.FC = () => {
  const { overview, isLoading, error } = useDashboard();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
      setIsInitialized(true);
    }
  }, [queryClient, isInitialized]);

  if (isLoading && !overview) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data: {error.message}
      </Alert>
    );
  }

  const defaultStats: DashboardStats = {
    users: { total: 0, active: 0 },
    projects: { total: 0, active: 0 },
    requirements: { total: 0, pending: 0 },
    tests: { total: 0, passed: 0 },
  };

  const currentStats = (overview as unknown as DashboardStats) || defaultStats;

  const statCards = [
    {
      title: "Users",
      value: currentStats.users?.total || 0,
      subtitle: `${currentStats.users?.active || 0} active`,
      icon: <UserIcon fontSize="large" />,
      color: "#1976d2",
    },
    {
      title: "Projects",
      value: currentStats.projects?.total || 0,
      subtitle: `${currentStats.projects?.active || 0} active`,
      icon: <ProjectIcon fontSize="large" />,
      color: "#388e3c",
    },
    {
      title: "Requirements",
      value: currentStats.requirements?.total || 0,
      subtitle: `${currentStats.requirements?.pending || 0} pending`,
      icon: <RequirementIcon fontSize="large" />,
      color: "#f57c00",
    },
    {
      title: "Tests",
      value: currentStats.tests?.total || 0,
      subtitle: `${currentStats.tests?.passed || 0} passed`,
      icon: <ToolIcon fontSize="large" />,
      color: "#7b1fa2",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                      borderRadius: "12px",
                      bgcolor: `${card.color}15`,
                      color: card.color,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight={700}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" component="h3">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
