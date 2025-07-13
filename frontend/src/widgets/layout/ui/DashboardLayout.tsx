import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  alpha,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { HeaderWidget } from "@/widgets/header";
import { SidebarWidget } from "@/widgets/sidebar";
import { useSidebarState, useSidebarConfig } from "@/widgets/sidebar/model";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 64;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const theme = useTheme();
  const config = useSidebarConfig();
  const { isCollapsed, isMobile, isOpen, setOpen } = useSidebarState();
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === "dark");

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Интегрировать с глобальным theme provider
    console.log("Theme toggle:", !isDarkMode);
  };

  // Вычисляем отступ для основного контента
  const getMainContentMargin = () => {
    if (isMobile) return 0;
    return isCollapsed ? config.collapsedWidth : config.width;
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        position: "relative",
      }}
    >
      {/* Боковая панель */}
      <SidebarWidget />

      {/* Основная область контента */}
      <Box
        sx={{
          flex: 1,
          marginLeft: isMobile ? 0 : `${getMainContentMargin()}px`,
          transition: `margin-left ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Мобильная шапка */}
        {isMobile && (
          <AppBar
            position="fixed"
            elevation={0}
            sx={{
              zIndex: theme.zIndex.appBar,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              color: theme.palette.text.primary,
            }}
          >
            <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important` }}>
              <IconButton
                color="inherit"
                aria-label="открыть меню"
                edge="start"
                onClick={() => setOpen(!isOpen)}
                sx={{
                  mr: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>

              {/* Мобильный заголовок */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexGrow: 1,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    R
                  </span>
                </Box>
                <span
                  style={{ fontWeight: 700, color: theme.palette.primary.main }}
                >
                  Requify
                </span>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Десктопная шапка */}
        {!isMobile && (
          <Box
            component="header"
            sx={{
              position: "sticky",
              top: 0,
              zIndex: theme.zIndex.appBar,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              minHeight: HEADER_HEIGHT,
            }}
          >
            <HeaderWidget
              onThemeToggle={handleThemeToggle}
              isDarkMode={isDarkMode}
            />
          </Box>
        )}

        {/* Основной контент */}
        <Box
          component="main"
          sx={{
            flex: 1,
            paddingTop: isMobile ? `${HEADER_HEIGHT}px` : 0,
            position: "relative",
            overflow: "auto",
            backgroundColor: "transparent",
            // Улучшенный фон для контента
            "&::before": {
              content: '""',
              position: "fixed",
              top: 0,
              left: isMobile ? 0 : getMainContentMargin(),
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.02)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.01)} 50%,
                ${alpha(theme.palette.background.default, 1)} 100%)`,
              backgroundAttachment: "fixed",
              zIndex: -2,
              transition: `left ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            },
            // Паттерн для фона
            "&::after": {
              content: '""',
              position: "fixed",
              top: 0,
              left: isMobile ? 0 : getMainContentMargin(),
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(
                theme.palette.primary.main,
                0.03
              )} 0%, transparent 50%), 
                               radial-gradient(circle at 80% 80%, ${alpha(
                                 theme.palette.secondary.main,
                                 0.02
                               )} 0%, transparent 50%)`,
              backgroundSize: "800px 800px, 600px 600px",
              backgroundPosition: "0 0, 400px 200px",
              zIndex: -1,
              transition: `left ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            },
          }}
        >
          {/* Контейнер для контента с дополнительными стилями */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              minHeight: "100%",
              // Дополнительный контейнер для красивых переходов
              "& > *": {
                animation: "fadeInContent 0.6s ease-out",
              },
              "@keyframes fadeInContent": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
