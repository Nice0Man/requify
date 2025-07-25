import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  useTheme,
  Link,
  Divider,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  GitHub,
  Twitter,
  LinkedIn,
  YouTube,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ArrowUpward as ArrowUpIcon,
} from "@mui/icons-material";
import { EmailLanding } from "@/entities/email/ui/EmailLanding";
// Floating particles data
const FLOATING_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 32 + 14,
  duration: Math.random() * 18 + 14,
  delay: Math.random() * 5,
}));

const FOOTER_LINKS = {
  product: [
    {
      textKey: "footer.product.features",
      defaultText: "Features",
      href: "#features",
    },
    {
      textKey: "footer.product.integrations",
      defaultText: "Integrations",
      href: "#integrations",
    },
    {
      textKey: "footer.product.pricing",
      defaultText: "Pricing",
      href: "#pricing",
    },
    {
      textKey: "footer.product.changelog",
      defaultText: "Changelog",
      href: "/changelog",
    },
    {
      textKey: "footer.product.roadmap",
      defaultText: "Roadmap",
      href: "/roadmap",
    },
  ],
  resources: [
    {
      textKey: "footer.resources.docs",
      defaultText: "Documentation",
      href: "/docs",
    },
    {
      textKey: "footer.resources.api",
      defaultText: "API Reference",
      href: "/api",
    },
    {
      textKey: "footer.resources.guides",
      defaultText: "Guides",
      href: "/guides",
    },
    { textKey: "footer.resources.blog", defaultText: "Blog", href: "/blog" },
    {
      textKey: "footer.resources.help",
      defaultText: "Help Center",
      href: "/help",
    },
  ],
  company: [
    {
      textKey: "footer.company.about",
      defaultText: "About Us",
      href: "/about",
    },
    {
      textKey: "footer.company.careers",
      defaultText: "Careers",
      href: "/careers",
    },
    {
      textKey: "footer.company.press",
      defaultText: "Press Kit",
      href: "/press",
    },
    {
      textKey: "footer.company.partners",
      defaultText: "Partners",
      href: "/partners",
    },
    {
      textKey: "footer.company.contact",
      defaultText: "Contact",
      href: "/contact",
    },
  ],
  legal: [
    {
      textKey: "footer.legal.privacy",
      defaultText: "Privacy Policy",
      href: "/privacy",
    },
    {
      textKey: "footer.legal.terms",
      defaultText: "Terms of Service",
      href: "/terms",
    },
    {
      textKey: "footer.legal.security",
      defaultText: "Security",
      href: "/security",
    },
    {
      textKey: "footer.legal.cookies",
      defaultText: "Cookie Policy",
      href: "/cookies",
    },
    {
      textKey: "footer.legal.compliance",
      defaultText: "Compliance",
      href: "/compliance",
    },
  ],
};

