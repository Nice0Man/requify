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
  ArrowForward,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ResponsiveImage } from "@/shared/ui";

interface HeroSectionProps {
  onGetStarted?: () => void;
  isAuthenticated?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  isAuthenticated = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
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
    t(
      "landing.hero.certification1",
      "The best requirements management software"
    ),
    t("landing.hero.certification2", "Powerful and easy to use"),
  ];

  const keyFeatures = [
    {
      icon: <AutoAwesome />,
      title: t(
        "landing.hero.feature1.title",
        "AI-Powered Requirements Analysis"
      ),
      description: t(
        "landing.hero.feature1.desc",
        "Intelligent automation for better quality"
      ),
    },
    {
      icon: <Group />,
      title: t("landing.hero.feature2.title", "Real-time Team Collaboration"),
      description: t(
        "landing.hero.feature2.desc",
        "Seamless workflow coordination"
      ),
    },
    {
      icon: <Link />,
      title: t("landing.hero.feature3.title", "Automated Testing Integration"),
      description: t(
        "landing.hero.feature3.desc",
        "Built-in quality assurance"
      ),
    },
    {
      icon: <Timeline />,
      title: t(
        "landing.hero.feature4.title",
        "Complete Audit Trail & Compliance"
      ),
      description: t(
        "landing.hero.feature4.desc",
        "Full traceability and governance"
      ),
    },
  ];

  const keyMetrics = [
    {
      value: "65%",
      label: t("landing.hero.metric1", "Faster Delivery"),
    },
    {
      value: "40h",
      label: t("landing.hero.metric2", "Weekly Saved"),
    },
    {
      value: "99.9%",
      label: t("landing.hero.metric3", "Uptime SLA"),
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
                    fontSize: { xs: "4rem", md: "5rem", lg: "5.5rem" },
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: theme.palette.text.primary,
                  }}
                >
                  {t("landing.hero.title", "Requify")}
                  <Box
                    component="span"
                    sx={{
                      fontSize: { xs: "3rem", md: "4rem", lg: "4.5rem" },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      display: "block",
                    }}
                  >
                    {t("landing.hero.subtitle", "Requirements Management")}
                  </Box>
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    fontWeight: 400,
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                    maxWidth: "600px",
                  }}
                >
                  {t(
                    "landing.hero.description",
                    "Streamline your development process with intelligent requirements management, automated testing, and seamless team collaboration."
                  )}
                </Typography>
              </Stack>

              {/* CTA Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
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
                  endIcon={<ArrowForward />}
                  onClick={onGetStarted}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: "none",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  {isAuthenticated
                    ? t("landing.hero.goToDashboard", "Go to Dashboard")
                    : t("landing.hero.getStarted", "Get Started")}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: `${theme.palette.primary.main}10`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {t("landing.hero.learnMore", "Learn More")}
                </Button>
              </Stack>

              {/* Key Metrics */}
              <Grid
                container
                spacing={4}
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
                  <Grid item xs={4} key={index}>
                    <Stack spacing={1} alignItems="flex-start">
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: { xs: "1.8rem", md: "2.5rem" },
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {metric.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          textAlign: "left",
                        }}
                      >
                        {metric.label}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          {/* Right Column - Hero Image & Visual */}
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
                      zIndex: 1,
                    },
                  }}
                >
                  <ResponsiveImage
                    src="/assets/img/pannel/komp-uternaa-illustracia-3d-grafika-1600w.webp"
                    srcSet="/assets/img/pannel/komp-uternaa-illustracia-3d-grafika-800w.webp 800w, /assets/img/pannel/komp-uternaa-illustracia-3d-grafika-1200w.webp 1200w, /assets/img/pannel/komp-uternaa-illustracia-3d-grafika-1600w.webp 1600w"
                    sizes="(max-width: 600px) 800px, (max-width: 1200px) 1200px, 1600px"
                    alt={t(
                      "landing.hero.dashboardPreview",
                      "Dashboard Preview"
                    )}
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "inherit",
                      position: "relative",
                      zIndex: 2,
                    }}
                    priority={true}
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
