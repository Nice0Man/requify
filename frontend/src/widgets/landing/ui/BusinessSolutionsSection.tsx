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
  LinearProgress,
} from "@mui/material";
import {
  Business,
  Engineering,
  ManageAccounts,
  Analytics,
  TrendingUp,
  CheckCircle,
  ArrowForward,
  Groups,
  AccessTime,
  AttachMoney,
  Star,
  FormatQuote,
  DeviceHub,
  Speed,
  Security,
  Support,
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
                    mt: 0.2,
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
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: color,
            mb: 1,
            fontSize: { xs: "2.5rem", md: "3rem" },
            background: `linear-gradient(135deg, ${color}, ${alpha(
              color,
              0.7
            )})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
            maxWidth: 200,
            mx: "auto",
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      </Box>
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
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )}, ${alpha(theme.palette.background.paper, 0.98)})`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          p: 4,
          height: "100%",
          position: "relative",
        }}
      >
        <FormatQuote
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: alpha(theme.palette.primary.main, 0.2),
            fontSize: 40,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            mb: 3,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          "{quote}"
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={avatar}
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            {author.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {author}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {position}, {company}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Fade>
  );
};

const BusinessSolutionsSection: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const targetAudiences = [
    {
      icon: <Engineering />,
      title: t("business.audiences.cto.title", "CTO / Tech Lead"),
      role: t("business.audiences.cto.role", "Технические руководители"),
      challenges: [
        t(
          "business.audiences.cto.challenges.0",
          "Сложность координации между командами"
        ),
        t(
          "business.audiences.cto.challenges.1",
          "Отсутствие единого источника правды"
        ),
        t(
          "business.audiences.cto.challenges.2",
          "Проблемы масштабирования процессов"
        ),
        t(
          "business.audiences.cto.challenges.3",
          "Технический долг в требованиях"
        ),
      ],
      solutions: [
        t(
          "business.audiences.cto.solutions.0",
          "Централизованная платформа управления"
        ),
        t(
          "business.audiences.cto.solutions.1",
          "API для интеграции с существующими системами"
        ),
        t(
          "business.audiences.cto.solutions.2",
          "Автоматизация процессов валидации"
        ),
        t(
          "business.audiences.cto.solutions.3",
          "Метрики качества и производительности"
        ),
      ],
    },
    {
      icon: <ManageAccounts />,
      title: t("business.audiences.pm.title", "Product Manager"),
      role: t("business.audiences.pm.role", "Продуктовые менеджеры"),
      challenges: [
        t(
          "business.audiences.pm.challenges.0",
          "Потеря требований в процессе разработки"
        ),
        t(
          "business.audiences.pm.challenges.1",
          "Отсутствие связи между бизнес-целями и фичами"
        ),
        t("business.audiences.pm.challenges.2", "Сложность приоритизации"),
        t(
          "business.audiences.pm.challenges.3",
          "Недостаток обратной связи от команды"
        ),
      ],
      solutions: [
        t(
          "business.audiences.pm.solutions.0",
          "Связь требований с бизнес-метриками"
        ),
        t(
          "business.audiences.pm.solutions.1",
          "Инструменты приоритизации и планирования"
        ),
        t(
          "business.audiences.pm.solutions.2",
          "Отслеживание жизненного цикла требований"
        ),
        t(
          "business.audiences.pm.solutions.3",
          "Интегрированная аналитика продукта"
        ),
      ],
    },
    {
      icon: <Business />,
      title: t("business.audiences.ceo.title", "CEO / Business Owner"),
      role: t("business.audiences.ceo.role", "Бизнес-лидеры"),
      challenges: [
        t(
          "business.audiences.ceo.challenges.0",
          "Низкая предсказуемость сроков"
        ),
        t(
          "business.audiences.ceo.challenges.1",
          "Превышение бюджетов проектов"
        ),
        t(
          "business.audiences.ceo.challenges.2",
          "Неясность ROI от IT-инвестиций"
        ),
        t(
          "business.audiences.ceo.challenges.3",
          "Риски несоответствия продукта рынку"
        ),
      ],
      solutions: [
        t(
          "business.audiences.ceo.solutions.0",
          "Прозрачная отчетность по проектам"
        ),
        t("business.audiences.ceo.solutions.1", "Контроль бюджетов и ресурсов"),
        t(
          "business.audiences.ceo.solutions.2",
          "Метрики ROI и бизнес-показатели"
        ),
        t("business.audiences.ceo.solutions.3", "Управление рисками продукта"),
      ],
    },
    {
      icon: <Groups />,
      title: t("business.audiences.lead.title", "Team Lead / Scrum Master"),
      role: t("business.audiences.lead.role", "Руководители команд"),
      challenges: [
        t(
          "business.audiences.lead.challenges.0",
          "Неэффективные ретроспективы"
        ),
        t(
          "business.audiences.lead.challenges.1",
          "Проблемы коммуникации в команде"
        ),
        t(
          "business.audiences.lead.challenges.2",
          "Отсутствие visibility по прогрессу"
        ),
        t(
          "business.audiences.lead.challenges.3",
          "Сложность планирования спринтов"
        ),
      ],
      solutions: [
        t(
          "business.audiences.lead.solutions.0",
          "Инструменты для агильных процессов"
        ),
        t(
          "business.audiences.lead.solutions.1",
          "Автоматизированные отчеты по прогрессу"
        ),
        t(
          "business.audiences.lead.solutions.2",
          "Интеграция с популярными ALM системами"
        ),
        t(
          "business.audiences.lead.solutions.3",
          "Аналитика команды и velocity"
        ),
      ],
    },
  ];

  const roiMetrics = [
    {
      value: t("business.metrics.time.value", "60%"),
      label: t("business.metrics.time.label", "Сокращение времени"),
      description: t(
        "business.metrics.time.description",
        "на управление требованиями и планирование"
      ),
      color: theme.palette.success.main,
    },
    {
      value: t("business.metrics.rework.value", "40%"),
      label: t("business.metrics.rework.label", "Меньше переработок"),
      description: t(
        "business.metrics.rework.description",
        "благодаря четким требованиям с самого начала"
      ),
      color: theme.palette.warning.main,
    },
    {
      value: t("business.metrics.launch.value", "3x"),
      label: t("business.metrics.launch.label", "Быстрее запуск"),
      description: t(
        "business.metrics.launch.description",
        "новых продуктов и функций на рынок"
      ),
      color: theme.palette.primary.main,
    },
    {
      value: t("business.metrics.roi.value", "ROI 300%"),
      label: t("business.metrics.roi.label", "Возврат инвестиций"),
      description: t(
        "business.metrics.roi.description",
        "в течение первого года использования"
      ),
      color: theme.palette.info.main,
    },
  ];

  const testimonials = [
    {
      quote: t(
        "business.testimonials.items.0.quote",
        "Requify помог нам сократить время вывода продукта на рынок в 2 раза. Теперь мы можем быстро реагировать на изменения требований рынка."
      ),
      author: t("business.testimonials.items.0.author", "Алексей Петров"),
      position: t("business.testimonials.items.0.position", "CTO"),
      company: t("business.testimonials.items.0.company", "TechStartup"),
      avatar: "/api/placeholder/48/48",
    },
    {
      quote: t(
        "business.testimonials.items.1.quote",
        "Благодаря Requify наша команда стала работать гораздо более синхронизированно. Все требования в одном месте, все процессы прозрачны."
      ),
      author: t("business.testimonials.items.1.author", "Мария Сидорова"),
      position: t("business.testimonials.items.1.position", "Product Manager"),
      company: t("business.testimonials.items.1.company", "FinTech Corp"),
      avatar: "/api/placeholder/48/48",
    },
    {
      quote: t(
        "business.testimonials.items.2.quote",
        "ROI от внедрения Requify составил 280% за первый год. Значительно сократились затраты на переработки и исправление ошибок."
      ),
      author: t("business.testimonials.items.2.author", "Дмитрий Козлов"),
      position: t("business.testimonials.items.2.position", "CEO"),
      company: t(
        "business.testimonials.items.2.company",
        "Enterprise Solutions"
      ),
      avatar: "/api/placeholder/48/48",
    },
  ];

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleContactSales = () => {
    window.open("mailto:sales@requify.com?subject=Enterprise Solution Inquiry");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.default,
          0.98
        )}, ${alpha(theme.palette.background.paper, 0.99)})`,
        py: 8,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 20%, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${alpha(
            theme.palette.secondary.main,
            0.08
          )} 0%, transparent 50%)`,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Chip
            icon={<Business />}
            label={t("business.badge", "Бизнес-решения")}
            sx={{
              mb: 3,
              px: 3,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              color: theme.palette.primary.main,
              borderRadius: 6,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
              lineHeight: 1.1,
            }}
          >
            {t("business.title", "Решения для каждой роли в команде")}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              mb: 6,
              maxWidth: "900px",
              mx: "auto",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            {t(
              "business.subtitle",
              "От CTO до Product Manager — Requify решает специфические задачи каждого участника команды разработки"
            )}
          </Typography>
        </Box>

        {/* Target Audiences Grid */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          {targetAudiences.map((audience, index) => (
            <Grid item xs={12} md={6} xl={3} key={index}>
              <TargetAudienceCard
                icon={audience.icon}
                title={audience.title}
                role={audience.role}
                challenges={audience.challenges}
                solutions={audience.solutions}
                delay={600 + index * 200}
              />
            </Grid>
          ))}
        </Grid>

        {/* ROI Metrics Section */}
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 4,
            p: 6,
            mb: 10,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            {t("business.roi.title", "Измеримые результаты")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              mb: 6,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {t(
              "business.roi.subtitle",
              "Наши клиенты достигают конкретных бизнес-результатов"
            )}
          </Typography>

          <Grid container spacing={4}>
            {roiMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ROIMetric
                  value={metric.value}
                  label={metric.label}
                  description={metric.description}
                  color={metric.color}
                  delay={1200 + index * 200}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Testimonials Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            {t("business.testimonials.title", "Отзывы клиентов")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              mb: 6,
            }}
          >
            {t(
              "business.testimonials.subtitle",
              "Что говорят лидеры индустрии"
            )}
          </Typography>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Testimonial
                  quote={testimonial.quote}
                  author={testimonial.author}
                  position={testimonial.position}
                  company={testimonial.company}
                  avatar={testimonial.avatar}
                  delay={1600 + index * 200}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            borderRadius: 4,
            p: 6,
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "#ffffff",
            }}
          >
            {t("business.cta.title", "Готовы трансформировать ваши процессы?")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {t(
              "business.cta.subtitle",
              "Начните с бесплатной консультации или демо для вашей команды"
            )}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              size="large"
              variant="contained"
              onClick={handleGetStarted}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                color: theme.palette.primary.main,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: alpha("#ffffff", 0.9),
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              {t("business.cta.start", "Начать бесплатно")}
            </Button>

            <Button
              size="large"
              variant="outlined"
              onClick={handleContactSales}
              startIcon={<Support />}
              sx={{
                px: 4,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
                borderColor: "#ffffff",
                color: "#ffffff",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#ffffff",
                  backgroundColor: alpha("#ffffff", 0.1),
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              {t("business.cta.contact", "Связаться с отделом продаж")}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default BusinessSolutionsSection;
