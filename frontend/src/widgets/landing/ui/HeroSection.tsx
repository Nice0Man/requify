import React, { useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Verified,
  AutoAwesome,
  Group,
  Link,
  Timeline,
} from "@mui/icons-material";

interface HeroSectionProps {
  onGetStarted?: () => void;
  isAuthenticated?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  isAuthenticated = false,
}) => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const certifications = [
    "The best requirements management software",
    "Powerful and easy to use",
  ];

  const keyFeatures = [
    {
      icon: <AutoAwesome />,
      title: "AI-Powered Requirements Analysis",
      description: "Intelligent automation for better quality",
    },
    {
      icon: <Group />,
      title: "Real-time Team Collaboration",
      description: "Seamless workflow coordination",
    },
    {
      icon: <Link />,
      title: "Automated Testing Integration",
      description: "Built-in quality assurance",
    },
    {
      icon: <Timeline />,
      title: "Complete Audit Trail & Compliance",
      description: "Full traceability and governance",
    },
  ];

  const keyMetrics = [
    {
      value: "65%",
      label: "Faster Delivery",
    },
    {
      value: "40h",
      label: "Weekly Saved",
    },
    {
      value: "99.9%",
      label: "Uptime SLA",
    },
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
        scrollSnapAlign: "start",
        opacity: 0,
        transform: "translateY(50px)",
        transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
        "&.animate-in": {
          opacity: 1,
          transform: "translateY(0)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
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
          spacing={10}
          alignItems="center"
          sx={{ height: "100%", py: 4 }}
        >
          {/* Left Column - Content */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={8}>
              {/* Certifications */}
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  opacity: 0,
                  transform: "translateX(-40px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
                  ".animate-in &": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                }}
              >
                {certifications.map((cert, index) => (
                  <Chip
                    key={index}
                    label={cert}
                    size="medium"
                    icon={<Verified />}
                    sx={{
                      backgroundColor: `${theme.palette.success.main}10`,
                      color: theme.palette.success.main,
                      border: `1px solid ${theme.palette.success.main}30`,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      py: 1,
                      "& .MuiChip-icon": {
                        color: theme.palette.success.main,
                        fontSize: "1.2rem",
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* Main Heading */}
              <Stack
                spacing={4}
                sx={{
                  opacity: 0,
                  transform: "translateY(40px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
                  ".animate-in &": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem", lg: "4.5rem" },
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: theme.palette.text.primary,
                  }}
                >
                  Requirements Management
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      mt: 1,
                    }}
                  >
                    Made Simple
                  </Box>
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.4rem", md: "1.6rem" },
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: theme.palette.text.secondary,
                    maxWidth: "600px",
                  }}
                >
                  Transform your development process with intelligent
                  requirements management. From concept to deployment, ensure
                  nothing falls through the cracks.
                </Typography>
              </Stack>

              {/* CTA Button */}
              <Box
                sx={{
                  opacity: 0,
                  transform: "translateY(40px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s",
                  ".animate-in &": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={onGetStarted}
                  sx={{
                    py: 2.5,
                    px: 6,
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: "none",
                    boxShadow: theme.shadows[8],
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[16],
                    },
                  }}
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                </Button>
              </Box>

              {/* Key Metrics */}
              <Stack
                direction="row"
                spacing={6}
                sx={{
                  opacity: 0,
                  transform: "translateY(40px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.8s",
                  ".animate-in &": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                }}
              >
                {keyMetrics.map((metric, index) => (
                  <Stack key={index} spacing={1} alignItems="center">
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        lineHeight: 1,
                      }}
                    >
                      {metric.value}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        color: theme.palette.text.secondary,
                        textAlign: "center",
                        fontWeight: 500,
                      }}
                    >
                      {metric.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column - Features & Visual */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={6}>
              {/* Hero Image/Visual */}
              <Box
                sx={{
                  opacity: 0,
                  transform: "translateX(60px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
                  ".animate-in &": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: {
                      xs: "250px",
                      sm: "300px",
                      md: "350px",
                      lg: "400px",
                      xl: "450px",
                    },
                    maxHeight: "50vh",
                    minHeight: "200px",
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: theme.shadows[20],
                      zIndex: 100,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `radial-gradient(circle at 30% 40%, ${theme.palette.primary.main}40, transparent 70%)`,
                      opacity: 0.3,
                    },
                  }}
                >
                  <img
                    src="/assets/img/pannel/komp-uternaa-illustracia-3d-grafika-1600w.webp"
                    alt="Dashboard Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                      position: "relative",
                      zIndex: 100,
                    }}
                  />
                </Box>
              </Box>

              {/* Key Features List */}
              <Stack
                spacing={4}
                sx={{
                  opacity: 0,
                  transform: "translateX(40px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 1.2s",
                  ".animate-in &": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                }}
              >
                {keyFeatures.map((feature, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={3}
                    alignItems="flex-start"
                    sx={{
                      opacity: 0,
                      transform: "translateX(30px)",
                      transition: `all 1s cubic-bezier(0.4, 0, 0.2, 1) ${
                        1.2 + index * 0.15
                      }s`,
                      ".animate-in &": {
                        opacity: 1,
                        transform: "translateX(0)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: `${theme.palette.primary.main}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                        "& svg": {
                          fontSize: "1.5rem",
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Stack spacing={1}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: "1.2rem", md: "1.3rem" },
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          lineHeight: 1.3,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
