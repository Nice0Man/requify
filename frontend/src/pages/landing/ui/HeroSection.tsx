import React, { useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  Container,
  Chip,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { motion, Variants } from "framer-motion";
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Assignment as RequirementIcon,
  Timeline as TimelineIcon,
  Groups as GroupsIcon,
  Speed as SpeedIcon,
  GitHub as GithubIcon,
} from "@mui/icons-material";

// Минимальные floating orbs для тонкого эффекта
const FLOATING_ORBS = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 80 + 30,
  duration: Math.random() * 15 + 8,
  delay: Math.random() * 3,
}));

// Компании-партнеры (как в Calendly)
const TRUSTED_COMPANIES = [
  { name: "Zendesk", logo: "🎯" },
  { name: "Shopify", logo: "🛒" },
  { name: "Stripe", logo: "💳" },
  { name: "Slack", logo: "💬" },
  { name: "Notion", logo: "📝" },
  { name: "GitHub", logo: "🐙" },
];

// Metrics данные для нашего продукта
const PRODUCT_METRICS = [
  {
    icon: RequirementIcon,
    metric: "10K+",
    label: "Requirements managed",
    color: "#3b82f6",
  },
  {
    icon: TimelineIcon,
    metric: "85%",
    label: "Faster delivery",
    color: "#10b981",
  },
  {
    icon: GroupsIcon,
    metric: "500+",
    label: "Development teams",
    color: "#8b5cf6",
  },
  { icon: SpeedIcon, metric: "99.9%", label: "Uptime SLA", color: "#f59e0b" },
];

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
      delay: 0.3,
    },
  },
};

// Тонкие floating orbs
const FloatingOrb: React.FC<{
  orb: (typeof FLOATING_ORBS)[0];
  theme: any;
}> = ({ orb, theme }) => {
  return (
    <MotionBox
      initial={{
        x: `${orb.x}vw`,
        y: `${orb.y}vh`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [`${orb.x}vw`, `${orb.x + 2}vw`, `${orb.x}vw`],
        y: [`${orb.y}vh`, `${orb.y - 3}vh`, `${orb.y}vh`],
        scale: [0, 1, 0.8, 1],
        opacity: [0, 0.2, 0.1, 0.2],
      }}
      transition={{
        duration: orb.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: orb.delay,
      }}
      sx={{
        position: "fixed",
        width: orb.size,
        height: orb.size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${theme.palette.primary.main}20, transparent)`,
        filter: "blur(1px)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

// Чистый градиентный фон
const CleanBackground: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%),
          radial-gradient(ellipse at top right, ${theme.palette.primary.main}04 0%, transparent 50%)
        `,
        zIndex: 0,
      }}
    />
  );
};

