import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Avatar,
  Chip,
  Stack,
  Paper,
  Divider,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import {
  Assignment,
  Security,
  Speed,
  Groups,
  Analytics,
  CloudDone,
  CheckCircle,
  ArrowForward,
  Star,
  LinkedIn,
  Twitter,
  GitHub,
  PlayArrow,
  TrendingUp,
  AutoAwesome,
  Rocket,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/context/auth.context";

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [animationTrigger, setAnimationTrigger] = React.useState(false);

  React.useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  const features = [
    {
      title: "Requirements Management",
      description:
        "Organize and track requirements with structured categorization and workflow management.",
      icon: <Assignment />,
      color: theme.palette.primary.main,
    },
    {
      title: "Testing Framework",
      description:
        "Comprehensive testing suite with execution monitoring and detailed reporting.",
      icon: <Analytics />,
      color: theme.palette.success.main,
    },
    {
      title: "Team Collaboration",
      description:
        "Enable team collaboration with real-time updates and role-based access control.",
      icon: <Groups />,
      color: theme.palette.info.main,
    },
    {
      title: "Security",
      description:
        "OAuth2 authentication with audit trails and data protection compliance.",
      icon: <Security />,
      color: theme.palette.warning.main,
    },
    {
      title: "Workflow Automation",
      description:
        "Streamline processes with automated workflows and custom triggers.",
      icon: <Speed />,
      color: theme.palette.secondary.main,
    },
    {
      title: "Cloud Infrastructure",
      description:
        "Scalable cloud infrastructure with high availability and automatic backups.",
      icon: <CloudDone />,
      color: theme.palette.error.main,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp Inc.",
      quote:
        "Requify improved our requirements management process and reduced project delivery time significantly.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Software Architect",
      company: "Innovation Labs",
      quote:
        "The testing framework is powerful and helped us catch critical issues early in development.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "QA Director",
      company: "DevSolutions",
      quote:
        "Excellent requirements management tool with effective collaboration features for distributed teams.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "10,000+", label: "Requirements Managed" },
    { value: "500+", label: "Projects Completed" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}
      <Slide direction="down" in={animationTrigger} timeout={800}>
        <Box
          sx={{
            backgroundColor: "white",
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 2,
                height: 64,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  cursor: "pointer",
                }}
              >
                Requify
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/api-overview")}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  API Documentation
                </Button>
                {user ? (
                  <Button
                    variant="contained"
                    onClick={() => navigate("/dashboard")}
                    sx={{
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="text"
                      onClick={() => navigate("/login")}
                      sx={{
                        borderRadius: 1,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/login")}
                      sx={{
                        borderRadius: 1,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Container>
        </Box>
      </Slide>

      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: "grey.50",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Fade in={animationTrigger} timeout={1000}>
                  <Chip
                    label="Requirements Management Platform"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      alignSelf: "flex-start",
                      fontWeight: 500,
                    }}
                  />
                </Fade>
                <Slide direction="up" in={animationTrigger} timeout={1200}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      lineHeight: 1.2,
                      color: "text.primary",
                    }}
                  >
                    Streamline Your{" "}
                    <Box
                      component="span"
                      sx={{
                        color: "primary.main",
                      }}
                    >
                      Requirements
                    </Box>{" "}
                    Management
                  </Typography>
                </Slide>
                <Slide direction="up" in={animationTrigger} timeout={1400}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 400,
                      maxWidth: 500,
                      lineHeight: 1.6,
                    }}
                  >
                    Professional requirements tracking, automated testing, and team collaboration tools for efficient project delivery.
                  </Typography>
                </Slide>
                <Slide direction="up" in={animationTrigger} timeout={1600}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() =>
                        user ? navigate("/dashboard") : navigate("/login")
                      }
                      endIcon={<ArrowForward />}
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 1,
                        fontWeight: 500,
                        textTransform: "none",
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/api-overview")}
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 1,
                        fontWeight: 500,
                        textTransform: "none",
                      }}
                    >
                      View Documentation
                    </Button>
                  </Stack>
                </Slide>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={animationTrigger} timeout={1800}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    backgroundColor: "white",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={600}>
                      Platform Overview
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        "Requirements Management",
                        "Testing Framework",
                        "Team Collaboration",
                        "API Integration",
                      ].map((item, index) => (
                        <Stack
                          key={index}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                        >
                          <CheckCircle
                            sx={{ color: "success.main", fontSize: 20 }}
                          />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: "white" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Grow in={animationTrigger} timeout={1000 + index * 200}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        mb: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Slide direction="up" in={animationTrigger} timeout={1200}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: "text.primary",
                }}
              >
                Core Features
              </Typography>
            </Slide>
            <Slide direction="up" in={animationTrigger} timeout={1400}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto", fontWeight: 400 }}
              >
                Comprehensive tools designed to streamline your requirements management process.
              </Typography>
            </Slide>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Grow in={animationTrigger} timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      height: "100%",
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            backgroundColor: alpha(feature.color, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: feature.color,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
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
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Slide direction="up" in={animationTrigger} timeout={1000}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: "text.primary",
                }}
              >
                Getting Started
              </Typography>
            </Slide>
            <Slide direction="up" in={animationTrigger} timeout={1200}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto", fontWeight: 400 }}
              >
                Simple setup process to get your team productive quickly
              </Typography>
            </Slide>
          </Box>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                step: "01",
                title: "Create Your Project",
                description: "Set up your project workspace and configure settings",
              },
              {
                step: "02",
                title: "Add Requirements",
                description: "Import existing documents or create requirements from scratch",
              },
              {
                step: "03",
                title: "Collaborate & Track",
                description: "Invite team members and start tracking progress",
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={animationTrigger} timeout={1000 + index * 300}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        mx: "auto",
                        mb: 3,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        {step.step}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Slide direction="up" in={animationTrigger} timeout={1000}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: "text.primary",
                }}
              >
                Customer Testimonials
              </Typography>
            </Slide>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Grow in={animationTrigger} timeout={1200 + index * 200}>
                  <Card
                    sx={{
                      p: 3,
                      height: "100%",
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={1}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            sx={{
                              color: "warning.main",
                              fontSize: 20,
                            }}
                          />
                        ))}
                      </Stack>
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: "italic",
                          lineHeight: 1.6,
                          color: "text.secondary",
                        }}
                      >
                        "{testimonial.quote}"
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "primary.main",
                          }}
                        >
                          {testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {testimonial.role} at {testimonial.company}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: "primary.main",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            <Slide direction="up" in={animationTrigger} timeout={1000}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Ready to Get Started?
              </Typography>
            </Slide>
            <Slide direction="up" in={animationTrigger} timeout={1200}>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: 600,
                }}
              >
                Join teams who have streamlined their requirements management with Requify.
              </Typography>
            </Slide>
            <Slide direction="up" in={animationTrigger} timeout={1400}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() =>
                    user ? navigate("/dashboard") : navigate("/login")
                  }
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 1,
                    backgroundColor: "white",
                    color: "primary.main",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/api-overview")}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 1,
                    borderColor: "white",
                    color: "white",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: alpha("#fff", 0.1),
                    },
                  }}
                >
                  View Documentation
                </Button>
              </Stack>
            </Slide>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Slide direction="up" in={animationTrigger} timeout={1600}>
        <Box sx={{ py: 6, backgroundColor: "grey.900", color: "white" }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Requify
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7, maxWidth: 400 }}
                >
                  Professional requirements management platform for efficient project delivery.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                  <IconButton
                    sx={{
                      color: "white",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: "white",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: "white",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    <GitHub />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4, borderColor: alpha("#fff", 0.1) }} />
            <Typography
              variant="body2"
              sx={{ opacity: 0.5, textAlign: "center" }}
            >
              © 2025 Requify. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Slide>
    </Box>
  );
};

export default StartPage;
