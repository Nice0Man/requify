import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Paper,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Language,
  Security,
  Policy,
  Description,
  Support,
  Business,
  School,
  Code,
  Analytics,
  CloudQueue,
  Apps,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface FooterLinkSection {
  title: string;
  links: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  }[];
}

export const FooterSection: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const footerSections: FooterLinkSection[] = [
    {
      title: t("footer.product.title", "Продукт"),
      links: [
        {
          label: t("footer.product.features", "Возможности"),
          onClick: () => handleNavigation("/#features"),
          icon: <Code sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.product.pricing", "Тарифы"),
          onClick: () => handleNavigation("/pricing"),
          icon: <Business sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.product.integrations", "Интеграции"),
          onClick: () => handleNavigation("/#integrations"),
          icon: <Apps sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.product.analytics", "Аналитика"),
          onClick: () => handleNavigation("/analytics"),
          icon: <Analytics sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.product.security", "Безопасность"),
          onClick: () => handleNavigation("/security"),
          icon: <Security sx={{ fontSize: 18 }} />,
        },
      ],
    },
    {
      title: t("footer.solutions.title", "Решения"),
      links: [
        {
          label: t("footer.solutions.enterprise", "Для предприятий"),
          onClick: () => handleNavigation("/solutions/enterprise"),
          icon: <Business sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.solutions.startups", "Для стартапов"),
          onClick: () => handleNavigation("/solutions/startups"),
          icon: <CloudQueue sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.solutions.education", "Для образования"),
          onClick: () => handleNavigation("/solutions/education"),
          icon: <School sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.solutions.consulting", "Консалтинг"),
          onClick: () => handleNavigation("/consulting"),
          icon: <Support sx={{ fontSize: 18 }} />,
        },
      ],
    },
    {
      title: t("footer.resources.title", "Ресурсы"),
      links: [
        {
          label: t("footer.resources.docs", "Документация"),
          href: "https://docs.requify.com",
          icon: <Description sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.resources.api", "API Reference"),
          href: "https://api.requify.com/docs",
          icon: <Code sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.resources.guides", "Руководства"),
          onClick: () => handleNavigation("/guides"),
          icon: <School sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.resources.blog", "Блог"),
          onClick: () => handleNavigation("/blog"),
          icon: <Description sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.resources.community", "Сообщество"),
          href: "https://community.requify.com",
          icon: <GitHub sx={{ fontSize: 18 }} />,
        },
      ],
    },
    {
      title: t("footer.support.title", "Поддержка"),
      links: [
        {
          label: t("footer.support.help", "Центр помощи"),
          onClick: () => handleNavigation("/help"),
          icon: <Support sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.support.contact", "Связаться с нами"),
          onClick: () => handleNavigation("/contact"),
          icon: <Email sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.support.status", "Статус системы"),
          href: "https://status.requify.com",
          icon: <Analytics sx={{ fontSize: 18 }} />,
        },
        {
          label: t("footer.support.training", "Обучение"),
          onClick: () => handleNavigation("/training"),
          icon: <School sx={{ fontSize: 18 }} />,
        },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Email />,
      label: t("footer.contact.email", "Email"),
      value: "hello@requify.com",
      href: "mailto:hello@requify.com",
    },
    {
      icon: <Phone />,
      label: t("footer.contact.phone", "Телефон"),
      value: "+7 (495) 123-45-67",
      href: "tel:+74951234567",
    },
    {
      icon: <LocationOn />,
      label: t("footer.contact.address", "Адрес"),
      value: "Москва, Россия",
      href: "https://maps.google.com/?q=Moscow,Russia",
    },
  ];

  const socialLinks = [
    {
      icon: <Twitter />,
      label: "Twitter",
      href: "https://twitter.com/requify",
      color: "#1DA1F2",
    },
    {
      icon: <LinkedIn />,
      label: "LinkedIn",
      href: "https://linkedin.com/company/requify",
      color: "#0077B5",
    },
    {
      icon: <GitHub />,
      label: "GitHub",
      href: "https://github.com/requify",
      color: "#333",
    },
    {
      icon: <Facebook />,
      label: "Facebook",
      href: "https://facebook.com/requify",
      color: "#1877F2",
    },
  ];

  const legalLinks = [
    {
      label: t("footer.legal.privacy", "Политика конфиденциальности"),
      onClick: () => handleNavigation("/privacy"),
      icon: <Policy sx={{ fontSize: 16 }} />,
    },
    {
      label: t("footer.legal.terms", "Условия использования"),
      onClick: () => handleNavigation("/terms"),
      icon: <Description sx={{ fontSize: 16 }} />,
    },
    {
      label: t("footer.legal.cookies", "Политика cookies"),
      onClick: () => handleNavigation("/cookies"),
      icon: <Security sx={{ fontSize: 16 }} />,
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "#ffffff",
        py: { xs: 8, md: 10, xl: 12 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${alpha(
            "#ffffff",
            0.5
          )} 50%, transparent 100%)`,
        },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info Section */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              {/* Logo and Description */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(
                        "#ffffff",
                        0.2
                      )}, ${alpha("#ffffff", 0.1)})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 24px ${alpha("#000000", 0.3)}`,
                      border: `1px solid ${alpha("#ffffff", 0.2)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "1.8rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      R
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                      fontSize: "2rem",
                    }}
                  >
                    Requify
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: alpha("#ffffff", 0.8),
                    lineHeight: 1.6,
                    mb: 2,
                    fontSize: "1.2rem",
                  }}
                >
                  {t(
                    "footer.description",
                    "Современная платформа для управления требованиями, которая помогает командам создавать лучшие продукты быстрее и эффективнее."
                  )}
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    backgroundColor: alpha("#ffffff", 0.05),
                    border: `1px solid ${alpha("#ffffff", 0.1)}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#ffffff",
                      fontWeight: 600,
                      mb: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {t("footer.newsletter.title", "Будьте в курсе новостей")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha("#ffffff", 0.7),
                      mb: 2,
                      fontSize: "0.95rem",
                    }}
                  >
                    {t(
                      "footer.newsletter.description",
                      "Получайте обновления о новых функциях и лучших практиках"
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Box
                      component="input"
                      placeholder={t(
                        "footer.newsletter.placeholder",
                        "Ваш email"
                      )}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 1,
                        border: `1px solid ${alpha("#ffffff", 0.2)}`,
                        backgroundColor: alpha("#ffffff", 0.1),
                        color: "#ffffff",
                        fontSize: "1rem",
                        "&::placeholder": {
                          color: alpha("#ffffff", 0.5),
                        },
                        "&:focus": {
                          outline: "none",
                          borderColor: "#ffffff",
                        },
                      }}
                    />
                    <IconButton
                      sx={{
                        backgroundColor: alpha("#ffffff", 0.2),
                        color: "#ffffff",
                        border: `1px solid ${alpha("#ffffff", 0.3)}`,
                        width: 48,
                        height: 48,
                        "&:hover": {
                          backgroundColor: alpha("#ffffff", 0.3),
                        },
                      }}
                    >
                      <Email sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Stack>
                </Paper>
              </Box>

              {/* Contact Information */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  {t("footer.contact.title", "Контакты")}
                </Typography>
                <Stack spacing={1.5}>
                  {contactInfo.map((contact, index) => (
                    <Link
                      key={index}
                      href={contact.href}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: alpha("#ffffff", 0.8),
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#ffffff",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          backgroundColor: alpha("#ffffff", 0.2),
                          color: "#ffffff",
                        }}
                      >
                        {React.cloneElement(contact.icon, {
                          sx: { fontSize: 18 },
                        })}
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                        >
                          {contact.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ opacity: 0.8, fontSize: "0.9rem" }}
                        >
                          {contact.value}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                </Stack>
              </Box>

              {/* Social Links */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  {t("footer.social.title", "Мы в социальных сетях")}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  {socialLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: alpha("#ffffff", 0.1),
                        color: alpha("#ffffff", 0.8),
                        border: `1px solid ${alpha("#ffffff", 0.2)}`,
                        transition: "all 0.3s ease",
                        width: 48,
                        height: 48,
                        "&:hover": {
                          backgroundColor: alpha("#ffffff", 0.2),
                          color: "#ffffff",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {React.cloneElement(social.icon, {
                        sx: { fontSize: 20 },
                      })}
                    </IconButton>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Links Sections */}
          <Grid item xs={12} lg={7}>
            <Grid container spacing={3}>
              {footerSections.map((section, index) => (
                <Grid key={index} item xs={12} sm={6} md={3}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#ffffff",
                      fontWeight: 600,
                      mb: 2,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontSize: "1rem",
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Stack spacing={1}>
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.href}
                        onClick={link.onClick}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: alpha("#ffffff", 0.7),
                          textDecoration: "none",
                          fontSize: "1rem",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          "&:hover": {
                            color: "#ffffff",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        {link.icon && (
                          <Box sx={{ color: alpha("#ffffff", 0.8) }}>
                            {link.icon}
                          </Box>
                        )}
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Section - Fixed to bottom */}
      <Box sx={{ mt: "auto", pt: 4 }}>
        <Container maxWidth="xl">
          <Divider
            sx={{
              borderColor: alpha("#ffffff", 0.1),
              mb: 3,
            }}
          />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha("#ffffff", 0.6),
                    fontSize: "0.9rem",
                  }}
                >
                  © 2024 Requify. {t("footer.copyright", "Все права защищены.")}
                </Typography>

                <Stack direction="row" spacing={2}>
                  {legalLinks.map((link, index) => (
                    <Link
                      key={index}
                      onClick={link.onClick}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: alpha("#ffffff", 0.6),
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        "&:hover": {
                          color: "#ffffff",
                        },
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
                alignItems="center"
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: alpha("#ffffff", 0.6),
                  }}
                >
                  <Language sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                    {t("footer.language", "Русский")}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: alpha("#ffffff", 0.4),
                    fontSize: "0.85rem",
                  }}
                >
                  {t("footer.version", "Версия 0.0.1")}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};
