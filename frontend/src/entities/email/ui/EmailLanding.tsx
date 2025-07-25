import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  useTheme,
  Snackbar,
  Alert,
  Container,
  Stack,
  CircularProgress,
  InputAdornment,
  Paper,
  Fade,
} from "@mui/material";
import {
  Mail as MailIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { emailSchema, EmailFormData } from "../model/validation";
import emailApi from "../api/emailApi";

// Motion components
const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionPaper = motion(Paper);

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const iconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

type NotificationState = {
  open: boolean;
  type: "success" | "error";
  message: string;
};

export const EmailLanding: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [notification, setNotification] = React.useState<NotificationState>({
    open: false,
    type: "success",
    message: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    mode: "onBlur",
  });

  const email = watch("email");
  const isEmailValid = email && !errors.email;

  const onSubmit = async (data: EmailFormData) => {
    try {
      await emailApi.subscribe(data.email!);

      setNotification({
        open: true,
        type: "success",
        message: t(
          "email.success.subscribe",
          "Спасибо! Проверьте почту для подтверждения подписки."
        ),
      });

      reset();
    } catch (error) {
      setNotification({
        open: true,
        type: "error",
        message: t(
          "email.error.subscribe",
          "Не удалось подписаться. Попробуйте позже."
        ),
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 12 } }}>
      <MotionStack
        spacing={{ xs: 4, md: 6 }}
        alignItems="center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Animated Header */}
        <MotionStack
          spacing={3}
          alignItems="center"
          textAlign="center"
          variants={itemVariants}
        >
          {/* Typography with better hierarchy */}
          <Stack spacing={2} alignItems="center">
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                background: theme.palette.primary.main,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
              }}
            >
              {t("email.title", "Будьте в курсе всех новинок")}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: "sm",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              {t(
                "email.subtitle",
                "Получайте эксклюзивные обновления, полезные материалы и инсайты прямо на почту"
              )}
            </Typography>
          </Stack>
        </MotionStack>

        {/* Enhanced Form with Glassmorphism */}
        <MotionPaper
          variants={itemVariants}
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "md",
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            // Glassmorphism effect
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              rgba(255, 255, 255, 0.05) 100%
            )`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)", // Safari support
            // Glassmorphism border with gradient
            border: "1px solid transparent",
            backgroundImage: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)),
              linear-gradient(135deg, 
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.1) 50%,
                rgba(255, 255, 255, 0.05) 100%
              )
            `,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            // Enhanced shadow for depth
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.1),
              0 2px 16px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            // Hover effect
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.15) 0%, 
                rgba(255, 255, 255, 0.08) 100%
              )`,
              boxShadow: `
                0 12px 40px rgba(0, 0, 0, 0.15),
                0 4px 20px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `,
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Form fields */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  {...register("email")}
                  type="email"
                  placeholder={t("email.placeholder", "your@company.com")}
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      // Glassmorphism for input
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.12)",
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
                        border: `1px solid ${theme.palette.primary.main}60`,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isEmailValid}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 200 },
                    height: 56,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    // Enhanced glassmorphism button
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main}E6, 
                      ${theme.palette.primary.dark}E6
                    )`,
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${theme.palette.primary.main}40`,
                    boxShadow: `
                      0 8px 32px ${theme.palette.primary.main}40,
                      0 2px 16px ${theme.palette.primary.main}30,
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.main}F0, 
                        ${theme.palette.primary.dark}F0
                      )`,
                      transform: "translateY(-2px)",
                      boxShadow: `
                        0 12px 40px ${theme.palette.primary.main}50,
                        0 4px 20px ${theme.palette.primary.main}40,
                        inset 0 1px 0 rgba(255, 255, 255, 0.3)
                      `,
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                    "&:disabled": {
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.5)",
                      transform: "none",
                      boxShadow: "none",
                      backdropFilter: "blur(5px)",
                    },
                  }}
                >
                  {isSubmitting
                    ? t("email.submitting", "Подписываем...")
                    : t("email.submit", "Подписаться")}
                </Button>
              </Stack>

              {/* Trust indicators */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ pt: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t("email.benefit1", "Никакого спама")}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SecurityIcon sx={{ color: "success.main", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t("email.benefit2", "100% конфиденциально")}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MailIcon sx={{ color: "success.main", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t("email.benefit3", "Отписка в 1 клик")}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </MotionPaper>

        {/* Enhanced Privacy Notice */}
        <MotionBox variants={itemVariants} sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              maxWidth: "400px",
            }}
          >
            {t(
              "email.privacy",
              "Мы уважаем вашу конфиденциальность. Отписаться можно в любое время."
            )}
          </Typography>
        </MotionBox>
      </MotionStack>

      {/* Enhanced Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          variant="filled"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            "& .MuiAlert-icon": {
              fontSize: "1.25rem",
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
