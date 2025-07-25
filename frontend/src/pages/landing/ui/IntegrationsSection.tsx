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
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Close,
  OpenInNew,
  Star,
  CheckCircle,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FiberManualRecord as DotIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { INTEGRATIONS, type Integration } from "@/entities/integration";

const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);

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

// Компонент карточки интеграции с соотношением 3:4
interface IntegrationCardProps {
  integration: Integration;
  onClick?: (integration: Integration) => void;
  index: number;
  total: number;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onClick,
  index,
  total,
}) => {
  const theme = useTheme();

  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Api: ApiIcon,
      Security: SecurityIcon,
      CloudSync: CloudSyncIcon,
    };
    return iconMap[iconName as keyof typeof iconMap] || ApiIcon;
  };

  const IconComponent = getIconComponent(integration.icon);

  const handleClick = () => {
    if (onClick) {
      onClick(integration);
    }
  };

  return (
    <MotionBox
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      sx={{
        position: "relative",
        width: "280px", // Фиксированная ширина
        height: "373px", // Соотношение 3:4 (280 * 4/3 = 373)
        borderRadius: 3,
        background: `linear-gradient(145deg, 
          ${theme.palette.background.paper}FC 0%, 
          ${theme.palette.background.paper}F8 25%,
          ${integration.color}08 50%,
          ${theme.palette.background.paper}F8 75%,
          ${theme.palette.background.paper}FC 100%)`,
        border: `1px solid ${integration.color}40`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: `0 8px 32px ${integration.color}20`,
        "&:hover": {
          boxShadow: `0 20px 60px ${integration.color}40`,
          border: `1px solid ${integration.color}60`,
        },
        flexShrink: 0,
      }}
    >
      {/* Декоративный элемент сверху */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${integration.color}60 20%, 
            ${integration.color}80 50%, 
            ${integration.color}60 80%, 
            transparent 100%)`,
        }}
      />

      {/* Содержимое карточки */}
      <Box
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Иконка интеграции */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${integration.color}20 0%, ${integration.color}40 100%)`,
            mb: 3,
            boxShadow: `0 8px 24px ${integration.color}30`,
          }}
        >
          <IconComponent
            sx={{
              color: integration.color,
              fontSize: 36,
            }}
          />
        </Box>

        {/* Заголовок */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
            fontSize: "1.25rem",
            lineHeight: 1.2,
          }}
        >
          {integration.title}
        </Typography>

        {/* Описание */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
            fontSize: "0.9rem",
            lineHeight: 1.5,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {integration.description}
        </Typography>

        {/* Нижняя часть */}
        <Box sx={{ mt: "auto" }}>
          {/* Популярность */}
          {integration.isPopular && (
            <Chip
              icon={<Star sx={{ fontSize: "14px !important" }} />}
              label="Популярно"
              size="small"
              color="warning"
              variant="filled"
              sx={{ mb: 2 }}
            />
          )}

          {/* Статистика подключений */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: integration.color,
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              {integration.connections}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                fontSize: "0.75rem",
              }}
            >
              {index + 1} / {total}
            </Typography>
          </Box>

          {/* Connect Button */}
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              borderColor: integration.color,
              color: integration.color,
              "&:hover": {
                borderColor: integration.color,
                backgroundColor: `${integration.color}10`,
              },
            }}
          >
            Подключить
          </Button>
        </Box>
      </Box>

      {/* Декоративное свечение */}
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${integration.color}15 0%, transparent 70%)`,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
    </MotionBox>
  );
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
        overflow: "hidden",
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
      >
        <IconButton
          onClick={() => setIsPaused(!isPaused)}
          sx={{
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.7)",
            },
          }}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </IconButton>
      </Box>
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
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            outline: "none",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
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
                  background: `linear-gradient(135deg, ${integration.color}15 0%, ${integration.color}25 100%)`,
                  border: "1px solid",
                  borderColor: `${integration.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                  flexShrink: 0,
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
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${integration.color} 0%, ${integration.color}CC 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${integration.color}DD 0%, ${integration.color}BB 100%)`,
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
                sx={{ py: 1.5, fontWeight: 600 }}
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
                bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  // Создаем карточки интеграций
  const integrationCards = INTEGRATIONS.map((integration, index) => (
    <IntegrationCard
      key={integration.id}
      integration={integration}
      onClick={handleIntegrationClick}
      index={index}
      total={INTEGRATIONS.length}
    />
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
          backgroundColor: "background.default",
          overflow: "hidden",
          py: { xs: 8, md: 12 },
        }}
      >
        {/* Динамический фон */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 70%, ${theme.palette.primary.main}08 0%, transparent 50%), 
                         radial-gradient(circle at 70% 30%, ${theme.palette.secondary.main}06 0%, transparent 50%)`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

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
              >
                <Typography variant="body2" color="text.secondary">
                  Автопрокрутка:
                </Typography>
                <IconButton
                  onClick={() => setAutoPlay(!autoPlay)}
                  sx={{
                    color: autoPlay ? "primary.main" : "text.disabled",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {autoPlay ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Box>
            </MotionBox>

            {/* Carousel */}
            <MotionBox
              variants={itemVariants}
              sx={{
                position: "relative",
                height: { xs: 450, md: 520 },
                mb: { xs: 6, md: 8 },
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
