import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Button,
  Stack,
} from "@mui/material";
import {
  GitHub,
  LinkedIn,
  Twitter,
  Email,
  Phone,
  LocationOn,
  Business,
  Security,
  Help,
  Info,
  Assignment,
  FolderOpen,
  BugReport,
  Analytics,
  Extension,
  Work,
  ContactMail,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const LandingFooter: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <GitHub />, href: "https://github.com/requify", label: "GitHub" },
    {
      icon: <LinkedIn />,
      href: "https://linkedin.com/company/requify",
      label: "LinkedIn",
    },
    {
      icon: <Twitter />,
      href: "https://twitter.com/requify",
      label: "Twitter",
    },
  ];

  const productLinks = [
    {
      title: t("footer.product.requirements", "Requirements Management"),
      href: "#requirements",
      icon: <Assignment />,
    },
    {
      title: t("footer.product.projects", "Project Management"),
      href: "#projects",
      icon: <FolderOpen />,
    },
    {
      title: t("footer.product.testing", "Testing & QA"),
      href: "#testing",
      icon: <BugReport />,
    },
    {
      title: t("footer.product.analytics", "Analytics"),
      href: "#analytics",
      icon: <Analytics />,
    },
    {
      title: t("footer.product.integrations", "Integrations"),
      href: "#integrations",
      icon: <Extension />,
    },
  ];

  const resourceLinks = [
    {
      title: t("footer.resources.documentation", "Documentation"),
      href: "/docs",
      icon: <Help />,
    },
    {
      title: t("footer.resources.api", "API"),
      href: "/api-overview",
      icon: <Business />,
    },
    {
      title: t("footer.resources.guide", "User Guide"),
      href: "/guide",
      icon: <Info />,
    },
    {
      title: t("footer.resources.security", "Security"),
      href: "/security",
      icon: <Security />,
    },
  ];

  const companyLinks = [
    {
      title: t("footer.company.about", "About Us"),
      href: "/about",
      icon: <Info />,
    },
    {
      title: t("footer.company.security", "Security"),
      href: "/security",
      icon: <Security />,
    },
    {
      title: t("footer.company.careers", "Careers"),
      href: "/careers",
      icon: <Work />,
    },
    {
      title: t("footer.company.contact", "Contact"),
      href: "/contact",
      icon: <ContactMail />,
    },
  ];

  const legalLinks = [
    { title: t("footer.legal.privacy", "Privacy Policy"), href: "/privacy" },
    { title: t("footer.legal.terms", "Terms of Use"), href: "/terms" },
    { title: t("footer.legal.license", "License"), href: "/license" },
    { title: t("footer.legal.cookies", "Cookies"), href: "/cookies" },
  ];

  const contactInfo = [
    {
      icon: <Email />,
      text: "hello@requify.com",
      href: "mailto:hello@requify.com",
    },
    { icon: <Phone />, text: "+7 (495) 123-45-67", href: "tel:+74951234567" },
    {
      icon: <LocationOn />,
      text: t("footer.contact.location", "Moscow, Russia"),
      href: "#",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 8 }}>
        {/* CTA Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              color: theme.palette.common.white,
              mb: 3,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {t(
              "footer.cta.title",
              "Ready to start managing requirements efficiently?"
            )}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {t(
              "footer.cta.subtitle",
              "Join thousands of teams that are already using Requify"
            )}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              href="/auth/register"
              sx={{
                backgroundColor: "white",
                color: "primary.main",
                "&:hover": {
                  backgroundColor: alpha("#ffffff", 0.9),
                  transform: "translateY(-2px)",
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {t("footer.cta.startFree", "Start Free")}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/demo"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: alpha("#ffffff", 0.1),
                  transform: "translateY(-2px)",
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
              }}
            >
              {t("footer.cta.demo", "Demo Version")}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha("#ffffff", 0.2) }} />

        {/* Main Section */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Main Information */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: theme.palette.common.white,
                }}
              >
                Requify
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                {t(
                  "footer.description",
                  "Professional requirements management platform that helps teams deliver better software faster."
                )}
              </Typography>

              {/* Contact Info */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                {contactInfo.map((contact, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      opacity: 0.9,
                    }}
                  >
                    <Box
                      sx={{
                        color: theme.palette.common.white,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {contact.icon}
                    </Box>
                    <Link
                      href={contact.href}
                      color="inherit"
                      underline="none"
                      sx={{
                        "&:hover": {
                          opacity: 0.8,
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {contact.text}
                    </Link>
                  </Box>
                ))}
              </Stack>

              {/* Social Links */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: theme.palette.common.white,
                      backgroundColor: alpha("#ffffff", 0.1),
                      "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.2),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Product Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.common.white,
                }}
              >
                {t("footer.sections.product", "Product")}
              </Typography>
              <Stack spacing={1.5}>
                {productLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.8,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Resources Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.common.white,
                }}
              >
                {t("footer.sections.resources", "Resources")}
              </Typography>
              <Stack spacing={1.5}>
                {resourceLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.8,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Company Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.common.white,
                }}
              >
                {t("footer.sections.company", "Company")}
              </Typography>
              <Stack spacing={1.5}>
                {companyLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.8,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Legal Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.common.white,
                }}
              >
                {t("footer.sections.legal", "Legal")}
              </Typography>
              <Stack spacing={1.5}>
                {legalLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      opacity: 0.8,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {link.title}
                  </Link>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: alpha("#ffffff", 0.2) }} />

        {/* Bottom Section */}
        <Box
          sx={{
            pt: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              opacity: 0.7,
            }}
          >
            © {currentYear} Requify.{" "}
            {t("footer.copyright", "All rights reserved.")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
