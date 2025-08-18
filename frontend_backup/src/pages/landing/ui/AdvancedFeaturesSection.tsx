import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  Extension as ExtensionIcon,
  AutoFixHigh as AutoIcon,
  QuestionAnswer as QuestionIcon,
  Group as GroupIcon,
  Shield as SecurityIcon,
  Analytics as AnalyticsIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";

// Floating particles data
const FLOATING_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 45 + 18,
  duration: Math.random() * 30 + 18,
  delay: Math.random() * 10,
}));

const ADVANCED_FEATURES = [
  {
    icon: ExtensionIcon,
    titleKey: "landing.advanced.extensions.title",
    descKey: "landing.advanced.extensions.desc",
    defaultTitle: "Browser extensions",
    defaultDesc:
      "Capture requirements directly from emails, CRM, and project boards with our powerful browser extensions.",
    detailDesc:
      "Chrome, Firefox, and Edge extensions that integrate seamlessly with your existing workflow. Extract requirements from Jira tickets, Slack messages, emails, and more with AI-powered content recognition.",
    actionKey: "landing.advanced.extensions.action",
    defaultAction: "Learn more",
    color: "#6366f1",
    bgGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  },
  {
    icon: AutoIcon,
    titleKey: "landing.advanced.workflows.title",
    descKey: "landing.advanced.workflows.desc",
    defaultTitle: "Automated workflows",
    defaultDesc:
      "Set up intelligent automation for approvals, notifications, and status updates to boost team efficiency.",
    detailDesc:
      "Visual workflow builder with conditional logic, automated approvals, and smart notifications. Reduce manual work by 70% with intelligent routing and status management.",
    actionKey: "landing.advanced.workflows.action",
    defaultAction: "Get started",
    color: "#10b981",
    bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    icon: QuestionIcon,
    titleKey: "landing.advanced.ai.title",
    descKey: "landing.advanced.ai.desc",
    defaultTitle: "AI-powered insights",
    defaultDesc:
      "Get intelligent suggestions for requirement gaps, conflicts, and optimization opportunities.",
    detailDesc:
      "Machine learning algorithms analyze your requirements patterns to suggest improvements, identify missing dependencies, and predict potential issues before they impact your project.",
    actionKey: "landing.advanced.ai.action",
    defaultAction: "Explore AI",
    color: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    icon: GroupIcon,
    titleKey: "landing.advanced.collaboration.title",
    descKey: "landing.advanced.collaboration.desc",
    defaultTitle: "Advanced collaboration",
    defaultDesc:
      "Real-time collaborative editing, commenting, and review workflows for distributed teams.",
    detailDesc:
      "Google Docs-style collaborative editing with live cursors, threaded comments, approval workflows, and role-based permissions. Keep everyone in sync across time zones.",
    actionKey: "landing.advanced.collaboration.action",
    defaultAction: "Try collaboration",
    color: "#ef4444",
    bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
  {
    icon: SecurityIcon,
    titleKey: "landing.advanced.compliance.title",
    descKey: "landing.advanced.compliance.desc",
    defaultTitle: "Compliance & audit",
    defaultDesc:
      "Built-in compliance frameworks and audit trails for regulated industries and enterprise security.",
    detailDesc:
      "SOC 2, GDPR, HIPAA compliance out-of-the-box. Complete audit trails, data retention policies, and regulatory reporting tools for enterprises with strict compliance requirements.",
    actionKey: "landing.advanced.compliance.action",
    defaultAction: "View compliance",
    color: "#8b5cf6",
    bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  },
  {
    icon: AnalyticsIcon,
    titleKey: "landing.advanced.analytics.title",
    descKey: "landing.advanced.analytics.desc",
    defaultTitle: "Advanced analytics",
    defaultDesc:
      "Deep insights into requirement quality, team performance, and project health with predictive analytics.",
    detailDesc:
      "Advanced dashboards with requirement coverage analysis, velocity tracking, quality metrics, and predictive models to forecast delivery dates and identify bottlenecks early.",
    actionKey: "landing.advanced.analytics.action",
    defaultAction: "See analytics",
    color: "#06b6d4",
    bgGradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
];

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const FloatingParticle: React.FC<{
  particle: (typeof FLOATING_PARTICLES)[0];
  theme: any;
}> = ({ particle, theme }) => {
  return (
    <MotionBox
      initial={{
        x: `${particle.x}vw`,
        y: `${particle.y}vh`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [`${particle.x}vw`, `${particle.x + 5}vw`, `${particle.x}vw`],
        y: [`${particle.y}vh`, `${particle.y - 8}vh`, `${particle.y}vh`],
        scale: [0, 1, 0.7, 1],
        opacity: [0, 0.35, 0.2, 0.35],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: particle.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      }}
      sx={{
        position: "fixed",
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}28)`,
        filter: "blur(1.8px)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

const AnimatedGradient: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3.5 }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, ${theme.palette.primary.main}12 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main}12 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${theme.palette.primary.main}08 0%, transparent 50%)
        `,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export const AdvancedFeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    const newSlide = currentSlide + newDirection;
    if (newSlide >= 0 && newSlide < ADVANCED_FEATURES.length) {
      setDirection(newDirection);
      setCurrentSlide(newSlide);
    }
  };

  const goToSlide = (index: number) => {
    const newDirection = index > currentSlide ? 1 : -1;
    setDirection(newDirection);
    setCurrentSlide(index);
  };

  const currentFeature = ADVANCED_FEATURES[currentSlide];

  return (
    <Box
      id="advanced-features"
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "grey.900",
        overflow: "hidden",
      }}
    >
      {/* Floating Particles - Full Background Coverage */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {FLOATING_PARTICLES.map((particle) => (
          <FloatingParticle key={particle.id} particle={particle} theme={theme} />
        ))}
      </Box>

      {/* Animated Background */}
      <AnimatedGradient theme={theme} />

      {/* Dynamic background based on current feature */}
      <MotionBox
        key={currentSlide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${currentFeature.color}08 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, height: "100%" }}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100vh",
            py: { xs: 8, md: 12 },
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
                color: "white",
                mb: 3,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.advanced.title", "Advanced capabilities")}
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
                {t("landing.advanced.highlight", "for power users")}
              </Box>
            </MotionTypography>

            <MotionTypography
              variant="h5"
              sx={{
                color: "grey.300",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                fontWeight: 400,
                maxWidth: "700px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              {t(
                "landing.advanced.subtitle",
                "Unlock the full potential of your requirements management with enterprise-grade features and deep integrations."
              )}
            </MotionTypography>
          </MotionBox>

          {/* Carousel Content */}
          <MotionBox
            variants={itemVariants}
            sx={{
              position: "relative",
              minHeight: { xs: 400, md: 500 },
              mb: { xs: 6, md: 8 },
            }}
          >
            {/* Feature Card */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <MotionBox
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                sx={{
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  left: 0,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                  gap: { xs: 4, md: 6 },
                  alignItems: "center",
                }}
              >
                {/* Feature Content */}
                <Box
                  sx={{
                    order: { xs: 2, lg: 1 },
                    textAlign: { xs: "center", lg: "left" },
                  }}
                >
                  {/* Icon */}
                  <MotionBox
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: { xs: 80, md: 100 },
                      height: { xs: 80, md: 100 },
                      borderRadius: 4,
                      background: currentFeature.bgGradient,
                      mb: 4,
                      boxShadow: `0 20px 40px ${currentFeature.color}40`,
                    }}
                  >
                    <currentFeature.icon
                      sx={{ color: "white", fontSize: { xs: 40, md: 50 } }}
                    />
                  </MotionBox>

                  {/* Title */}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: "white",
                      mb: 3,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    {t(currentFeature.titleKey, currentFeature.defaultTitle)}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: "grey.300",
                      mb: 4,
                      fontSize: { xs: "1.1rem", md: "1.3rem" },
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    {t(currentFeature.descKey, currentFeature.defaultDesc)}
                  </Typography>

                  {/* Detail Description */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: "grey.400",
                      mb: 6,
                      fontSize: { xs: "0.95rem", md: "1.05rem" },
                      lineHeight: 1.7,
                    }}
                  >
                    {currentFeature.detailDesc}
                  </Typography>

                  {/* CTA Button */}
                  <MotionButton
                    variant="contained"
                    size="large"
                    whileHover={{
                      y: -3,
                      boxShadow: `0 15px 35px ${currentFeature.color}50`,
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: "none",
                      background: currentFeature.bgGradient,
                      boxShadow: `0 8px 25px ${currentFeature.color}40`,
                    }}
                  >
                    {t(currentFeature.actionKey, currentFeature.defaultAction)}
                  </MotionButton>
                </Box>

                {/* Feature Visual */}
                <Box
                  sx={{
                    order: { xs: 1, lg: 2 },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: { xs: 250, md: 400 },
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${currentFeature.color}15, ${currentFeature.color}08)`,
                    border: `1px solid ${currentFeature.color}30`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Placeholder for feature visualization */}
                  <Typography
                    variant="h4"
                    sx={{
                      color: currentFeature.color,
                      opacity: 0.7,
                      textAlign: "center",
                      p: 4,
                    }}
                  >
                    {t(
                      "landing.advanced.preview",
                      "Feature Preview / Demo"
                    )}
                  </Typography>

                  {/* Background decoration */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${currentFeature.color}20 0%, transparent 70%)`,
                      filter: "blur(40px)",
                    }}
                  />
                </Box>
              </MotionBox>
            </AnimatePresence>
          </MotionBox>

          {/* Navigation */}
          <MotionBox
            variants={itemVariants}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {/* Previous Button */}
            <MotionIconButton
              onClick={() => paginate(-1)}
              disabled={currentSlide === 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                "&:disabled": {
                  opacity: 0.3,
                  cursor: "not-allowed",
                },
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <ArrowBackIcon />
            </MotionIconButton>

            {/* Dots Navigation */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {ADVANCED_FEATURES.map((_, index) => (
                <MotionIconButton
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  sx={{
                    p: 0.5,
                    color: index === currentSlide ? "primary.main" : "grey.500",
                    transition: "color 0.3s ease",
                  }}
                >
                  <DotIcon
                    sx={{
                      fontSize: index === currentSlide ? 16 : 12,
                      transition: "all 0.3s ease",
                    }}
                  />
                </MotionIconButton>
              ))}
            </Box>

            {/* Next Button */}
            <MotionIconButton
              onClick={() => paginate(1)}
              disabled={currentSlide === ADVANCED_FEATURES.length - 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                "&:disabled": {
                  opacity: 0.3,
                  cursor: "not-allowed",
                },
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <ArrowForwardIcon />
            </MotionIconButton>
          </MotionBox>

          {/* Feature Counter */}
          <MotionBox
            variants={itemVariants}
            sx={{ textAlign: "center", mt: 4 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "grey.500",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {currentSlide + 1} / {ADVANCED_FEATURES.length}
            </Typography>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};
