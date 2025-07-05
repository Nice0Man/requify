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
  Assignment,
  FolderOpen,
  Dashboard,
  BugReport,
  Analytics,
  Extension,
  Work,
  ContactMail,
} from "@mui/icons-material";

const LandingFooter: React.FC = () => {
  const theme = useTheme();
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
      title: "Requirements Management",
      href: "#requirements",
      icon: <Assignment />,
    },
    { title: "Project Management", href: "#projects", icon: <FolderOpen /> },
    { title: "Testing & QA", href: "#testing", icon: <BugReport /> },
    { title: "Analytics", href: "#analytics", icon: <Analytics /> },
    { title: "Integrations", href: "#integrations", icon: <Extension /> },
  ];

  const resourceLinks = [
    { title: "Documentation", href: "/docs", icon: <Help /> },
    { title: "API", href: "/api-overview", icon: <Business /> },
    { title: "User Guide", href: "/guide", icon: <Info /> },
    { title: "Security", href: "/security", icon: <Security /> },
  ];

  const companyLinks = [
    { title: "About Us", href: "/about", icon: <Info /> },
    { title: "Security", href: "/security", icon: <Security /> },
    { title: "Careers", href: "/careers", icon: <Work /> },
    { title: "Contact", href: "/contact", icon: <ContactMail /> },
  ];

  const legalLinks = [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Use", href: "/terms" },
    { title: "License", href: "/license" },
    { title: "Cookies", href: "/cookies" },
  ];

  const contactInfo = [
    {
      icon: <Email />,
      text: "hello@requify.com",
      href: "mailto:hello@requify.com",
    },
    { icon: <Phone />, text: "+7 (495) 123-45-67", href: "tel:+74951234567" },
    { icon: <LocationOn />, text: "Moscow, Russia", href: "#" },
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
            Ready to start managing requirements efficiently?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of teams that are already using Requify
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
              Start Free
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
              Demo Version
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
                variant="h5"
                component="h3"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 3 }}
              >
                Requify
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, opacity: 0.9, lineHeight: 1.7 }}
              >
                Modern platform for requirements management that helps teams
                create, track, and manage software requirements efficiently.
              </Typography>

              {/* Social Networks */}
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      color: "white",
                      backgroundColor: alpha("#ffffff", 0.1),
                      "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.2),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>

              {/* Statistics */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    500+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active Teams
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    10k+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Requirements Created
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    99.9%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Uptime
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Product */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Product
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {productLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.9,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {React.cloneElement(link.icon, { fontSize: "small" })}
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Resources */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Resources
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.9,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {React.cloneElement(link.icon, { fontSize: "small" })}
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Company */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Company
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {companyLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.9,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {React.cloneElement(link.icon, { fontSize: "small" })}
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={2}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Contact
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {contactInfo.map((contact, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      opacity: 0.9,
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
                          "&:hover": { opacity: 1 },
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
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: alpha("#ffffff", 0.2) }} />

        {/* Bottom Section */}
        <Box sx={{ py: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                © {currentYear} Requify. All rights reserved.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                }}
              >
                {legalLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      fontSize: "0.875rem",
                      opacity: 0.8,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#4caf50",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  All systems operational
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Version: 1.0.0
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Last updated: {new Date().toLocaleDateString("ru-RU")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
