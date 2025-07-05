import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Rating,
  Paper,
  Fade,
  Grow,
  Slide,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Verified,
  AutoAwesome,
  Group,
  Link,
  Timeline,
  PlayArrow,
  ArrowForward,
  CheckCircle,
  Star,
  TrendingUp,
  Security,
  Speed,
  AccountTree,
  Analytics,
  CloudSync,
  IntegrationInstructions,
  Insights,
  AutoFixHigh,
  VerifiedUser,
  Language,
  EmojiEvents,
  BusinessCenter,
} from "@mui/icons-material";

interface HeroSectionProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
  isAuthenticated?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  showMetrics?: boolean;
  showTestimonials?: boolean;
  showPartners?: boolean;
}

interface TestimonialData {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
}

interface PartnerData {
  name: string;
  logo: string;
  category: string;
}

const testimonials: TestimonialData[] = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
    quote: "Requify has transformed how we manage requirements. It's intuitive and powerful.",
  },
  {
    name: "Michael Chen",
    role: "Engineering Lead",
    company: "StartupXYZ",
    avatar: "/avatars/michael.jpg", 
    rating: 5,
    quote: "The best requirements management tool we've ever used. Highly recommended!",
  },
  {
    name: "Emily Davis",
    role: "QA Director",
    company: "Enterprise Inc",
    avatar: "/avatars/emily.jpg",
    rating: 5,
    quote: "The automated testing integration is a game-changer for our QA process.",
  },
];

