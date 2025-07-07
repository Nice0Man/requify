import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { 
  ArrowForward, 
  GetApp, 
  Schedule, 
  Phone,
  Email,
  CheckCircle 
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface CTAVariant {
  id: 'standard' | 'professional';
  title: string;
  subtitle: string;
  features: string[];
  primaryButton: {
    text: string;
    action: () => void;
    icon?: React.ReactNode;
  };
  secondaryButton?: {
    text: string;
    action: () => void;
    icon?: React.ReactNode;
  };
}

export const CTASection: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth?mode=register");
  };

  const handleContactSales = () => {
    navigate("/contact");
  };

  const handleScheduleDemo = () => {
    // Можно открыть календарь бронирования или форму
    window.open("https://calendly.com/requify-demo", "_blank");
  };

  const ctaVariants: CTAVariant[] = [
    {
      id: 'standard',
      title: t("landing.cta.standard.title", "Готовы трансформировать управление требованиями?"),
      subtitle: t(
        "landing.cta.standard.subtitle",
        "Присоединяйтесь к тысячам команд, которые уже оптимизировали свой рабочий процесс и ускорили разработку."
      ),
      features: [
        t("landing.cta.feature1", "Бесплатный 14-дневный пробный период"),
        t("landing.cta.feature2", "Настройка за 5 минут"),
        t("landing.cta.feature3", "Кредитная карта не требуется"),
      ],
      primaryButton: {
        text: t("landing.cta.primaryButton", "Начать бесплатно"),
        action: handleGetStarted,
        icon: <ArrowForward />,
      },
      secondaryButton: {
        text: t("landing.cta.secondaryButton", "Посмотреть демо"),
        action: handleScheduleDemo,
      },
    },
    {
      id: 'professional',
      title: t("landing.cta.professional.title", "Нужно профессиональное решение?"),
      subtitle: t(
        "landing.cta.professional.subtitle",
        "Получите персональную консультацию и индивидуальное предложение для вашей организации."
      ),
      features: [
        t("landing.cta.pro.feature1", "Персональная настройка"),
        t("landing.cta.pro.feature2", "Приоритетная поддержка"),
        t("landing.cta.pro.feature3", "Корпоративная безопасность"),
      ],
      primaryButton: {
        text: t("landing.cta.contactSales", "Связаться с продажами"),
        action: handleContactSales,
        icon: <Phone />,
      },
      secondaryButton: {
        text: t("landing.cta.email", "Написать email"),
        action: () => window.open("mailto:sales@requify.com", "_blank"),
        icon: <Email />,
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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(100px)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(100px)",
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
          justifyContent="center"
          sx={{ height: "100%" }}
        >
          {/* Main CTA Section */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4} alignItems={{ xs: "center", lg: "flex-start" }} sx={{ textAlign: { xs: "center", lg: "left" } }}>
              {/* Main Headline */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4.5rem" },
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  maxWidth: "800px",
                }}
              >
                {ctaVariants[0].title.split("управление требованиями")[0]}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  управление требованиями
                </Box>
                ?
              </Typography>

              {/* Subtitle */}
              <Typography
                variant="h5"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  lineHeight: 1.6,
                  maxWidth: "600px",
                }}
              >
                {ctaVariants[0].subtitle}
              </Typography>

              {/* Features List */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{
                  my: 2,
                  alignItems: { xs: "center", lg: "flex-start" },
                  justifyContent: { xs: "center", lg: "flex-start" },
                }}
              >
                {ctaVariants[0].features.map((feature, index) => {
                  const icons = [<GetApp key="get" />, <Schedule key="schedule" />, <CheckCircle key="check" />];
                  return (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <Box sx={{ fontSize: "1rem" }}>{icons[index]}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feature}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>

              {/* Primary CTA Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ 
                  mt: 3,
                  alignItems: { xs: "center", lg: "flex-start" },
                  justifyContent: { xs: "center", lg: "flex-start" },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={ctaVariants[0].primaryButton.icon}
                  onClick={ctaVariants[0].primaryButton.action}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    backgroundColor: "white",
                    color: theme.palette.primary.main,
                    textTransform: "none",
                    boxShadow: theme.shadows[8],
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.95)",
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[16],
                    },
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                >
                  {ctaVariants[0].primaryButton.text}
                </Button>

                {ctaVariants[0].secondaryButton && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={ctaVariants[0].secondaryButton.action}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 3,
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      textTransform: "none",
                      borderWidth: 2,
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderWidth: 2,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    }}
                  >
                    {ctaVariants[0].secondaryButton.text}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* Professional CTA Card */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                backgroundColor: alpha("#ffffff", 0.15),
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 3,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  mb: 2,
                  lineHeight: 1.3,
                }}
              >
                {ctaVariants[1].title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  mb: 3,
                  lineHeight: 1.5,
                }}
              >
                {ctaVariants[1].subtitle}
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {ctaVariants[1].features.map((feature, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    <CheckCircle sx={{ fontSize: "1rem" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={ctaVariants[1].primaryButton.icon}
                  onClick={ctaVariants[1].primaryButton.action}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  {ctaVariants[1].primaryButton.text}
                </Button>

                {ctaVariants[1].secondaryButton && (
                  <Button
                    variant="text"
                    size="medium"
                    startIcon={ctaVariants[1].secondaryButton.icon}
                    onClick={ctaVariants[1].secondaryButton.action}
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      textTransform: "none",
                      "&:hover": {
                        color: "white",
                        backgroundColor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    {ctaVariants[1].secondaryButton.text}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 