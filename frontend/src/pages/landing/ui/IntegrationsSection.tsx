import React, { useState, useCallback } from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import {
  DEFAULT_CAROUSEL_CONFIG,
  INTEGRATIONS,
  InfiniteCarousel,
  type Integration,
} from "@/entities/integration";
import { IntegrationCTAModal } from "@/entities/integration/ui/CTAPopup";

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

export const IntegrationsSection: React.FC = () => {
  const theme = useTheme();

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
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,250,255,0.95) 100%)",
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
              <InfiniteCarousel
                config={{
                  ...DEFAULT_CAROUSEL_CONFIG,
                  autoPlayInterval: 3500,
                }}
                items={INTEGRATIONS}
                onItemClick={handleIntegrationClick}
              />
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
