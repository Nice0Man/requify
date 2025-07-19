import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Paper,
  Avatar,
} from "@mui/material";
import {
  Business,
  Engineering,
  ManageAccounts,
  CheckCircle,
  ArrowForward,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface TargetAudienceCardProps {
  icon: React.ReactNode;
  title: string;
  role: string;
  challenges: string[];
  solutions: string[];
  delay: number;
}

const TargetAudienceCard: React.FC<TargetAudienceCardProps> = ({
  icon,
  title,
  role,
  challenges,
  solutions,
  delay,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Zoom in timeout={delay}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: "100%",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )}, ${alpha(theme.palette.background.paper, 0.98)})`,
          backdropFilter: "blur(20px)",
          border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 4,
          transition: "all 0.4s ease-in-out",
          transform: isHovered ? "translateY(-12px)" : "translateY(0)",
          boxShadow: isHovered
            ? `0 25px 50px ${alpha(theme.palette.primary.main, 0.2)}`
            : `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.4),
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header with Icon and Title */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                mr: 2,
                transform: isHovered
                  ? "rotate(5deg) scale(1.05)"
                  : "rotate(0deg) scale(1)",
                transition: "transform 0.3s ease-in-out",
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { color: "#ffffff", fontSize: 28 },
              })}
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {role}
              </Typography>
            </Box>
          </Box>

          {/* Challenges */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.palette.error.main,
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: 1,
              }}
            >
              {t("business.labels.challenges", "Проблемы")}
            </Typography>
            {challenges.map((challenge, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 1,
                  opacity: 0.8,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.error.main,
                    mt: 1,
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.85rem",
                  }}
                >
                  {challenge}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Solutions */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.palette.success.main,
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: 1,
              }}
            >
              {t("business.labels.solutions", "Решения Requify")}
            </Typography>
            {solutions.map((solution, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <CheckCircle
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: 16,
                    mt: 0.5,
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  {solution}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

interface ROIMetricProps {
  value: string;
  label: string;
  description: string;
  color: string;
  delay: number;
}

const ROIMetric: React.FC<ROIMetricProps> = ({
  value,
  label,
  description,
  color,
  delay,
}) => {
  const theme = useTheme();

  return (
    <Fade in timeout={delay}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: "100%",
          textAlign: "center",
          backgroundColor: alpha(color, 0.05),
          border: `2px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
            borderColor: color,
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: color,
            mb: 1,
            fontSize: { xs: "2rem", md: "2.5rem" },
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.85rem",
          }}
        >
          {description}
        </Typography>
      </Paper>
    </Fade>
  );
};

interface TestimonialProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  avatar: string;
  delay: number;
}

const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  position,
  company,
  avatar,
  delay,
}) => {
  const theme = useTheme();

  return (
    <Fade in timeout={delay}>
      <Card
        elevation={0}
        sx={{
          p: 4,
          height: "100%",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 3,
          position: "relative",
          "&::before": {
            content: '"\\201C"', // Left double quotation mark
            position: "absolute",
            top: 16,
            left: 20,
            fontSize: "3rem",
            color: alpha(theme.palette.primary.main, 0.2),
            fontFamily: "serif",
            lineHeight: 1,
          },
        }}
      >
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.primary,
              fontStyle: "italic",
              lineHeight: 1.6,
              position: "relative",
              zIndex: 1,
            }}
          >
            {quote}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={avatar}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {author.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {author}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.85rem",
                }}
              >
                {position}, {company}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Fade>
  );
};

const TargetAudienceSection: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const targetAudience = [
    {
      icon: <Business />,
      title: t("audience.projectManagers.title", "Проект-менеджеры"),
      role: t("audience.projectManagers.role", "ЛИДЕРЫ ПРОЕКТОВ"),
      challenges: [
        t(
          "audience.projectManagers.challenges.0",
          "Сложности с отслеживанием изменений требований"
        ),
        t(
          "audience.projectManagers.challenges.1",
          "Проблемы коммуникации между командами"
        ),
        t(
          "audience.projectManagers.challenges.2",
          "Отсутствие единого источника правды"
        ),
        t(
          "audience.projectManagers.challenges.3",
          "Проблемы с планированием и оценкой сроков"
        ),
      ],
      solutions: [
        t(
          "audience.projectManagers.solutions.0",
          "Централизованное управление требованиями"
        ),
        t(
          "audience.projectManagers.solutions.1",
          "Автоматическое отслеживание изменений"
        ),
        t(
          "audience.projectManagers.solutions.2",
          "Интегрированные коммуникационные инструменты"
        ),
        t(
          "audience.projectManagers.solutions.3",
          "Аналитика и метрики проекта в реальном времени"
        ),
      ],
      delay: 200,
    },
    {
      icon: <Engineering />,
      title: t("audience.developers.title", "Разработчики"),
      role: t("audience.developers.role", "ТЕХНИЧЕСКАЯ КОМАНДА"),
      challenges: [
        t(
          "audience.developers.challenges.0",
          "Неясные или изменяющиеся требования"
        ),
        t(
          "audience.developers.challenges.1",
          "Отсутствие связи между требованиями и кодом"
        ),
        t(
          "audience.developers.challenges.2",
          "Проблемы с тестированием и валидацией"
        ),
        t("audience.developers.challenges.3", "Сложности с документированием"),
      ],
      solutions: [
        t(
          "audience.developers.solutions.0",
          "Четко структурированные технические требования"
        ),
        t(
          "audience.developers.solutions.1",
          "Интеграция с системами контроля версий"
        ),
        t("audience.developers.solutions.2", "Автоматическая генерация тестов"),
        t(
          "audience.developers.solutions.3",
          "API для интеграции с IDE и инструментами"
        ),
      ],
      delay: 400,
    },
    {
      icon: <ManageAccounts />,
      title: t("audience.analysts.title", "Бизнес-аналитики"),
      role: t("audience.analysts.role", "АНАЛИТИКИ"),
      challenges: [
        t(
          "audience.analysts.challenges.0",
          "Сложности с документированием бизнес-процессов"
        ),
        t("audience.analysts.challenges.1", "Проблемы с валидацией требований"),
        t(
          "audience.analysts.challenges.2",
          "Отсутствие связи между бизнес- и техническими требованиями"
        ),
        t(
          "audience.analysts.challenges.3",
          "Сложности с управлением изменениями"
        ),
      ],
      solutions: [
        t("audience.analysts.solutions.0", "Шаблоны для бизнес-требований"),
        t("audience.analysts.solutions.1", "Инструменты валидации и проверки"),
        t(
          "audience.analysts.solutions.2",
          "Автоматическая трассировка требований"
        ),
        t(
          "audience.analysts.solutions.3",
          "Workflow для управления изменениями"
        ),
      ],
      delay: 600,
    },
  ];

  const roiMetrics = [
    {
      value: "75%",
      label: t("roi.timeReduction.label", "Экономия времени"),
      description: t(
        "roi.timeReduction.description",
        "на управление требованиями"
      ),
      color: theme.palette.success.main,
      delay: 800,
    },
    {
      value: "60%",
      label: t("roi.bugReduction.label", "Снижение багов"),
      description: t(
        "roi.bugReduction.description",
        "благодаря четким требованиям"
      ),
      color: theme.palette.warning.main,
      delay: 1000,
    },
    {
      value: "90%",
      label: t("roi.transparency.label", "Прозрачность"),
      description: t("roi.transparency.description", "процесса разработки"),
      color: theme.palette.info.main,
      delay: 1200,
    },
    {
      value: "$50K",
      label: t("roi.savings.label", "Экономия в год"),
      description: t("roi.savings.description", "для команды из 10 человек"),
      color: theme.palette.secondary.main,
      delay: 1400,
    },
  ];

  const testimonials = [
    {
      quote: t(
        "testimonials.0.quote",
        "Requify помог нам организовать хаос требований и наладить четкий процесс. Качество наших продуктов значительно выросло."
      ),
      author: "Анна Смирнова",
      position: "Product Manager",
      company: "TechCorp",
      avatar: "",
      delay: 1600,
    },
    {
      quote: t(
        "testimonials.1.quote",
        "Теперь разработчики всегда понимают, что именно нужно сделать. Время на переделки сократилось в три раза."
      ),
      author: "Михаил Петров",
      position: "Team Lead",
      company: "StartupX",
      avatar: "",
      delay: 1800,
    },
    {
      quote: t(
        "testimonials.2.quote",
        "Интеграция с нашими существующими инструментами прошла гладко. ROI мы увидели уже через два месяца."
      ),
      author: "Елена Козлова",
      position: "CTO",
      company: "FinanceApp",
      avatar: "",
      delay: 2000,
    },
  ];

  const handleGetStarted = () => {
    navigate("/auth?mode=register");
  };

  const handleContactSales = () => {
    navigate("/contact");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.default,
          0.95
        )} 0%, ${alpha(theme.palette.grey[50], 0.98)} 100%)`,
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 12 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: "20%",
          right: "-15%",
          width: "50%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.03
          )} 0%, transparent 60%)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "10%",
          left: "-15%",
          width: "50%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.secondary.main,
            0.03
          )} 0%, transparent 60%)`,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={{ xs: 8, md: 12 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: "center" }}>
            <Chip
              label={t("audience.chip", "ЦЕЛЕВАЯ АУДИТОРИЯ")}
              sx={{
                mb: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: "0.85rem",
                px: 2,
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4.5rem" },
                fontWeight: 800,
                color: theme.palette.text.primary,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                mb: 3,
                maxWidth: "900px",
                mx: "auto",
              }}
            >
              Создано для{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                каждой роли
              </Box>{" "}
              в вашей команде
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
                mb: 6,
              }}
            >
              {t(
                "audience.subtitle",
                "От проект-менеджеров до разработчиков — каждый член команды получает инструменты, которые нужны именно ему"
              )}
            </Typography>
          </Box>

          {/* Target Audience Cards */}
          <Grid container spacing={4}>
            {targetAudience.map((audience, index) => (
              <Grid key={index} item xs={12} lg={4}>
                <TargetAudienceCard {...audience} />
              </Grid>
            ))}
          </Grid>

          {/* ROI Metrics */}
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                color: theme.palette.text.primary,
                textAlign: "center",
                mb: 6,
              }}
            >
              Измеримые результаты
            </Typography>

            <Grid container spacing={4}>
              {roiMetrics.map((metric, index) => (
                <Grid key={index} item xs={6} md={3}>
                  <ROIMetric {...metric} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Testimonials */}
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                color: theme.palette.text.primary,
                textAlign: "center",
                mb: 6,
              }}
            >
              Отзывы наших клиентов
            </Typography>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid key={index} item xs={12} md={4}>
                  <Testimonial {...testimonial} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center" }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 6, md: 8 },
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 4,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 2,
                }}
              >
                Готовы оптимизировать работу своей команды?
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  maxWidth: "500px",
                  mx: "auto",
                }}
              >
                Начните с бесплатного 14-дневного тестового периода. Никаких
                обязательств, настройка за 5 минут.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={handleGetStarted}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: theme.shadows[8],
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[16],
                    },
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                >
                  Начать бесплатно
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleContactSales}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                >
                  Связаться с продажами
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default TargetAudienceSection;