// Product Mockup (как интерфейс планирования в Calendly)
const ProductMockup: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <MotionBox
      variants={imageVariants}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        height: "500px",
        borderRadius: "24px",
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: `0 20px 80px ${
          theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"
        }`,
        overflow: "hidden",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          height: 40,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor:
                i === 0 ? "#ff5f57" : i === 1 ? "#ffbd2e" : "#28ca42",
            }}
          />
        ))}
      </Box>

      {/* Content area with requirement management interface */}
      <Box sx={{ p: 3, position: "relative", height: "calc(100% - 40px)" }}>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 3,
            fontSize: "1.1rem",
          }}
        >
          Управление требованиями
        </Typography>

        {/* Requirements list */}
        <Stack spacing={2}>
          {[
            {
              title: "Пользователь может войти в систему",
              status: "completed",
              priority: "high",
            },
            {
              title: "Система должна поддерживать OAuth",
              status: "in-progress",
              priority: "medium",
            },
            {
              title: "Реализовать dashboard с метриками",
              status: "todo",
              priority: "high",
            },
            {
              title: "Добавить уведомления в реальном времени",
              status: "review",
              priority: "low",
            },
          ].map((req, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              sx={{
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    req.status === "completed"
                      ? "success.main"
                      : req.status === "in-progress"
                      ? "warning.main"
                      : req.status === "review"
                      ? "info.main"
                      : "grey.300",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  color: "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                {req.title}
              </Typography>
              <Chip
                label={req.priority}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  borderColor:
                    req.priority === "high"
                      ? "error.main"
                      : req.priority === "medium"
                      ? "warning.main"
                      : "success.main",
                  color:
                    req.priority === "high"
                      ? "error.main"
                      : req.priority === "medium"
                      ? "warning.main"
                      : "success.main",
                }}
              />
            </MotionBox>
          ))}
        </Stack>

        {/* Floating elements */}
        <MotionBox
          animate={{
            y: [0, -5, 0],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 20px ${theme.palette.primary.main}30`,
          }}
        >
          <CheckIcon sx={{ color: "white", fontSize: 20 }} />
        </MotionBox>
      </Box>
    </MotionBox>
  );
};

export const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const heroSectionRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      id="hero"
      ref={heroSectionRef}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        py: { xs: 8, md: 4 },
      }}
    >
      {/* Тонкие Floating Orbs */}
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
        {FLOATING_ORBS.map((orb) => (
          <FloatingOrb key={orb.id} orb={orb} theme={theme} />
        ))}
      </Box>

      {/* Чистый фон */}
      <CleanBackground theme={theme} />

      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
      >
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100vh",
            py: { xs: 4, md: 8 },
          }}
        >
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            {/* Left Column - Content */}
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                {/* Status Badge */}
                <MotionBox variants={itemVariants}>
                  <Chip
                    icon={
                      <MotionBox
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "success.main",
                        }}
                      />
                    }
                    label="Some text"
                    variant="outlined"
                    sx={{
                      px: 2,
                      py: 1,
                      height: "auto",
                      borderRadius: "50px",
                      backgroundColor: "background.paper",
                      backdropFilter: "blur(10px)",
                      border: "1px solid",
                      borderColor: "divider",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      "& .MuiChip-label": {
                        px: 2,
                        py: 0.5,
                      },
                    }}
                  />
                </MotionBox>

                {/* Main Headline */}
                <MotionBox variants={itemVariants}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: {
                        xs: "2.5rem",
                        sm: "3.2rem",
                        md: "3.8rem",
                        lg: "4.2rem",
                      },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      color: "text.primary",
                      letterSpacing: "-0.025em",
                      mb: 1,
                    }}
                  >
                    Легкое управление
                  </Typography>

                  <MotionTypography
                    variant="h1"
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: "200% 50%" }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    sx={{
                      fontSize: {
                        xs: "2.5rem",
                        sm: "3.2rem",
                        md: "3.8rem",
                        lg: "4.2rem",
                      },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      background: `linear-gradient(90deg, 
                        ${theme.palette.primary.main}, 
                        ${theme.palette.secondary.main}, 
                        ${theme.palette.primary.dark},
                        ${theme.palette.primary.main})`,
                      backgroundSize: "300% 100%",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    требованиями
                  </MotionTypography>
                </MotionBox>

                {/* Subtitle */}
                <MotionTypography
                  variants={itemVariants}
                  variant="body1"
                  sx={{
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    fontWeight: 400,
                    color: "text.secondary",
                    lineHeight: 1.6,
                    maxWidth: "500px",
                  }}
                >
                  Присоединяйтесь к тысячам команд разработки, которые легко
                  управляют требованиями с помощью нашего инструмента №1 для
                  requirements management.
                </MotionTypography>

                {/* CTA Buttons */}
                <MotionBox variants={itemVariants}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <MotionButton
                      variant="contained"
                      size="large"
                      startIcon={<GoogleIcon />}
                      whileHover={{
                        y: -2,
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                        textTransform: "none",
                        minWidth: { xs: "100%", sm: "auto" },
                        "&:hover": {
                          boxShadow: `0 12px 32px ${theme.palette.primary.main}50`,
                        },
                      }}
                    >
                      Войти через Google
                    </MotionButton>

                    <MotionButton
                      variant="outlined"
                      size="large"
                      startIcon={<GithubIcon />}
                      whileHover={{
                        y: -2,
                        backgroundColor: `${theme.palette.action.hover}`,
                      }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: "12px",
                        borderWidth: 2,
                        textTransform: "none",
                        minWidth: { xs: "100%", sm: "auto" },
                        "&:hover": {
                          borderWidth: 2,
                        },
                      }}
                    >
                      Войти через Github
                    </MotionButton>
                  </Stack>

                  {/* Or divider and email signup */}
                  <Box sx={{ mt: 3, textAlign: { xs: "center", sm: "left" } }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      ИЛИ
                    </Typography>
                    <Button
                      variant="text"
                      startIcon={<EmailIcon />}
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Войти через email
                    </Button>
                  </Box>
                </MotionBox>
              </Stack>
            </Grid>

            {/* Right Column - Product Mockup */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  mt: { xs: 4, md: 0 },
                }}
              >
                <ProductMockup theme={theme} />
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
};