const partners: PartnerData[] = [
  { name: "GitHub", logo: "/logos/github.svg", category: "DevOps" },
  { name: "Jira", logo: "/logos/jira.svg", category: "Project Management" },
  { name: "Slack", logo: "/logos/slack.svg", category: "Communication" },
  { name: "Microsoft", logo: "/logos/microsoft.svg", category: "Enterprise" },
  { name: "Google", logo: "/logos/google.svg", category: "Cloud" },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onWatchDemo,
  isAuthenticated = false,
  variant = 'default',
  showMetrics = true,
  showTestimonials = true,
  showPartners = true,
}) => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isInView, setIsInView] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showTestimonials) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showTestimonials]);

  const certifications = [
    { text: "SOC 2 Type II Certified", icon: <VerifiedUser /> },
    { text: "GDPR Compliant", icon: <Security /> },
    { text: "ISO 27001 Certified", icon: <Verified /> },
  ];

  const keyFeatures = [
    {
      icon: <AutoAwesome />,
      title: "AI-Powered Analysis",
      description: "Intelligent automation for better quality",
      color: theme.palette.primary.main,
      benefits: ["Smart requirements validation", "Automated gap detection", "Predictive analytics"],
    },
    {
      icon: <Group />,
      title: "Real-time Collaboration",
      description: "Seamless workflow coordination",
      color: theme.palette.secondary.main,
      benefits: ["Live editing", "Real-time notifications", "Team communication"],
    },
    {
      icon: <IntegrationInstructions />,
      title: "Advanced Integrations",
      description: "Connect with your existing tools",
      color: theme.palette.success.main,
      benefits: ["50+ integrations", "Custom APIs", "Webhook support"],
    },
    {
      icon: <Analytics />,
      title: "Complete Analytics",
      description: "Data-driven insights and reporting",
      color: theme.palette.warning.main,
      benefits: ["Custom dashboards", "Real-time metrics", "Compliance reports"],
    },
  ];

  const keyMetrics = [
    {
      value: "99.9%",
      label: "Uptime SLA",
      icon: <CloudSync />,
      description: "Reliable and always available",
    },
    {
      value: "65%",
      label: "Faster Delivery",
      icon: <Speed />,
      description: "Accelerate your development cycle",
    },
    {
      value: "10K+",
      label: "Active Users",
      icon: <Group />,
      description: "Trusted by teams worldwide",
    },
    {
      value: "40h",
      label: "Weekly Saved",
      icon: <TrendingUp />,
      description: "More time for innovation",
    },
  ];

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const handleWatchDemo = () => {
    if (onWatchDemo) {
      onWatchDemo();
    }
  };

  return (
    <Box
      ref={sectionRef}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.default, 0.95)} 0%, 
          ${alpha(theme.palette.primary.main, 0.02)} 25%,
          ${alpha(theme.palette.secondary.main, 0.02)} 75%,
          ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        position: "relative",
        overflow: "hidden",
        scrollSnapAlign: "start",
        opacity: 0,
        transform: "translateY(50px)",
        transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&.animate-in": {
          opacity: 1,
          transform: "translateY(0)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%), 
            radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, ${alpha(theme.palette.success.main, 0.05)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "150%",
          height: "150%",
          transform: "translate(-50%, -50%) rotate(45deg)",
          background: `linear-gradient(90deg, transparent 48%, ${alpha(theme.palette.divider, 0.03)} 50%, transparent 52%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={8} alignItems="center">
          {/* Left Column - Content */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={6}>
              {/* Certifications */}
              <Fade in={isInView} timeout={800}>
                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={2}
                  flexWrap="wrap"
                  useFlexGap
                  alignItems={isMobile ? "flex-start" : "center"}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      fontSize: '0.75rem',
                    }}
                  >
                    TRUSTED & SECURE
                  </Typography>
                  {certifications.map((cert, index) => (
                    <Grow in={isInView} timeout={1000 + index * 200} key={index}>
                      <Chip
                        label={cert.text}
                        size="small"
                        icon={cert.icon}
                        sx={{
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          borderRadius: 3,
                          "& .MuiChip-icon": {
                            color: theme.palette.success.main,
                            fontSize: "1rem",
                          },
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.success.main, 0.15),
                            transform: "translateY(-1px)",
                            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </Grow>
                  ))}
                </Stack>
              </Fade>

              {/* Main Heading */}
              <Slide direction="right" in={isInView} timeout={1000}>
                <Stack spacing={3}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem", lg: "5rem" },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: theme.palette.text.primary,
                      textAlign: { xs: 'center', lg: 'left' },
                    }}
                  >
                    Requirements Management
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        mt: 1,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          width: '40%',
                          height: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          borderRadius: 2,
                        },
                      }}
                    >
                      Made Simple
                    </Box>
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: theme.palette.text.secondary,
                      maxWidth: "600px",
                      textAlign: { xs: 'center', lg: 'left' },
                      mx: { xs: 'auto', lg: 0 },
                    }}
                  >
                    Transform your development process with intelligent
                    requirements management. From concept to deployment, ensure
                    nothing falls through the cracks.
                  </Typography>
                </Stack>
              </Slide>

              {/* CTA Buttons */}
              <Fade in={isInView} timeout={1400}>
                <Stack 
                  direction={isMobile ? "column" : "row"} 
                  spacing={3} 
                  alignItems="center"
                  justifyContent={{ xs: 'center', lg: 'flex-start' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 3,
                      textTransform: "none",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      minWidth: 200,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                    }}
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                  </Button>

                  {onWatchDemo && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleWatchDemo}
                      startIcon={<PlayArrow />}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: "none",
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        minWidth: 180,
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Watch Demo
                    </Button>
                  )}
                </Stack>
              </Fade>

              {/* Testimonial Highlight */}
              {showTestimonials && (
                <Fade in={isInView} timeout={1600}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.8),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backdropFilter: 'blur(20px)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                        {testimonials.map((testimonial, index) => (
                          <Avatar key={index} alt={testimonial.name} src={testimonial.avatar}>
                            {testimonial.name[0]}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Rating value={5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          "Requify has revolutionized our requirements process. Highly recommended!"
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Trusted by 10,000+ teams worldwide
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Fade>
              )}

              {/* Key Metrics */}
              {showMetrics && (
                <Fade in={isInView} timeout={1800}>
                  <Grid container spacing={3}>
                    {keyMetrics.map((metric, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Grow in={isInView} timeout={2000 + index * 200}>
                          <Stack spacing={1} alignItems="center" textAlign="center">
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.palette.primary.main,
                                mb: 1,
                              }}
                            >
                              {metric.icon}
                            </Box>
                            <Typography
                              variant="h4"
                              sx={{
                                fontSize: { xs: "1.5rem", md: "2rem" },
                                fontWeight: 700,
                                color: theme.palette.primary.main,
                                lineHeight: 1,
                              }}
                            >
                              {metric.value}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                              }}
                            >
                              {metric.label}
                            </Typography>
                          </Stack>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Fade>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Features & Visual */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={4}>
              {/* Hero Visual */}
              <Slide direction="left" in={isInView} timeout={1200}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backdropFilter: 'blur(20px)',
                    transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    "&:hover": {
                      transform: "scale(1.02) translateY(-8px)",
                      boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: "300px", sm: "400px", md: "450px" },
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                        ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.text.secondary,
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      Dashboard Preview
                      <br />
                      <Typography variant="caption" color="text.disabled">
                        Interactive Demo Coming Soon
                      </Typography>
                    </Typography>

                    {/* Floating Elements */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        animation: 'float 3s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-10px)' },
                        },
                      }}
                    >
                      <CheckCircle />
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 30,
                        left: 30,
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        background: alpha(theme.palette.warning.main, 0.9),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        animation: 'bounce 2s ease-in-out infinite',
                        '@keyframes bounce': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-5px)' },
                        },
                      }}
                    >
                      <AutoFixHigh />
                    </Box>
                  </Box>
                </Box>
              </Slide>

              {/* Key Features Grid */}
              <Grid container spacing={3}>
                {keyFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Grow in={isInView} timeout={1400 + index * 200}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: alpha(theme.palette.background.paper, 0.8),
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          backdropFilter: 'blur(20px)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 12px 32px ${alpha(feature.color, 0.15)}`,
                            borderColor: alpha(feature.color, 0.2),
                          },
                        }}
                      >
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              backgroundColor: alpha(feature.color, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: feature.color,
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Stack spacing={1}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                              }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.6 }}
                            >
                              {feature.description}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>

              {/* Partners Section */}
              {showPartners && (
                <Fade in={isInView} timeout={2000}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.6),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: 1,
                        }}
                      >
                        Trusted by Industry Leaders
                      </Typography>
                      <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center" useFlexGap>
                        {partners.map((partner, index) => (
                          <Tooltip title={`${partner.name} - ${partner.category}`} key={index}>
                            <Box
                              sx={{
                                width: 60,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2,
                                background: alpha(theme.palette.background.paper, 0.8),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {partner.name}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                </Fade>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
