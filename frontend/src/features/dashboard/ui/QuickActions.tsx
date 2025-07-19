import React from "react";
import i18n from "@/shared/lib/i18n";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  RocketLaunch as RocketIcon,
  BugReport as BugIcon,
} from "@mui/icons-material";

export const QuickActions: React.FC = () => {
  const t = i18n.t;
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions = [
    {
      id: "create-project",
      title: t("dashboard.quickActions.createProject"),
      description: t("dashboard.quickActions.createProjectDesc"),
      icon: <AddIcon />,
      color: "primary",
      onClick: () => navigate("/projects/create"),
    },
    {
      id: "create-requirement",
      title: t("dashboard.quickActions.createRequirement"),
      description: t("dashboard.quickActions.createRequirementDesc"),
      icon: <AssignmentIcon />,
      color: "secondary",
      onClick: () => navigate("/requirements/create"),
    },
    {
      id: "create-release",
      title: t("dashboard.quickActions.createRelease"),
      description: t("dashboard.quickActions.createReleaseDesc"),
      icon: <RocketIcon />,
      color: "success",
      onClick: () => navigate("/releases/create"),
    },
    {
      id: "create-test-case",
      title: t("dashboard.quickActions.createTestCase"),
      description: t("dashboard.quickActions.createTestCaseDesc"),
      icon: <BugIcon />,
      color: "warning",
      onClick: () => navigate("/testing/create"),
    },
  ];

  const ActionCard: React.FC<{
    action: (typeof quickActions)[0];
    index: number;
  }> = ({ action, index }) => {
    return (
      <Grid item xs={12} sm={6} md={3} key={action.id}>
        <Card
          sx={{
            height: "100%",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-8px) scale(1.02)",
              boxShadow: `0 20px 40px ${alpha(
                (
                  theme.palette[
                    action.color as
                      | "primary"
                      | "secondary"
                      | "success"
                      | "warning"
                  ] as any
                ).main,
                0.2
              )}`,
            },
            border: `1px solid ${alpha(
              (
                theme.palette[
                  action.color as
                    | "primary"
                    | "secondary"
                    | "success"
                    | "warning"
                ] as any
              ).main,
              0.1
            )}`,
            background: `linear-gradient(135deg, ${alpha(
              (
                theme.palette[
                  action.color as
                    | "primary"
                    | "secondary"
                    | "success"
                    | "warning"
                ] as any
              ).main,
              0.05
            )} 0%, transparent 50%)`,
          }}
          onClick={action.onClick}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: alpha(
                    (
                      theme.palette[
                        action.color as
                          | "primary"
                          | "secondary"
                          | "success"
                          | "warning"
                      ] as any
                    ).main,
                    0.1
                  ),
                  color: (
                    theme.palette[
                      action.color as
                        | "primary"
                        | "secondary"
                        | "success"
                        | "warning"
                    ] as any
                  ).main,
                  mr: 2,
                }}
              >
                {action.icon}
              </Box>
            </Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {action.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {action.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color={action.color as any}
              sx={{ ml: "auto" }}
            >
              {t("dashboard.quickActionsButtonText")}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(10px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("dashboard.quickActionsTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.quickActionsDescription")}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <ActionCard key={action.id} action={action} index={index} />
        ))}
      </Grid>
    </Paper>
  );
};
