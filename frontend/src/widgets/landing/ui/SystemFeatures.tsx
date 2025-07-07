import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
} from "@mui/material";
import {
  AutoAwesome,
  Speed,
  Security,
  Analytics,
  Group,
  CheckCircle,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const SystemFeaturesSection: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const features = [
    {
      icon: <AutoAwesome />,
      title: t("landing.features.feature1.title", "Smart Analysis"),
      description: t(
        "landing.features.feature1.desc",
        "AI-powered requirements analysis with intelligent suggestions."
      ),
    },
    {
      icon: <Speed />,
      title: t("landing.features.feature2.title", "Fast Delivery"),
      description: t(
        "landing.features.feature2.desc",
        "Streamlined workflows that accelerate your development."
      ),
    },
    {
      icon: <Security />,
      title: t("landing.features.feature3.title", "Enterprise Security"),
      description: t(
        "landing.features.feature3.desc",
        "Bank-grade security with comprehensive audit trails."
      ),
    },
    {
      icon: <Analytics />,
      title: t("landing.features.feature4.title", "Real-time Analytics"),
      description: t(
        "landing.features.feature4.desc",
        "Comprehensive insights to track progress and measure success."
      ),
    },
    {
      icon: <Group />,
      title: t("landing.features.feature5.title", "Team Collaboration"),
      description: t(
        "landing.features.feature5.desc",
        "Seamless collaboration tools that keep your team aligned."
      ),
    },
    {
      icon: <CheckCircle />,
      title: t("landing.features.feature6.title", "Quality Assurance"),
      description: t(
        "landing.features.feature6.desc",
        "Built-in quality controls and validation for standards."
      ),
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
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main} 0%, transparent 50%), 
                           radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
      >
        <Grid container spacing={8} alignItems="center" sx={{ height: "100%" }}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 4, md: 6 },
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
                  mb: 3,
                  textAlign: "center",
                }}
              >
                {t("landing.features.title", "Everything you need to")}{" "}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {t("landing.features.titleHighlight", "manage requirements")}
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
                  textAlign: "center",
                  mx: "auto",
                }}
              >
                {t(
                  "landing.features.subtitle",
                  "Powerful features designed to simplify your workflow and enhance team productivity."
                )}
              </Typography>
            </Box>
          </Grid>

          {/* Features Grid */}
          <Grid item xs={12}>
            <Grid
              container
              spacing={3}
              sx={{
                alignItems: "stretch",
                maxWidth: "1200px",
                mx: "auto",
                justifyContent: "center",
              }}
            >
              {features.map((feature, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  key={index}
                  sx={{ display: "flex" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      width: "100%",
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[2],
                      transition:
                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[8],
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          backgroundColor: `${theme.palette.primary.main}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          mb: 2,
                          color: theme.palette.primary.main,
                          fontSize: "1.5rem",
                        }}
                      >
                        {feature.icon}
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1.5,
                          color: theme.palette.text.primary,
                          fontSize: "1.1rem",
                        }}
                      >
                        {feature.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                          fontSize: "0.9rem",
                          flex: 1,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
