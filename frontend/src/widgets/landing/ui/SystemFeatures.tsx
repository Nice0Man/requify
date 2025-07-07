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

export const SystemFeatures: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const features = [
    {
      icon: <AutoAwesome />,
      title: t("landing.features.feature1.title", "Smart Analysis"),
      description: t(
        "landing.features.feature1.desc",
        "AI-powered requirements analysis with intelligent suggestions and automated quality checks."
      ),
      delay: 0,
    },
    {
      icon: <Speed />,
      title: t("landing.features.feature2.title", "Fast Delivery"),
      description: t(
        "landing.features.feature2.desc",
        "Streamlined workflows that accelerate your development process and reduce time-to-market."
      ),
      delay: 200,
    },
    {
      icon: <Security />,
      title: t("landing.features.feature3.title", "Enterprise Security"),
      description: t(
        "landing.features.feature3.desc",
        "Bank-grade security with comprehensive audit trails and compliance management."
      ),
      delay: 400,
    },
    {
      icon: <Analytics />,
      title: t("landing.features.feature4.title", "Real-time Analytics"),
      description: t(
        "landing.features.feature4.desc",
        "Comprehensive insights and reporting to track progress and measure success."
      ),
      delay: 600,
    },
    {
      icon: <Group />,
      title: t("landing.features.feature5.title", "Team Collaboration"),
      description: t(
        "landing.features.feature5.desc",
        "Seamless collaboration tools that keep your entire team aligned and productive."
      ),
      delay: 800,
    },
    {
      icon: <CheckCircle />,
      title: t("landing.features.feature6.title", "Quality Assurance"),
      description: t(
        "landing.features.feature6.desc",
        "Built-in quality controls and validation to ensure your requirements meet standards."
      ),
      delay: 1000,
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
        <Grid
          container
          spacing={8}
          alignItems="center"
          sx={{ height: "100%", py: 4 }}
        >
          {/* Header Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                maxWidth: "1000px",
                mx: "auto",
                px: 2,
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
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
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
              spacing={4}
              sx={{ alignItems: "stretch", maxWidth: "1200px", mx: "auto" }}
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
                      borderRadius: 4,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[3],
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: theme.shadows[12],
                        borderColor: theme.palette.primary.main,
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        "& .feature-icon": {
                          transform: "scale(1.15)",
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.common.white,
                        },
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Stack spacing={4} height="100%">
                        {/* Icon */}
                        <Box
                          className="feature-icon"
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            backgroundColor: `${theme.palette.primary.main}10`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.palette.primary.main,
                            fontSize: "2rem",
                            transition: "all 0.3s ease",
                            flexShrink: 0,
                          }}
                        >
                          {feature.icon}
                        </Box>

                        {/* Content */}
                        <Stack spacing={2} sx={{ flex: 1 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              fontSize: { xs: "1.3rem", md: "1.5rem" },
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: theme.palette.text.secondary,
                              lineHeight: 1.6,
                              fontSize: "1rem",
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Stack>
                      </Stack>
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
