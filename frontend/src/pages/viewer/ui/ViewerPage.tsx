import React, { useState } from "react";
import { Box, Button, Stack, useTheme, alpha, Fade } from "@mui/material";
import { ArrowBack, ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DemoHeroSection } from "@/features/demo-platform";
import { DemoDashboardWidget } from "@/widgets/demo-dashboard";

type ViewerMode = "hero" | "dashboard";

const ViewerPage: React.FC = () => {
  const [mode, setMode] = useState<ViewerMode>("hero");
  const navigate = useNavigate();
  const theme = useTheme();

  const handleStartDemo = () => {
    setMode("dashboard");
  };

  const handleBackToHero = () => {
    setMode("hero");
  };

  const handleGoToAuth = () => {
    navigate("/auth");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Навигационная панель */}
      <Box
        sx={{
          zIndex: 1000,
          background: alpha("#ffffff", 0.9),
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha("#ffffff", 0.2)}`,
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "center",
          height: "auto",
        }}
      >
        <Box
          sx={{
            pt: 0,
            m: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: 1200,
          }}
        >
          {/* Левая часть - кнопки навигации */}
          <Stack direction="row" spacing={2}>
            {mode === "dashboard" && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBackToHero}
                size="small"
                sx={{
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Назад к демо
              </Button>
            )}
            <Button
              variant="text"
              onClick={handleGoHome}
              size="small"
              sx={{
                borderRadius: 2,
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  color: theme.palette.primary.main,
                },
              }}
            >
              На главную
            </Button>
          </Stack>

          {/* Правая часть - кнопка подписки */}
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleGoToAuth}
            size="small"
            sx={{
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                transform: "translateY(-1px)",
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
              },
              transition: "all 0.3s ease",
            }}
          >
            Купить подписку
          </Button>
        </Box>
      </Box>

      {/* Основной контент */}
      <Box>
        {mode === "hero" && (
          <Fade in={mode === "hero"} timeout={600}>
            <Box>
              <DemoHeroSection onStartDemo={handleStartDemo} />
            </Box>
          </Fade>
        )}

        {mode === "dashboard" && (
          <Fade in={mode === "dashboard"} timeout={600}>
            <Box>
              <DemoDashboardWidget />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default ViewerPage;