const SOCIAL_LINKS = [
  { icon: GitHub, href: "https://github.com/requify", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/requify", label: "Twitter" },
  {
    icon: LinkedIn,
    href: "https://linkedin.com/company/requify",
    label: "LinkedIn",
  },
  { icon: YouTube, href: "https://youtube.com/requify", label: "YouTube" },
];

const CONTACT_INFO = [
  {
    icon: EmailIcon,
    textKey: "footer.contact.email",
    defaultText: "hello@requify.com",
    href: "mailto:hello@requify.com",
  },
  {
    icon: PhoneIcon,
    textKey: "footer.contact.phone",
    defaultText: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: LocationIcon,
    textKey: "footer.contact.address",
    defaultText: "San Francisco, CA",
    href: "#",
  },
];

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const FloatingParticle: React.FC<{
  particle: (typeof FLOATING_PARTICLES)[0];
  theme: any;
}> = ({ particle, theme }) => {
  return (
    <MotionBox
      initial={{
        x: `${particle.x}vw`,
        y: `${particle.y}vh`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [`${particle.x}vw`, `${particle.x + 3}vw`, `${particle.x}vw`],
        y: [`${particle.y}vh`, `${particle.y - 5}vh`, `${particle.y}vh`],
        scale: [0, 1, 0.7, 1],
        opacity: [0, 0.25, 0.1, 0.25],
        rotate: [0, 120, 240, 360],
      }}
      transition={{
        duration: particle.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      }}
      sx={{
        position: "fixed",
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}18)`,
        filter: "blur(1.0px)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

const AnimatedGradient: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 85%, ${theme.palette.primary.main}08 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, ${theme.palette.secondary.main}08 0%, transparent 50%)
        `,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      id="footer"
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "grey.900",
        overflow: "hidden",
      }}
    >
      {/* Floating Particles - Full Background Coverage */}
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
        {FLOATING_PARTICLES.map((particle) => (
          <FloatingParticle
            key={particle.id}
            particle={particle}
            theme={theme}
          />
        ))}
      </Box>

      {/* Animated Background */}
      <AnimatedGradient theme={theme} />

      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, width: "100%" }}
      >
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100vh",
            py: { xs: 8, md: 12 },
          }}
        >
          {/* Main Footer Content */}
          <MotionBox variants={itemVariants} sx={{ mb: { xs: 6, md: 8 } }}>
            <Grid container spacing={{ xs: 4, md: 6 }}>
              {/* Company Info */}
              <Grid item xs={12} md={4}>
                <MotionBox sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "white",
                      mb: 3,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    Requify
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "grey.300",
                      mb: 4,
                      fontSize: { xs: "0.95rem", md: "1.05rem" },
                      lineHeight: 1.7,
                      maxWidth: "400px",
                    }}
                  >
                    {t(
                      "footer.description",
                      "Empowering teams to capture, manage, and deliver requirements with intelligence and precision. Built for the modern development workflow."
                    )}
                  </Typography>

                  {/* Contact Info */}
                  <Box sx={{ mb: 4 }}>
                    {CONTACT_INFO.map((contact, index) => {
                      const IconComponent = contact.icon;
                      return (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <IconComponent
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                          <Link
                            href={contact.href}
                            sx={{
                              color: "grey.300",
                              textDecoration: "none",
                              fontSize: "0.9rem",
                              "&:hover": {
                                color: "primary.main",
                              },
                              transition: "color 0.3s ease",
                            }}
                          >
                            {t(contact.textKey, contact.defaultText)}
                          </Link>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Social Links */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {SOCIAL_LINKS.map((social, index) => {
                      const IconComponent = social.icon;
                      return (
                        <Link
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: "none" }}
                        >
                          <MotionIconButton
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "primary.main",
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <IconComponent sx={{ fontSize: 20 }} />
                          </MotionIconButton>
                        </Link>
                      );
                    })}
                  </Box>
                </MotionBox>
              </Grid>

              {/* Links Sections */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  {/* Product Links */}
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      {t("footer.sections.product", "Product")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {FOOTER_LINKS.product.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          sx={{
                            color: "grey.400",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            "&:hover": {
                              color: "primary.main",
                            },
                            transition: "color 0.3s ease",
                          }}
                        >
                          {t(link.textKey, link.defaultText)}
                        </Link>
                      ))}
                    </Box>
                  </Grid>

                  {/* Resources Links */}
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      {t("footer.sections.resources", "Resources")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {FOOTER_LINKS.resources.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          sx={{
                            color: "grey.400",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            "&:hover": {
                              color: "primary.main",
                            },
                            transition: "color 0.3s ease",
                          }}
                        >
                          {t(link.textKey, link.defaultText)}
                        </Link>
                      ))}
                    </Box>
                  </Grid>

                  {/* Company Links */}
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      {t("footer.sections.company", "Company")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {FOOTER_LINKS.company.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          sx={{
                            color: "grey.400",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            "&:hover": {
                              color: "primary.main",
                            },
                            transition: "color 0.3s ease",
                          }}
                        >
                          {t(link.textKey, link.defaultText)}
                        </Link>
                      ))}
                    </Box>
                  </Grid>

                  {/* Legal Links */}
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      {t("footer.sections.legal", "Legal")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {FOOTER_LINKS.legal.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          sx={{
                            color: "grey.400",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            "&:hover": {
                              color: "primary.main",
                            },
                            transition: "color 0.3s ease",
                          }}
                        >
                          {t(link.textKey, link.defaultText)}
                        </Link>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MotionBox>

          <EmailLanding />

          {/* Bottom Section */}
          <MotionBox
            variants={itemVariants}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              pb: 2,
            }}
          >
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 4 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                px: { xs: 2, md: 4 },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "grey.500",
                  fontSize: "0.9rem",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                {t(
                  "footer.copyright",
                  "© 2024 Requify. All rights reserved. Built with ❤️ for teams who demand excellence."
                )}
              </Typography>
            </Box>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};
