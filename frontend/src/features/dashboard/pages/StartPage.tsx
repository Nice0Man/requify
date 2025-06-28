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
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/context/auth.context";

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const features = [
    {
      title: "Smart Requirements Management",
      description:
        "Organize, track, and manage requirements with intelligent categorization and automated workflows that adapt to your team's needs.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Team collaboration
      icon: <Assignment />,
      color: theme.palette.primary.main,
    },
    {
      title: "Advanced Testing Framework",
      description:
        "Comprehensive testing suite with automated test generation, real-time execution monitoring, and detailed reporting capabilities.",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Software testing
      icon: <Analytics />,
      color: theme.palette.success.main,
    },
    {
      title: "Real-time Collaboration",
      description:
        "Enable seamless team collaboration with live updates, commenting system, and role-based access control for enterprise security.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Team meeting
      icon: <Groups />,
      color: theme.palette.info.main,
    },
    {
      title: "Enterprise Security",
      description:
        "Bank-grade security with OAuth2 authentication, audit trails, and compliance-ready data protection for enterprise environments.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Security/lock
      icon: <Security />,
      color: theme.palette.warning.main,
    },
    {
      title: "Automated Workflows",
      description:
        "Streamline your processes with intelligent automation, custom triggers, and seamless integrations with your existing tools.",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Automation/gears
      icon: <Speed />,
      color: theme.palette.secondary.main,
    },
    {
      title: "Cloud-First Architecture",
      description:
        "Scalable cloud infrastructure with 99.9% uptime, automatic backups, and global CDN for lightning-fast performance worldwide.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Cloud/space
      icon: <CloudDone />,
      color: theme.palette.error.main,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp Inc.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      quote: "Requify transformed our requirements management process. We've reduced project delivery time by 40% and improved team collaboration significantly.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Software Architect",
      company: "Innovation Labs",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      quote: "The testing framework is incredibly powerful. Automated test generation saved us hundreds of hours and caught critical issues early.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "QA Director",
      company: "DevSolutions",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      quote: "Best requirements management tool we've used. The real-time collaboration features are game-changing for distributed teams.",
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
    <Box sx={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Requify
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                onClick={() => navigate("/api-overview")}
                sx={{ borderRadius: 2 }}
              >
                API Docs
              </Button>
              {user ? (
                <Button
                  variant="contained"
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate("/login")}
                    sx={{ borderRadius: 2 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/login")}
                    sx={{
                      borderRadius: 2,
                      background: "linear-gradient(45deg, #1976d2, #42a5f5)",
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

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1,
            zIndex: 0,
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Chip
                  label="🚀 Now with AI-Powered Insights"
                  sx={{
                    backgroundColor: alpha("#fff", 0.2),
                    color: "white",
                    alignSelf: "flex-start",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    lineHeight: 1.2,
                  }}
                >
                  Transform Your{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(45deg, #ffeb3b, #ff9800)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Requirements
                  </Box>{" "}
                  Management
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    opacity: 0.9,
                    fontWeight: 300,
                    maxWidth: 500,
                    lineHeight: 1.6,
                  }}
                >
                  Streamline your development lifecycle with intelligent
                  requirements tracking, automated testing, and seamless team
                  collaboration.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => (user ? navigate("/dashboard") : navigate("/login"))}
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      backgroundColor: "white",
                      color: "primary.main",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      "&:hover": {
                        backgroundColor: alpha("#fff", 0.9),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      borderColor: "white",
                      color: "white",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: alpha("#fff", 0.1),
                      },
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Dashboard Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: alpha("#fff", 0.9),
                    borderRadius: "50%",
                    p: 2,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "white",
                      transform: "translate(-50%, -50%) scale(1.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <PlayArrow sx={{ fontSize: 48, color: "primary.main" }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: "grey.50" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: "primary.main",
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip
              label="✨ Powerful Features"
              sx={{
                mb: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: "text.primary",
              }}
            >
              Everything You Need to{" "}
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                }}
              >
                Succeed
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto", fontWeight: 300 }}
            >
              Comprehensive tools designed to streamline your requirements
              management process and accelerate project delivery.
            </Typography>
          </Box>
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    borderRadius: 4,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url("${feature.image}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha(
                          feature.color,
                          0.8
                        )}, ${alpha(feature.color, 0.6)})`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        backgroundColor: "white",
                        borderRadius: 2,
                        p: 1,
                        color: feature.color,
                        zIndex: 1,
                      }}
                    >
                      {feature.icon}
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: "text.primary",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: "text.primary",
              }}
            >
              Get Started in{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                Minutes
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto", fontWeight: 300 }}
            >
              Simple setup process that gets your team productive immediately
            </Typography>
          </Box>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                step: "01",
                title: "Create Your Project",
                description: "Set up your project workspace in under 2 minutes",
                image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                step: "02",
                title: "Import Requirements",
                description: "Upload existing documents or create from scratch",
                image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                step: "03",
                title: "Collaborate & Track",
                description: "Invite your team and start tracking progress",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      mx: "auto",
                      mb: 3,
                      backgroundImage: `url("${step.image}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: alpha(theme.palette.primary.main, 0.8),
                        borderRadius: "50%",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        fontWeight: 800,
                        zIndex: 1,
                      }}
                    >
                      {step.step}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: "text.primary",
              }}
            >
              Loved by{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                Teams Worldwide
              </Box>
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    p: 3,
                    height: "100%",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    borderRadius: 4,
                  }}
                >
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={1}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          sx={{ color: "#ffc107", fontSize: 20 }}
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: "italic",
                        lineHeight: 1.7,
                        color: "text.secondary",
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={testimonial.image}
                        sx={{ width: 48, height: 48 }}
                      />
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
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              Ready to Transform Your Workflow?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                fontWeight: 300,
                maxWidth: 600,
              }}
            >
              Join thousands of teams who have streamlined their requirements
              management with Requify. Start your free trial today.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                endIcon={<Rocket />}
                onClick={() => (user ? navigate("/dashboard") : navigate("/login"))}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  backgroundColor: "white",
                  color: "primary.main",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: alpha("#fff", 0.9),
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/api-overview")}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  borderColor: "white",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: alpha("#fff", 0.1),
                  },
                }}
              >
                View Documentation
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: "grey.900", color: "white" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: "linear-gradient(45deg, #42a5f5, #66bb6a)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Requify
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 400 }}>
                The next-generation requirements management platform that helps
                teams build better software faster.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <IconButton sx={{ color: "white" }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                  <LinkedIn />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
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
    </Box>
  );
};

export default StartPage;
