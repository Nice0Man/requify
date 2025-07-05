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
  Policy,
  Gavel,
  RocketLaunch,
  Code,
  Article,
  Work,
} from "@mui/icons-material";

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <GitHub />, href: "#", label: "GitHub" },
    { icon: <LinkedIn />, href: "#", label: "LinkedIn" },
    { icon: <Twitter />, href: "#", label: "Twitter" },
  ];

  const productLinks = [
    { title: "Features", href: "/features", icon: <RocketLaunch /> },
    { title: "Documentation", href: "/docs", icon: <Help /> },
    { title: "API", href: "/api", icon: <Code /> },
    { title: "Security", href: "/security", icon: <Security /> },
  ];

  const companyLinks = [
    { title: "About", href: "/about", icon: <Info /> },
    { title: "Blog", href: "/blog", icon: <Article /> },
    { title: "Careers", href: "/careers", icon: <Work /> },
    { title: "Contact", href: "/contact", icon: <Email /> },
  ];

  const legalLinks = [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "License", href: "/license" },
  ];

  const contactInfo = [
    {
      icon: <Email />,
      text: "support@requify.com",
      href: "mailto:support@requify.com",
    },
    { icon: <Phone />, text: "+7 (495) 123-45-67", href: "tel:+74951234567" },
    { icon: <LocationOn />, text: "Moscow, Russia", href: "#" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor:
          theme.palette.mode === "dark" ? "grey.900" : "grey.100",
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Основная информация */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Requify
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, opacity: 0.9, lineHeight: 1.7 }}
            >
              Professional requirements management system for development teams.
              Simplify the process of creating, tracking, and managing software
              requirements.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Быстрые ссылки */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Product
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {productLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {React.cloneElement(link.icon, { fontSize: "small" })}
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Правовая информация */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {companyLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {React.cloneElement(link.icon, { fontSize: "small" })}
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Контактная информация */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {contactInfo.map((contact, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "text.secondary",
                  }}
                >
                  {React.cloneElement(contact.icon, { fontSize: "small" })}
                  {contact.href.startsWith("mailto:") ||
                  contact.href.startsWith("tel:") ? (
                    <Link
                      href={contact.href}
                      color="inherit"
                      underline="hover"
                      sx={{
                        fontSize: "0.875rem",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {contact.text}
                    </Link>
                  ) : (
                    <Typography variant="body2" color="inherit">
                      {contact.text}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {/* Дополнительная информация */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Technical support: 24/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Response time: up to 2 hours
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Нижняя часть */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Requify. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary">
              Version: 1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: Active
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "success.main",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "success.main",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
              <Typography variant="body2" color="inherit">
                All systems are operational
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
