import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import {
  GitHub,
  CloudQueue,
  Business,
  IntegrationInstructions,
  Api,
  WebhookOutlined,
  Settings,
  Security,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const IntegrationsShowcase: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const integrations = [
    {
      name: "GitHub",
      description: t(
        "landing.integrations.github.desc",
        "Sync requirements with code repositories"
      ),
      icon: <GitHub />,
      category: t("landing.integrations.github.category", "Version Control"),
    },
    {
      name: "Slack",
      description: t(
        "landing.integrations.slack.desc",
        "Real-time notifications and updates"
      ),
      icon: <Business />,
      category: t("landing.integrations.slack.category", "Communication"),
    },
    {
      name: "Jira",
      description: t(
        "landing.integrations.jira.desc",
        "Seamless project management integration"
      ),
      icon: <IntegrationInstructions />,
      category: t("landing.integrations.jira.category", "Project Management"),
    },
    {
      name: "REST API",
      description: t(
        "landing.integrations.api.desc",
        "Custom integrations via REST API"
      ),
      icon: <Api />,
      category: t("landing.integrations.api.category", "Development"),
    },
    {
      name: "Webhooks",
      description: t(
        "landing.integrations.webhooks.desc",
        "Real-time event notifications"
      ),
      icon: <WebhookOutlined />,
      category: t("landing.integrations.webhooks.category", "Automation"),
    },
    {
      name: "SSO",
      description: t(
        "landing.integrations.sso.desc",
        "Enterprise authentication systems"
      ),
      icon: <Security />,
      category: t("landing.integrations.sso.category", "Security"),
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        // Поддержка новых viewport units для мобильных устройств
        "@supports (height: 100dvh)": {
          minHeight: "100dvh",
        },
        // Fallback для старых браузеров
        "@supports not (height: 100dvh)": {
          minHeight: "calc(var(--vh, 1vh) * 100)",
        },
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 6 },
        background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.palette.primary.main}12 0%, transparent 70%)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.palette.secondary.main}08 0%, transparent 70%)`,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
      >
        <Grid
          container
          spacing={6}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          {/* Header Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 3, md: 4 },
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  mb: 2,
                }}
              >
                {t("landing.integrations.title", "Seamless")}{" "}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {t("landing.integrations.titleHighlight", "integrations")}
                </Box>
              </Typography>

              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  lineHeight: 1.6,
                  maxWidth: "700px",
                  mx: "auto",
                }}
              >
                {t(
                  "landing.integrations.subtitle",
                  "Connect with your favorite tools and streamline your workflow with powerful integrations."
                )}
              </Typography>
            </Box>
          </Grid>

          {/* Integrations Grid */}
          <Grid item xs={12}>
            <Grid
              container
              spacing={3}
              sx={{
                alignItems: "stretch",
                maxWidth: "1000px",
                mx: "auto",
                justifyContent: "center",
              }}
            >
              {integrations.map((integration, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={index}
                  sx={{ display: "flex" }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      width: "100%",
                      p: 3,
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[8],
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        backgroundColor: `${theme.palette.primary.main}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.main,
                        fontSize: "1.75rem",
                        mb: 2,
                      }}
                    >
                      {integration.icon}
                    </Box>

                    {/* Content */}
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: "1.1rem",
                        }}
                      >
                        {integration.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {integration.category}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.5,
                          fontSize: "0.85rem",
                          mt: 1,
                        }}
                      >
                        {integration.description}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Bottom CTA */}
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                mt: { xs: 2, md: 3 },
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {t(
                  "landing.integrations.cta",
                  "Need a custom integration? Our API makes it easy."
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 