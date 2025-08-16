import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Business,
  Engineering,
  HealthAndSafety,
  School,
  AccountBalance,
  Storefront,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const IndustrySolutions: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const solutions = [
    {
      industry: t("landing.solutions.fintech.title", "FinTech"),
      description: t(
        "landing.solutions.fintech.desc",
        "Compliance-ready requirements management for financial services."
      ),
      icon: <AccountBalance />,
      testimonial: {
        quote: t(
          "landing.solutions.fintech.testimonial",
          "Reduced compliance preparation time by 70%"
        ),
        author: "CTO, Finance Platform",
        avatar: "",
      },
    },
    {
      industry: t("landing.solutions.healthcare.title", "Healthcare"),
      description: t(
        "landing.solutions.healthcare.desc",
        "HIPAA-compliant workflows for medical software development."
      ),
      icon: <HealthAndSafety />,
      testimonial: {
        quote: t(
          "landing.solutions.healthcare.testimonial",
          "Streamlined FDA submission process significantly"
        ),
        author: "Head of Product, MedTech",
        avatar: "",
      },
    },
    {
      industry: t("landing.solutions.enterprise.title", "Enterprise"),
      description: t(
        "landing.solutions.enterprise.desc",
        "Scalable requirements management for large organizations."
      ),
      icon: <Business />,
      testimonial: {
        quote: t(
          "landing.solutions.enterprise.testimonial",
          "Improved cross-team alignment by 85%"
        ),
        author: "VP Engineering, Fortune 500",
        avatar: "",
      },
    },
    {
      industry: t("landing.solutions.startups.title", "Startups"),
      description: t(
        "landing.solutions.startups.desc",
        "Fast-moving teams need agile requirement management."
      ),
      icon: <Engineering />,
      testimonial: {
        quote: t(
          "landing.solutions.startups.testimonial",
          "Accelerated product development by 50%"
        ),
        author: "Founder, AI Startup",
        avatar: "",
      },
    },
    {
      industry: t("landing.solutions.education.title", "Education"),
      description: t(
        "landing.solutions.education.desc",
        "Academic institutions need structured requirement workflows."
      ),
      icon: <School />,
      testimonial: {
        quote: t(
          "landing.solutions.education.testimonial",
          "Enhanced student project quality remarkably"
        ),
        author: "Professor, Tech University",
        avatar: "",
      },
    },
    {
      industry: t("landing.solutions.retail.title", "Retail"),
      description: t(
        "landing.solutions.retail.desc",
        "E-commerce platforms require rapid feature iteration."
      ),
      icon: <Storefront />,
      testimonial: {
        quote: t(
          "landing.solutions.retail.testimonial",
          "Faster time-to-market for new features"
        ),
        author: "CTO, E-commerce Platform",
        avatar: "",
      },
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
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "10%",
          right: "-10%",
          width: "40%",
          height: "80%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.palette.primary.main}08 0%, transparent 60%)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "10%",
          left: "-10%",
          width: "40%",
          height: "80%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.palette.secondary.main}08 0%, transparent 60%)`,
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
                {t("landing.solutions.title", "Solutions for every")}{" "}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {t("landing.solutions.titleHighlight", "industry")}
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  lineHeight: 1.6,
                  maxWidth: "700px",
                  mx: "auto",
                }}
              >
                {t(
                  "landing.solutions.subtitle",
                  "Tailored requirement management workflows designed for your industry's unique challenges and compliance needs."
                )}
              </Typography>
            </Box>
          </Grid>

          {/* Solutions Grid */}
          <Grid item xs={12}>
            <Grid container spacing={4}>
              {solutions.map((solution, index) => (
                <Grid key={index} item xs={12} md={6} lg={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: "100%",
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: theme.shadows[16],
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Stack spacing={3} height="100%">
                      {/* Industry Header */}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: `${theme.palette.primary.main}15`,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {solution.icon}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {solution.industry}
                        </Typography>
                      </Stack>

                      {/* Description */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                          flexGrow: 1,
                        }}
                      >
                        {solution.description}
                      </Typography>

                      {/* Testimonial */}
                      <Box
                        sx={{
                          p: 3,
                          backgroundColor: `${theme.palette.primary.main}08`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontStyle: "italic",
                            color: theme.palette.text.primary,
                            mb: 2,
                            fontSize: "0.9rem",
                          }}
                        >
                          "{solution.testimonial.quote}"
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: theme.palette.primary.main,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {solution.testimonial.author.charAt(0)}
                          </Avatar>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {solution.testimonial.author}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 