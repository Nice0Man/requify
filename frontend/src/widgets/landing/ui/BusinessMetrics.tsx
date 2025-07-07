import React, { useEffect, useState } from "react";
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
import { TrendingUp, Speed, People, Security } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const BusinessMetrics: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [animatedValues, setAnimatedValues] = useState({
    efficiency: 85,
    timeSaved: 40,
    teamSize: 500,
    uptime: 99.9,
  });

  const metrics = [
    {
      icon: <TrendingUp />,
      value: "85%",
      label: t("landing.metrics.metric1.label", "Efficiency Boost"),
      description: t(
        "landing.metrics.metric1.desc",
        "Average productivity increase"
      ),
      color: theme.palette.primary.main,
      animationKey: "efficiency",
      targetValue: 85,
    },
    {
      icon: <Speed />,
      value: "40h",
      label: t("landing.metrics.metric2.label", "Time Saved"),
      description: t(
        "landing.metrics.metric2.desc",
        "Weekly per development team"
      ),
      color: theme.palette.success.main,
      animationKey: "timeSaved",
      targetValue: 40,
    },
    {
      icon: <People />,
      value: "500+",
      label: t("landing.metrics.metric3.label", "Active Teams"),
      description: t(
        "landing.metrics.metric3.desc",
        "Using our platform daily"
      ),
      color: theme.palette.info.main,
      animationKey: "teamSize",
      targetValue: 500,
    },
    {
      icon: <Security />,
      value: "99.9%",
      label: t("landing.metrics.metric4.label", "Uptime SLA"),
      description: t(
        "landing.metrics.metric4.desc",
        "Enterprise-grade reliability"
      ),
      color: theme.palette.warning.main,
      animationKey: "uptime",
      targetValue: 99.9,
    },
  ];

  const testimonials = [
    {
      quote: t(
        "landing.metrics.testimonial1.quote",
        "Transformed our development process completely. We ship features 60% faster now."
      ),
      author: t("landing.metrics.testimonial1.author", "Sarah Chen"),
      role: t("landing.metrics.testimonial1.role", "Engineering Manager"),
      company: t("landing.metrics.testimonial1.company", "TechCorp"),
    },
    {
      quote: t(
        "landing.metrics.testimonial2.quote",
        "The best investment we made this year. ROI was visible within the first month."
      ),
      author: t("landing.metrics.testimonial2.author", "Michael Rodriguez"),
      role: t("landing.metrics.testimonial2.role", "CTO"),
      company: t("landing.metrics.testimonial2.company", "StartupXYZ"),
    },
    {
      quote: t(
        "landing.metrics.testimonial3.quote",
        "Finally, a tool that actually delivers on its promises. Our team loves it."
      ),
      author: t("landing.metrics.testimonial3.author", "Emma Thompson"),
      role: t("landing.metrics.testimonial3.role", "Product Lead"),
      company: t("landing.metrics.testimonial3.company", "InnovateLabs"),
    },
  ];

  const formatAnimatedValue = (current: number, metric: any) => {
    if (metric.animationKey === "efficiency") return `${Math.round(current)}%`;
    if (metric.animationKey === "timeSaved") return `${Math.round(current)}h`;
    if (metric.animationKey === "teamSize") return `${Math.round(current)}+`;
    if (metric.animationKey === "uptime") return `${current.toFixed(1)}%`;
    return current.toString();
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.grey[50],
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
      >
        <Grid
          container
          spacing={10}
          alignItems="center"
          sx={{ height: "100%", py: 6 }}
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
                {t("landing.metrics.title", "Trusted by teams")}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    display: "block",
                    mt: 1,
                  }}
                >
                  {t("landing.metrics.titleHighlight", "worldwide")}
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
                  "landing.metrics.subtitle",
                  "Real results from real teams who've transformed their development process."
                )}
              </Typography>
            </Box>
          </Grid>

          {/* Metrics Grid */}
          <Grid item xs={12}>
            <Grid container spacing={6} sx={{ maxWidth: "1200px", mx: "auto" }}>
              {metrics.map((metric, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Box
                    sx={{
                      height: "100%",
                      minHeight: "280px",
                      p: { xs: 3, md: 4 },
                      textAlign: "center",
                      borderRadius: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[4],
                      transition:
                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: theme.shadows[20],
                        borderColor: metric.color,
                        "& .metric-icon": {
                          transform: "scale(1.2)",
                          backgroundColor: metric.color,
                          color: theme.palette.common.white,
                        },
                      },
                    }}
                  >
                    <Stack
                      spacing={3}
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Icon */}
                      <Box
                        className="metric-icon"
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          backgroundColor: `${metric.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: metric.color,
                          fontSize: "2.5rem",
                          transition: "all 0.3s ease",
                          mb: 2,
                        }}
                      >
                        {metric.icon}
                      </Box>

                      {/* Value */}
                      <Typography
                        variant="h2"
                        sx={{
                          fontSize: { xs: "2.5rem", md: "3rem" },
                          fontWeight: 700,
                          color: metric.color,
                          lineHeight: 1,
                        }}
                      >
                        {formatAnimatedValue(
                          animatedValues[
                            metric.animationKey as keyof typeof animatedValues
                          ],
                          metric
                        )}
                      </Typography>

                      {/* Label */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: { xs: "1.1rem", md: "1.3rem" },
                        }}
                      >
                        {metric.label}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.9rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {metric.description}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Testimonials Section */}
          <Grid item xs={12}>
            <Box sx={{ mt: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  textAlign: "center",
                  mb: 6,
                }}
              >
                {t(
                  "landing.metrics.testimonialsTitle",
                  "What our customers say"
                )}
              </Typography>

              <Grid
                container
                spacing={4}
                sx={{ maxWidth: "1200px", mx: "auto" }}
              >
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card
                      sx={{
                        height: "100%",
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[2],
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Stack spacing={3}>
                          <Typography
                            variant="body1"
                            sx={{
                              color: theme.palette.text.primary,
                              fontStyle: "italic",
                              lineHeight: 1.6,
                              fontSize: "1.1rem",
                            }}
                          >
                            "{testimonial.quote}"
                          </Typography>

                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                              }}
                            >
                              {testimonial.author}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                              }}
                            >
                              {testimonial.role} at {testimonial.company}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
