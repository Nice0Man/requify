import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { Verified, ArrowForward } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const certifications = [
    t("landing.hero.certification1", "Best requirements management"),
    t("landing.hero.certification2", "Powerful and easy to use"),
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
        mt: -10,
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
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main} 0%, transparent 50%), 
                           radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
        },
        // Анимированные пузыри на фоне
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `
            radial-gradient(circle at 15% 20%, ${alpha(
              theme.palette.primary.main,
              0.15
            )} 0%, transparent 40%),
            radial-gradient(circle at 85% 15%, ${alpha(
              theme.palette.secondary.main,
              0.12
            )} 0%, transparent 45%),
            radial-gradient(circle at 70% 85%, ${alpha(
              theme.palette.primary.light,
              0.1
            )} 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, ${alpha(
              theme.palette.secondary.light,
              0.14
            )} 0%, transparent 42%),
            radial-gradient(circle at 60% 40%, ${alpha(
              theme.palette.primary.main,
              0.08
            )} 0%, transparent 55%),
            radial-gradient(circle at 90% 60%, ${alpha(
              theme.palette.secondary.main,
              0.1
            )} 0%, transparent 48%),
            radial-gradient(circle at 10% 85%, ${alpha(
              theme.palette.primary.light,
              0.12
            )} 0%, transparent 40%),
            radial-gradient(circle at 45% 10%, ${alpha(
              theme.palette.secondary.light,
              0.08
            )} 0%, transparent 52%)
          `,
          animation: "bubbles 25s ease-in-out infinite",
          "@keyframes bubbles": {
            "0%": {
              transform: "translateY(0px)",
              opacity: 1,
            },
            "25%": {
              transform: "translateY(-15px)",
              opacity: 0.8,
            },
            "50%": {
              transform: "translateY(-5px)",
              opacity: 0.9,
            },
            "75%": {
              transform: "translateY(-20px)",
              opacity: 0.7,
            },
            "100%": {
              transform: "translateY(0px)",
              opacity: 1,
            },
          },
        },
      }}
    >
      {/* Случайно распределенные пузыри по всему экрану */}
      {/* Левая верхняя область */}
      <Box
        sx={{
          position: "absolute",
          top: "8%",
          left: "12%",
          width: "85px",
          height: "85px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.18
          )} 0%, transparent 70%)`,
          zIndex: 0,
          animation: "randomFloat1 16s ease-in-out infinite",
          "@keyframes randomFloat1": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-12px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "22%",
          left: "6%",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.secondary.light, 0.24),
          zIndex: 0,
          animation: "randomFloat2 13s ease-in-out infinite 3s",
          "@keyframes randomFloat2": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-8px)" },
          },
        }}
      />

      {/* Правая верхняя область */}
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          right: "18%",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.secondary.main,
            0.16
          )} 0%, transparent 70%)`,
          zIndex: 0,
          animation: "randomFloat3 19s ease-in-out infinite 2s",
          "@keyframes randomFloat3": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-18px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "28%",
          right: "8%",
          width: "95px",
          height: "95px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.light, 0.14),
          zIndex: 0,
          animation: "randomFloat4 22s ease-in-out infinite 7s",
          "@keyframes randomFloat4": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-22px)" },
          },
        }}
      />

      {/* Центральная область */}
      <Box
        sx={{
          position: "absolute",
          top: "42%",
          left: "25%",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.secondary.main, 0.22),
          zIndex: 0,
          animation: "randomFloat5 14s ease-in-out infinite 1s",
          "@keyframes randomFloat5": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-11px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "38%",
          right: "35%",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.main, 0.28),
          zIndex: 0,
          animation: "randomFloat6 11s ease-in-out infinite 5s",
          "@keyframes randomFloat6": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-6px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "52%",
          left: "45%",
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.light,
            0.19
          )} 0%, transparent 70%)`,
          zIndex: 0,
          animation: "randomFloat7 17s ease-in-out infinite 4s",
          "@keyframes randomFloat7": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-14px)" },
          },
        }}
      />

      {/* Нижняя область */}
      <Box
        sx={{
          position: "absolute",
          bottom: "28%",
          left: "18%",
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.secondary.light, 0.21),
          zIndex: 0,
          animation: "randomFloat8 18s ease-in-out infinite 6s",
          "@keyframes randomFloat8": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-13px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "18%",
          right: "22%",
          width: "76px",
          height: "76px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.secondary.main,
            0.15
          )} 0%, transparent 70%)`,
          zIndex: 0,
          animation: "randomFloat9 21s ease-in-out infinite 9s",
          "@keyframes randomFloat9": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-19px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "35%",
          left: "65%",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.main, 0.25),
          zIndex: 0,
          animation: "randomFloat10 15s ease-in-out infinite 8s",
          "@keyframes randomFloat10": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-9px)" },
          },
        }}
      />

      {/* Дополнительные мелкие пузыри для деталей */}
      <Box
        sx={{
          position: "absolute",
          top: "65%",
          left: "82%",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.secondary.main, 0.30),
          zIndex: 0,
          animation: "smallFloat1 12s ease-in-out infinite 2s",
          "@keyframes smallFloat1": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-5px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "45%",
          right: "42%",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.light, 0.23),
          zIndex: 0,
          animation: "smallFloat2 16s ease-in-out infinite 10s",
          "@keyframes smallFloat2": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-12px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "72%",
          left: "72%",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.secondary.light, 0.26),
          zIndex: 0,
          animation: "smallFloat3 14s ease-in-out infinite 1s",
          "@keyframes smallFloat3": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-7px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "48%",
          left: "8%",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.main, 0.20),
          zIndex: 0,
          animation: "smallFloat4 20s ease-in-out infinite 11s",
          "@keyframes smallFloat4": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-16px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "55%",
          right: "12%",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.secondary.main,
            0.17
          )} 0%, transparent 70%)`,
          zIndex: 0,
          animation: "smallFloat5 18s ease-in-out infinite 4s",
          "@keyframes smallFloat5": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-15px)" },
          },
        }}
      />

      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
      >
        <Grid
          container
          spacing={{ xs: 6, md: 8 }}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          {/* Left Column - Content */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={{ xs: 4, md: 6 }}>
              {/* Certifications */}
              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                useFlexGap
                sx={{ justifyContent: { xs: "center", lg: "flex-start" } }}
              >
                {certifications.map((cert, index) => (
                  <Chip
                    key={index}
                    label={cert}
                    size="medium"
                    icon={<Verified />}
                    sx={{
                      backgroundColor: `${theme.palette.success.main}08`,
                      color: theme.palette.success.main,
                      border: `1px solid ${theme.palette.success.main}20`,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      fontWeight: 500,
                      height: { xs: 32, md: 36 },
                      px: 1.5,
                    }}
                  />
                ))}
              </Stack>

              {/* Main Title */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3rem", sm: "4rem", md: "5rem", lg: "6rem" },
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: theme.palette.text.primary,
                  textAlign: { xs: "center", lg: "left" },
                }}
              >
                {t("landing.hero.title", "Transform your")}{" "}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {t("landing.hero.titleHighlight", "requirements")}
                </Box>
              </Typography>

              {/* Subtitle */}
              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: {
                    xs: "1.3rem",
                    sm: "1.5rem",
                    md: "1.7rem",
                    lg: "1.8rem",
                  },
                  lineHeight: 1.6,
                  fontWeight: 400,
                  maxWidth: "700px",
                  textAlign: { xs: "center", lg: "left" },
                }}
              >
                {t(
                  "landing.hero.subtitle",
                  "AI-powered requirements management that streamlines your development process and accelerates delivery."
                )}
              </Typography>

              {/* CTA Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: { xs: "center", lg: "flex-start" },
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={onGetStarted}
                  sx={{
                    py: 2,
                    px: 5,
                    fontSize: { xs: "1.2rem", md: "1.3rem" },
                    fontWeight: 600,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  {t("landing.hero.getStarted", "Get Started Free")}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 2,
                    px: 5,
                    fontSize: { xs: "1.2rem", md: "1.3rem" },
                    fontWeight: 600,
                    borderRadius: 3,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  }}
                >
                  {t("landing.hero.demo", "Watch Demo")}
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column - Dashboard Image */}
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: { xs: "90%", md: "80%" },
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: `0 25px 50px -12px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    zIndex: 1,
                    borderRadius: 4,
                  },
                }}
              >
                <Box
                  component="picture"
                  sx={{
                    display: "block",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {/* WebP источники для разных размеров экрана */}
                  <source
                    media="(min-width: 1200px)"
                    srcSet="/assets/img/pannel/1600w.webp"
                    type="image/webp"
                  />
                  <source
                    media="(min-width: 800px)"
                    srcSet="/assets/img/pannel/1200w.webp"
                    type="image/webp"
                  />
                  <source
                    media="(max-width: 799px)"
                    srcSet="/assets/img/pannel/800w.webp"
                    type="image/webp"
                  />

                  {/* Fallback изображение */}
                  <Box
                    component="img"
                    src="/assets/img/pannel/komp-uternaa-illustracia-3d-grafika.jpg"
                    alt={t(
                      "landing.hero.dashboardAlt",
                      "Requify Dashboard - Modern Requirements Management Interface"
                    )}
                    sx={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      borderRadius: 4,
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                      },
                    }}
                    loading="lazy"
                  />
                </Box>

                {/* Декоративные элементы */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    opacity: 0.1,
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -30,
                    left: -30,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    opacity: 0.08,
                    zIndex: 0,
                  }}
                />
              </Box>

              {/* Floating badges */}
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: "10%", md: "15%" },
                  left: { xs: "-5%", md: "-10%" },
                  zIndex: 3,
                }}
              >
                <Chip
                  label={t("landing.hero.badge1", "AI-Powered")}
                  sx={{
                    color: "white",
                    backgroundColor: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    px: 2.5,
                    py: 0.8,
                    height: { xs: 40, md: 44 },
                    boxShadow: theme.shadows[8],
                    animation: "float 3s ease-in-out infinite",
                    "@keyframes float": {
                      "0%, 100%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-10px)" },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: "10%", md: "20%" },
                  right: { xs: "-5%", md: "-10%" },
                  zIndex: 3,
                }}
              >
                <Chip
                  label={t("landing.hero.badge2", "Real-time")}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    px: 2.5,
                    py: 0.8,
                    height: { xs: 40, md: 44 },
                    boxShadow: theme.shadows[8],
                    animation: "float2 3s ease-in-out infinite 1.5s",
                    "@keyframes float2": {
                      "0%, 100%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-8px)" },
                    },
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
