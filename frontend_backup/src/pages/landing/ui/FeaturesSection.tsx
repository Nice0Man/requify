import React, { useState } from "react";
import { Box, Typography, Container, Button, useTheme } from "@mui/material";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "@/shared/hooks/useTranslation";
// MotionButton будет создан локально
import {
  SmartToy as AiIcon,
  Group as CollabIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

// Floating particles data
const FLOATING_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 35 + 12,
  duration: Math.random() * 20 + 12,
  delay: Math.random() * 6,
}));

const FEATURE_TIMELINE = [
  {
    id: "ai-capture",
    icon: AiIcon,
    color: "#6366f1",
    titleKey: "landing.features.timeline.ai.title",
    defaultTitle: "AI-Powered Capture",
    descKey: "landing.features.timeline.ai.desc",
    defaultDesc:
      "Automatically extract and structure requirements from documents, meetings, and conversations using advanced AI.",
  },
  {
    id: "collaboration",
    icon: CollabIcon,
    color: "#10b981",
    titleKey: "landing.features.timeline.collab.title",
    defaultTitle: "Real-time Collaboration",
    descKey: "landing.features.timeline.collab.desc",
    defaultDesc:
      "Work together seamlessly with teams across different time zones and departments with live editing and commenting.",
  },
  {
    id: "analytics",
    icon: AnalyticsIcon,
    color: "#f59e0b",
    titleKey: "landing.features.timeline.analytics.title",
    defaultTitle: "Advanced Analytics",
    descKey: "landing.features.timeline.analytics.desc",
    defaultDesc:
      "Get insights into requirement coverage, project progress, and team performance with comprehensive dashboards.",
  },
  {
    id: "security",
    icon: SecurityIcon,
    color: "#ef4444",
    titleKey: "landing.features.timeline.security.title",
    defaultTitle: "Enterprise Security",
    descKey: "landing.features.timeline.security.desc",
    defaultDesc:
      "Bank-grade security with SOC 2 compliance, role-based access, and end-to-end encryption.",
  },
];

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const FloatingParticle: React.FC<{
  particle: (typeof FLOATING_PARTICLES)[0];
  theme: any;
}> = ({ particle, theme }) => {
  return (
    <MotionBox
      initial={{
        x: `${particle.x}%`,
        y: `${particle.y}%`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [`${particle.x}%`, `${particle.x + 3}%`, `${particle.x}%`],
        y: [`${particle.y}%`, `${particle.y - 6}%`, `${particle.y}%`],
        scale: [0, 1, 0.8, 1],
        opacity: [0, 0.25, 0.1, 0.25],
        rotate: [0, 120, 240, 360],
      }}
      transition={{
        duration: particle.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      }}
      sx={{
        position: "absolute",
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.secondary.main}22)`,
        filter: "blur(1.2px)",
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
      transition={{ duration: 3 }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main}08 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${theme.palette.secondary.main}08 0%, transparent 50%)`,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Box
      id="features"
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
        overflow: "hidden",
        pt: 10,
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
          <FloatingParticle
            key={particle.id}
            particle={particle}
            theme={theme}
          />
        ))}
      </Box>

      {/* Animated Background */}
      <AnimatedGradient theme={theme} />

      {/* Background Elements */}
      <MotionBox
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          backgroundColor: theme.palette.primary.light,
          opacity: 0.05,
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />
      <MotionBox
        animate={{
          scale: [1, 0.98, 1],
          rotate: [0, -1, 1, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          backgroundColor: theme.palette.secondary.light,
          opacity: 0.05,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
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
                color: "text.primary",
                mb: 3,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.features.title", "Powerful features for")}
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
                {t("landing.features.highlight", "modern teams")}
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
              {t(
                "landing.features.subtitle",
                "From smart capture to automated workflows, Requify streamlines your entire requirements lifecycle."
              )}
            </MotionTypography>
          </MotionBox>

          {/* Feature Timeline */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 4, md: 6 },
              mb: { xs: 8, md: 10 },
              alignItems: "flex-start",
            }}
          >
            {/* Left Side - Steps */}
            <MotionBox
              variants={containerVariants}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
                maxWidth: { xs: "100%", md: "400px" },
                mx: { xs: "auto", md: 0 },
              }}
            >
              {FEATURE_TIMELINE.map((feature, index) => {
                const IconComponent = feature.icon;
                const isActive = index === activeStep;
                return (
                  <MotionBox
                    key={feature.id}
                    variants={itemVariants}
                    onClick={() => setActiveStep(index)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: isActive
                        ? "background.paper"
                        : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "divider" : "transparent",
                      boxShadow: isActive
                        ? "0 8px 32px rgba(0,0,0,0.08)"
                        : "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          backgroundColor: `${feature.color}15`,
                        }}
                      >
                        <IconComponent
                          sx={{ color: feature.color, fontSize: 24 }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: "1rem",
                        }}
                      >
                        {t(feature.titleKey, feature.defaultTitle)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {t(feature.descKey, feature.defaultDesc)}
                    </Typography>
                  </MotionBox>
                );
              })}
            </MotionBox>

            {/* Right Side - Image/Illustration */}
            <MotionBox
              variants={itemVariants}
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: { xs: 250, md: 400 },
                width: "100%",
                maxWidth: { xs: "100%", md: "600px" },
                mx: { xs: "auto", md: 0 },
                borderRadius: 4,
                overflow: "hidden",
                backgroundColor: "grey.100",
                boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h5" sx={{ color: "text.disabled", p: 4 }}>
                {t(
                  "landing.features.imagePlaceholder",
                  "Dynamic Illustration / Screenshot"
                )}
              </Typography>
            </MotionBox>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};
