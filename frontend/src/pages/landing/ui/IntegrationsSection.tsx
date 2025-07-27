import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Modal,
  Fade,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Close,
  OpenInNew,
  Star,
  CheckCircle,
  Api as ApiIcon,
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
} from "@mui/icons-material";
import {
  INTEGRATIONS,
  IntegrationCard,
  type Integration,
} from "@/entities/integration";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

// Анимационные варианты согласно дизайн-системе
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Автоматическая карусель компонент
interface AutoCarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({
  children,
  autoPlay = true,
  speed = 50, // пикселей в секунду
  pauseOnHover = true,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(() => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.offsetWidth;

        setOffset((prevOffset) => {
          const newOffset = prevOffset + 1;
          // Если весь контент прошел, сбрасываем в начало
          if (newOffset >= contentWidth - containerWidth) {
            return 0;
          }
          return newOffset;
        });
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, speed]);

  return (
    <Box
      ref={containerRef}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        zIndex: 1,
        "&:hover .carousel-controls": {
          opacity: 1,
        },
      }}
    >
      <Box
        ref={contentRef}
        sx={{
          display: "flex",
          gap: 3,
          transform: `translateX(-${offset}px)`,
          transition: isPaused ? "transform 0.3s ease" : "none",
          width: "fit-content",
          alignItems: "center",
          py: 2,
        }}
      >
        {children}
        {/* Дублируем контент для бесшовной прокрутки */}
        {children}
      </Box>

      {/* Контролы паузы */}
      <Box
        className="carousel-controls"
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          opacity: 0,
          transition: "opacity 0.3s ease",
          zIndex: 2,
        }}
      ></Box>
    </Box>
  );
};

// CTA Modal для интеграций
interface IntegrationCTAModalProps {
  open: boolean;
  onClose: () => void;
  integration: Integration | null;
}

