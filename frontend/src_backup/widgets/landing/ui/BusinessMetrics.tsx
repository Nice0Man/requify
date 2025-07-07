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

export const BusinessMetrics: React.FC = () => {
  const theme = useTheme();
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
      label: "Efficiency Boost",
      description: "Average productivity increase",
      color: theme.palette.primary.main,
      animationKey: "efficiency",
      targetValue: 85,
    },
    {
      icon: <Speed />,
      value: "40h",
      label: "Time Saved",
      description: "Weekly per development team",
      color: theme.palette.success.main,
      animationKey: "timeSaved",
      targetValue: 40,
    },
    {
      icon: <People />,
      value: "500+",
      label: "Active Teams",
      description: "Using our platform daily",
      color: theme.palette.info.main,
      animationKey: "teamSize",
      targetValue: 500,
    },
    {
      icon: <Security />,
      value: "99.9%",
      label: "Uptime SLA",
      description: "Enterprise-grade reliability",
      color: theme.palette.warning.main,
      animationKey: "uptime",
      targetValue: 99.9,
    },
  ];

  const testimonials = [
    {
      quote:
        "Transformed our development process completely. We ship features 60% faster now.",
      author: "Sarah Chen",
      role: "Engineering Manager",
      company: "TechCorp",
    },
    {
      quote:
        "The best investment we made this year. ROI was visible within the first month.",
      author: "Michael Rodriguez",
      role: "CTO",
      company: "StartupXYZ",
    },
    {
      quote:
        "Finally, a tool that actually delivers on its promises. Our team loves it.",
      author: "Emma Thompson",
      role: "Product Lead",
      company: "InnovateLabs",
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
                Trusted by teams
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
                  worldwide
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
                Real results from real teams who've transformed their
                development process.
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
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: theme.shadows[20],
                        borderColor: metric.color,
                        "& .metric-icon": {
                          transform: "scale(1.1)",
                          backgroundColor: metric.color,
                          color: theme.palette.common.white,
                        },
                        "& .metric-value": {
                          transform: "scale(1.05)",
                        },
                        "&::before": {
                          opacity: 1,
                        },
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${metric.color}08, ${metric.color}02)`,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                    }}
                  >
                    <Stack 
                      spacing={3} 
                      alignItems="center" 
                      justifyContent="center"
                      sx={{ height: "100%", position: "relative", zIndex: 1 }}
                    >
                      {/* Icon */}
                      <Box
                        className="metric-icon"
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          backgroundColor: `${metric.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: metric.color,
                          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          "& svg": {
                            fontSize: "2rem",
                          },
                        }}
                      >
                        {metric.icon}
                      </Box>

                      {/* Value */}
                      <Typography
                        className="metric-value"
                        variant="h2"
                        sx={{
                          fontSize: { xs: "2.2rem", md: "2.8rem" },
                          fontWeight: 800,
                          color: metric.color,
                          lineHeight: 1,
                          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }}
                      >
                        {formatAnimatedValue(
                          animatedValues[
                            metric.animationKey as keyof typeof animatedValues
                          ],
                          metric
                        )}
                      </Typography>

                      {/* Label & Description */}
                      <Stack spacing={1.5} textAlign="center" sx={{ maxWidth: "200px" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            fontSize: { xs: "1.1rem", md: "1.2rem" },
                            lineHeight: 1.2,
                          }}
                        >
                          {metric.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            lineHeight: 1.4,
                            fontWeight: 500,
                          }}
                        >
                          {metric.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Testimonials */}
          <Grid item xs={12}>
            <Grid container spacing={6} sx={{ maxWidth: "1200px", mx: "auto" }}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      height: "100%",
                      minHeight: "200px",
                      p: { xs: 3, md: 4 },
                      borderRadius: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[4],
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-6px) scale(1.01)",
                        boxShadow: theme.shadows[16],
                        borderColor: theme.palette.primary.main,
                        "&::before": {
                          opacity: 1,
                        },
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}06, ${theme.palette.secondary.main}04)`,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                    }}
                  >
                    <Stack 
                      spacing={3} 
                      sx={{ 
                        height: "100%", 
                        position: "relative", 
                        zIndex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontStyle: "italic",
                          lineHeight: 1.6,
                          color: theme.palette.text.primary,
                          fontSize: { xs: "1.1rem", md: "1.2rem" },
                          fontWeight: 500,
                          flex: 1,
                        }}
                      >
                        "{testimonial.quote}"
                      </Typography>

                      <Stack spacing={0.5}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            fontSize: { xs: "1rem", md: "1.1rem" },
                          }}
                        >
                          {testimonial.author}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            fontWeight: 500,
                          }}
                        >
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
