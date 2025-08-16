import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha,
  Slide,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Language as LanguageIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface LandingHeaderProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
  isScrolled: boolean;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  activeSection,
  onSectionClick,
  isScrolled,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { id: "hero", hash: "hero", label: t("landing.nav.home", "Home") },
    { id: "features", hash: "features", label: t("landing.nav.features", "Features") },
    {
      id: "integrations",
      hash: "integrations",
      label: t("landing.nav.integrations", "Integrations"),
    },
    { id: "pricing", hash: "pricing", label: t("landing.nav.pricing", "Pricing") },
    { id: "cta", hash: "cta", label: t("landing.nav.contact", "Contact") },
  ];

  // Скрытие/показ заголовка при скролле
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 80; // Минимальный скролл для скрытия header
      const scrollDelta = 50; // Минимальная дельта для реакции на скролл

      // Скрываем header при скролле вниз на определенное расстояние
      if (
        currentScrollY > lastScrollY + scrollDelta &&
        currentScrollY > scrollThreshold
      ) {
        setIsVisible(false);
      }
      // Показываем header при скролле вверх или в начале страницы
      else if (
        currentScrollY < lastScrollY - scrollDelta ||
        currentScrollY <= scrollThreshold
      ) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Дебаунс для оптимизации производительности
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [lastScrollY]);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchor(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleLangMenuClose();
  };

  const handleNavClick = (sectionId: string, sectionHash?: string) => {
    // Используем hash если он есть, иначе id
    onSectionClick(sectionHash || sectionId);
    handleMobileMenuClose();
  };

  const handleAuthClick = (type: "login" | "register") => {
    if (type === "login") {
      navigate("/auth");
    } else {
      navigate("/auth?mode=register");
    }
  };

  return (
    <Slide
      appear={false}
      direction="down"
      in={isVisible}
      timeout={{ enter: 300, exit: 200 }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: isScrolled
            ? alpha(theme.palette.background.paper, 0.95)
            : theme.palette.background.paper,
          backdropFilter: "blur(12px)",
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
          borderBottom: `1px solid ${alpha(
            theme.palette.divider,
            isScrolled ? 0.12 : 0.08
          )}`,
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          width: "100%",
          left: 0,
          right: 0,
          zIndex: 1100, // Выше чем scroll navigation (1000)
          transform: isVisible ? "translateY(0)" : "translateY(-100%)",
          boxShadow: isScrolled
            ? `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`
            : "none",
        }}
      >
        <Toolbar
          sx={{
            width: "100%",
            px: { xs: 2, sm: 3 },
            py: 0.5,
            minHeight: { xs: 56, sm: 64 },
            justifyContent: "space-between",
          }}
        >
          {/* Логотип - левая часть */}
          <Fade in timeout={800}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
              }}
              onClick={() => handleNavClick("hero")}
            >
              {/* Иконка логотипа */}
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: { xs: "32%", sm: "32%" },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  R
                </Typography>
              </Box>

              {/* Текст логотипа */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  Requify
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    color: theme.palette.text.secondary,
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  Requirements Platform
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Правая часть - навигация и действия */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Навигация для десктопа */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.hash)}
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      minWidth: "auto",
                      textTransform: "none",
                      fontSize: "0.95rem",
                      borderRadius: 1,
                      position: "relative",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 4,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: activeSection === item.id ? "20px" : "0",
                        height: "2px",
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 1,
                        transition: "width 0.2s ease",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Действия */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Переключатель языка */}
              <IconButton
                onClick={handleLangMenuOpen}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <LanguageIcon fontSize="small" />
              </IconButton>

              {!isMobile && (
                <>
                  {/* Кнопка входа */}
                  <Button
                    onClick={() => handleAuthClick("login")}
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      px: 2,
                      py: 0.75,
                      textTransform: "none",
                      fontSize: "0.9rem",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                    }}
                  >
                    {t("auth.login")}
                  </Button>

                  {/* Кнопка регистрации */}
                  <Button
                    onClick={() => handleAuthClick("register")}
                    variant="contained"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      fontWeight: 600,
                      px: 3,
                      py: 0.75,
                      textTransform: "none",
                      fontSize: "0.9rem",
                      borderRadius: 1.5,
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                        boxShadow: "none",
                      },
                    }}
                  >
                    {t("auth.register")}
                  </Button>
                </>
              )}

              {/* Мобильное меню */}
              {isMobile && (
                <IconButton
                  onClick={handleMobileMenuOpen}
                  size="small"
                  sx={{
                    color: theme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Toolbar>

        {/* Меню языков */}
        <Menu
          anchorEl={langMenuAnchor}
          open={Boolean(langMenuAnchor)}
          onClose={handleLangMenuClose}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 1.5,
              boxShadow: `0 4px 20px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              minWidth: 140,
            },
          }}
        >
          <MenuItem
            onClick={() => handleLanguageChange("en")}
            selected={i18n.language === "en"}
            sx={{ fontSize: "0.9rem", py: 1 }}
          >
            🇺🇸 English
          </MenuItem>
          <MenuItem
            onClick={() => handleLanguageChange("ru")}
            selected={i18n.language === "ru"}
            sx={{ fontSize: "0.9rem", py: 1 }}
          >
            🇷🇺 Русский
          </MenuItem>
        </Menu>

        {/* Мобильное меню */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 1.5,
              boxShadow: `0 4px 20px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              minWidth: 180,
            },
          }}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleNavClick(item.id, item.hash)}
              selected={activeSection === item.id}
              sx={{ fontSize: "0.9rem", py: 1 }}
            >
              {item.label}
            </MenuItem>
          ))}
          <Box
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              mt: 0.5,
              pt: 0.5,
            }}
          >
            <MenuItem
              onClick={() => handleAuthClick("login")}
              sx={{ fontSize: "0.9rem", py: 1 }}
            >
              <LoginIcon sx={{ mr: 1, fontSize: "1.1rem" }} />
              {t("auth.login")}
            </MenuItem>
            <MenuItem
              onClick={() => handleAuthClick("register")}
              sx={{ fontSize: "0.9rem", py: 1 }}
            >
              <PersonAddIcon sx={{ mr: 1, fontSize: "1.1rem" }} />
              {t("auth.register")}
            </MenuItem>
          </Box>
        </Menu>
      </AppBar>
    </Slide>
  );
};