const IntegrationCTAModal: React.FC<IntegrationCTAModalProps> = ({
  open,
  onClose,
  integration,
}) => {
  const theme = useTheme();

  if (!integration) return null;

  const handleConnectClick = () => {
    console.log("Connecting to integration:", integration.title);
    onClose();
  };

  const handleLearnMoreClick = () => {
    console.log("Learning more about:", integration.title);
    window.open(`/integrations/${integration.id}`, "_blank");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        p: 2,
      }}
    >
      <Fade in={open}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3 }}
          sx={{
            position: "relative",
            maxWidth: { xs: "90vw", sm: "500px" },
            width: "100%",
            maxHeight: "90vh",
            bgcolor: "background",
            borderRadius: 4, // Увеличиваем как в других компонентах
            background: "rgba(255, 255, 255, 0.98)", // Делаем светлее
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.15)`, // Уменьшаем тень для светлого вида
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* Декоративный blur элемент */}
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${integration.color}10 0%, transparent 70%)`, // Делаем светлее
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              zIndex: 1,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Close />
          </IconButton>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${integration.color}20 0%, ${integration.color}40 100%)`,
                  border: `1px solid ${integration.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                  flexShrink: 0,
                  boxShadow: `0 8px 20px ${integration.color}30`,
                }}
              >
                <ApiIcon sx={{ fontSize: 32, color: integration.color }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mr: 2 }}>
                    {integration.title}
                  </Typography>
                  {integration.isPopular && (
                    <Chip
                      icon={<Star sx={{ fontSize: "16px !important" }} />}
                      label="Популярно"
                      size="small"
                      color="warning"
                      variant="filled"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {integration.description}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Features */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Возможности
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {[
                  {
                    icon: <CheckCircle color="success" />,
                    text: "Простая настройка за 5 минут",
                  },
                  {
                    icon: <SecurityIcon color="primary" />,
                    text: "Безопасное подключение",
                  },
                  {
                    icon: <CloudSyncIcon color="info" />,
                    text: "Высокая скорость обработки данных",
                  },
                ].map((feature, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    {feature.icon}
                    <Typography variant="body2">{feature.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Connection Stats */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Статистика использования
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                {integration.connections}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={handleConnectClick}
                startIcon={<CheckCircle />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 3, // Как в AdvancedFeaturesSection
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${integration.color} 0%, ${integration.color}CC 100%)`,
                  boxShadow: `0 8px 25px ${integration.color}25`, // Делаем светлее
                  "&:hover": {
                    background: `linear-gradient(135deg, ${integration.color}DD 0%, ${integration.color}BB 100%)`,
                    boxShadow: `0 12px 35px ${integration.color}30`, // Делаем светлее
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Подключить интеграцию
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleLearnMoreClick}
                endIcon={<OpenInNew />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  borderColor: integration.color,
                  color: integration.color,
                  "&:hover": {
                    borderColor: integration.color,
                    backgroundColor: `${integration.color}08`,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Узнать больше
              </Button>
            </Box>

            {/* Trust Indicator */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.25", // Делаем светлее
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                🔒 Безопасное подключение • SSL шифрование • Соответствие GDPR
              </Typography>
            </Box>
          </Box>
        </MotionBox>
      </Fade>
    </Modal>
  );
};

export const IntegrationsSection: React.FC = () => {
  const theme = useTheme();
  const [autoPlay, setAutoPlay] = useState(true);

  // Состояние для CTA модального окна
  const [ctaModal, setCtaModal] = useState<{
    open: boolean;
    integration: Integration | null;
  }>({
    open: false,
    integration: null,
  });

  const handleIntegrationClick = useCallback((integration: Integration) => {
    console.log("Clicked integration:", integration);
    setCtaModal({
      open: true,
      integration,
    });
  }, []);

  const handleCloseCTAModal = useCallback(() => {
    setCtaModal({
      open: false,
      integration: null,
    });
  }, []);

  // Создаем карточки интеграций используя компонент из entity
  const integrationCards = INTEGRATIONS.map((integration, index) => (
    <Box
      key={integration.id}
      sx={{
        width: "300px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IntegrationCard
        integration={integration}
        onClick={handleIntegrationClick}
        isVisible={true}
        blurLevel={0}
        scale={1}
      />
    </Box>
  ));

  return (
    <>
      <MotionBox
        component="section"
        id="integrations"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,250,255,0.95) 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(600px circle at 20% 30%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
              radial-gradient(800px circle at 80% 70%, rgba(255, 171, 145, 0.03) 0%, transparent 50%),
              radial-gradient(400px circle at 40% 80%, rgba(79, 172, 254, 0.02) 0%, transparent 50%)
            `,
            pointerEvents: "none",
            zIndex: 0,
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ position: "relative", zIndex: 1, height: "100%" }}
        >
          <MotionBox
            variants={containerVariants}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "100vh",
            }}
          >
            {/* Header */}
            <MotionBox
              variants={itemVariants}
              sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}
            >
              <MotionTypography
                variant="h2"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 3,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Мощные интеграции
                <br />
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  для любых задач
                </Box>
              </MotionTypography>

              <MotionTypography
                variant="h5"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  fontWeight: 400,
                  maxWidth: "700px",
                  mx: "auto",
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Подключайте любые инструменты и автоматизируйте рабочие
                процессы. Более 50+ готовых интеграций для максимальной
                эффективности.
              </MotionTypography>

              {/* Carousel Controls */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mb: 4,
                }}
              ></Box>
            </MotionBox>

            {/* Carousel */}
            <MotionBox
              variants={itemVariants}
              sx={{
                position: "relative",
                minHeight: { xs: 400, md: 500 },
                mb: { xs: 6, md: 8 },
                p: { xs: 2, md: 3 },
              }}
            >
              <AutoCarousel autoPlay={autoPlay} speed={30} pauseOnHover={true}>
                {integrationCards}
              </AutoCarousel>
            </MotionBox>

            {/* Statistics */}
            <MotionBox
              variants={itemVariants}
              sx={{
                textAlign: "center",
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 4,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}
                >
                  {INTEGRATIONS.length}+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Интеграций
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "secondary.main", mb: 1 }}
                >
                  50M+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Подключений
                </Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1", md: "auto" } }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "success.main", mb: 1 }}
                >
                  99.9%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uptime
                </Typography>
              </Box>
            </MotionBox>
          </MotionBox>
        </Container>
      </MotionBox>

      {/* CTA Modal */}
      <IntegrationCTAModal
        open={ctaModal.open}
        onClose={handleCloseCTAModal}
        integration={ctaModal.integration}
      />
    </>
  );
};
