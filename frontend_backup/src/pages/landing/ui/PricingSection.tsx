import React, { useState } from "react";
import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  FloatingParticles,
  AnimatedGradient,
  generateFloatingParticles,
  type FloatingParticleType,
} from "@/shared/ui";
import {
  PRICING_PLANS,
  PricingCard,
  BillingToggle,
  PricingHeader,
} from "@/entities/pricing";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Enhanced Custom Rising Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Custom rising effect for header elements
const headerRisingVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 0.8,
      duration: 0.8,
    },
  },
};

// Custom rising effect for billing toggle
const billingRisingVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 25,
      mass: 0.6,
      delay: 0.2,
    },
  },
};

// Enhanced rising effect for pricing cards
const cardRisingVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 0.8,
      delay: 0.3 + i * 0.1,
      duration: 1,
    },
  }),
};

// Custom rising effect for CTA section
const ctaRisingVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 0.8,
      delay: 0.8,
      duration: 0.8,
    },
  },
};

// Floating rise effect for background elements
const floatingRiseVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
};

// Generate floating particles
const FLOATING_PARTICLES: FloatingParticleType[] =
  generateFloatingParticles(10);

export const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isYearly, setIsYearly] = useState(false);

  const handleBillingChange = () => {
    setIsYearly(!isYearly);
  };

  const handleSelectPlan = (planId: string) => {
    console.log(`Selected plan: ${planId}`);
    // Here you would implement plan selection logic
  };

  return (
    <Box
      id="pricing"
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Floating Particles with Custom Rising */}
      <MotionBox
        variants={floatingRiseVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <FloatingParticles particles={FLOATING_PARTICLES} theme={theme} />
      </MotionBox>

      {/* Animated Background with Rising Effect */}
      <MotionBox
        variants={floatingRiseVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <AnimatedGradient theme={theme} />
      </MotionBox>

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            mt: { xs: 0, md: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
          {/* Header with Custom Rising */}
          <MotionBox variants={headerRisingVariants}>
            <PricingHeader
              title={t("landing.pricing.title", "Simple, transparent")}
              highlightText={t("landing.pricing.highlight", "pricing")}
              subtitle={t(
                "landing.pricing.subtitle",
                "Choose the perfect plan for your team. Upgrade or downgrade at any time."
              )}
            />
          </MotionBox>

          {/* Billing Toggle with Custom Rising */}
          <MotionBox variants={billingRisingVariants}>
            <BillingToggle
              isYearly={isYearly}
              onToggle={handleBillingChange}
              discountPercentage={20}
            />
          </MotionBox>

          {/* Pricing Cards with Enhanced Rising Effects */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2, md: 3 },
              mb: { xs: 4, md: 5 },
              flex: 1,
              alignContent: "center",
            }}
          >
            {PRICING_PLANS.map((plan, index) => (
              <MotionBox
                key={plan.id}
                custom={index}
                variants={cardRisingVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
              >
                <PricingCard
                  plan={plan}
                  isYearly={isYearly}
                  onSelectPlan={handleSelectPlan}
                />
              </MotionBox>
            ))}
          </Box>

          {/* Bottom CTA with Custom Rising */}
          <MotionBox
            variants={ctaRisingVariants}
            sx={{
              textAlign: "center",
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.grey[50]}, ${theme.palette.background.paper})`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: { xs: 1.5, md: 2 },
                fontSize: { xs: "1.2rem", md: "1.4rem" },
              }}
            >
              {t("landing.pricing.enterprise.title", "Need a custom solution?")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: { xs: 2.5, md: 3 },
                maxWidth: "500px",
                mx: "auto",
                fontSize: { xs: "0.9rem", md: "1rem" },
                lineHeight: 1.5,
              }}
            >
              {t(
                "landing.pricing.enterprise.desc",
                "Get in touch with our sales team to discuss enterprise features, custom integrations, and volume pricing."
              )}
            </Typography>
            <MotionButton
              variant="outlined"
              size="large"
              whileHover={{
                y: -3,
                scale: 1.05,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                backgroundColor: `${theme.palette.primary.main}08`,
                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.2)",
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                },
              }}
              whileTap={{
                scale: 0.98,
                y: -1,
              }}
              sx={{
                px: { xs: 4, md: 5 },
                py: { xs: 1.5, md: 1.8 },
                fontSize: { xs: "0.95rem", md: "1rem" },
                fontWeight: 600,
                borderRadius: 2.5,
                borderWidth: 2,
                textTransform: "none",
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              {t("landing.pricing.contactSales", "Contact Sales")}
            </MotionButton>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};
