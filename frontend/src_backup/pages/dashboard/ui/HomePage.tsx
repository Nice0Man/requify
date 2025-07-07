import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Dashboard,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Group,
  ArrowForward,
  Login,
  PersonAdd,
} from "@mui/icons-material";

import { useAuth } from "@/features/auth/model/auth.context";

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Assignment />,
      title: "Requirements",
      description: "Manage and track requirements",
      path: "/requirements",
      color: theme.palette.primary.main,
    },
    {
      icon: <RocketLaunch />,
      title: "Projects",
      description: "Organize your projects",
      path: "/projects",
      color: theme.palette.secondary.main,
    },
    {
      icon: <BugReport />,
      title: "Testing",
      description: "Test cases and execution",
      path: "/testing",
      color: theme.palette.warning.main,
    },
    {
      icon: <Analytics />,
      title: "Analytics",
      description: "Reports and insights",
      path: "/dashboard",
      color: theme.palette.success.main,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              mb: 3,
              boxShadow: theme.shadows[8],
            }}
          >
            <Dashboard sx={{ fontSize: "2.5rem", color: "white" }} />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Requify
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontWeight: 400 }}
          >
            Requirements Management System
          </Typography>

          {isAuthenticated ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Chip
                icon={<Group />}
                label={`Welcome back, ${user?.username || "User"}`}
                color="primary"
                variant="outlined"
              />
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/dashboard")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          ) : (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              mb={4}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<Login />}
                onClick={() => navigate("/login")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAdd />}
                onClick={() => navigate("/auth/register")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                Get Started
              </Button>
            </Stack>
          )}
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: `1px solid ${alpha(feature.color, 0.2)}`,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[12],
                    borderColor: feature.color,
                  },
                }}
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(feature.path);
                  } else {
                    navigate("/login");
                  }
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      backgroundColor: alpha(feature.color, 0.1),
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {React.cloneElement(feature.icon, { fontSize: "large" })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box textAlign="center" mt={8}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Requify. All rights reserved.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            mt={2}
          >
            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/start")}
            >
              Full Landing Page
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/api-overview")}
            >
              API Documentation
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage; 