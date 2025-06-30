import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Container,
  Stack,
  Paper,
  Divider,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
  Link,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Assignment,
  Security,
  Analytics,
  Groups,
  CloudDone,
  AutoAwesome,
  ArrowForward,
  PlayArrow,
  Star,
  GitHub,
  LinkedIn,
  Twitter,
  Close,
  Email,
  Phone,
  CalendarToday,
  Person,
  VisibilityOff,
  Visibility,
  Lock,
  Dashboard,
  Logout,
  AccountCircle,
  ExpandMore,
} from "@mui/icons-material";
import { useAuth } from "../../auth/context/auth.context";
import { LoginRequest, UserCreate } from "../../auth/types/auth.types";

// Import assets
import illustrationImage from "@/assets/img/pannel/komp-uternaa-illustracia-3d-grafika.jpg";

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, register, logout, isLoading, error, clearError, isAuthenticated, user } =
    useAuth();

  const [animationTrigger, setAnimationTrigger] = React.useState(false);
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = React.useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

  // Demo request form state
  const [demoRequest, setDemoRequest] = React.useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  // Schedule demo form state
  const [scheduleRequest, setScheduleRequest] = React.useState({
    name: "",
    email: "",
    company: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  // Sign in form state
  const [signInData, setSignInData] = React.useState<LoginRequest>({
    username: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = React.useState<UserCreate>({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimationTrigger(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Allow authenticated users to view the StartPage
  // Removed automatic redirect to dashboard

  // Clear auth errors when dialogs close
  React.useEffect(() => {
    if (!signInDialogOpen && !registerDialogOpen) {
      clearError();
      setFormErrors({});
    }
  }, [signInDialogOpen, registerDialogOpen, clearError]);

  const features = [
    {
      title: "Requirements Management",
      description:
        "Organize and track your project requirements with precision and clarity.",
      icon: <Assignment />,
      color: theme.palette.primary.main,
      link: "/requirements",
    },
    {
      title: "Advanced Analytics",
      description:
        "Gain insights with powerful analytics and reporting capabilities.",
      icon: <Analytics />,
      color: theme.palette.success.main,
      link: "/reports",
    },
    {
      title: "Team Collaboration",
      description: "Seamless collaboration tools for distributed teams.",
      icon: <Groups />,
      color: theme.palette.info.main,
      link: "/projects",
    },
    {
      title: "Enterprise Security",
      description:
        "Bank-grade security with advanced encryption and compliance.",
      icon: <Security />,
      color: theme.palette.error.main,
      link: "/settings",
    },
    {
      title: "Cloud Infrastructure",
      description: "Scalable cloud solution with 99.9% uptime guarantee.",
      icon: <CloudDone />,
      color: theme.palette.warning.main,
      link: "/dashboard",
    },
    {
      title: "Smart Automation",
      description: "AI-powered automation to streamline your workflow.",
      icon: <AutoAwesome />,
      color: theme.palette.secondary.main,
      link: "/releases",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      testimonial:
        "Requify transformed our requirement management process. The intuitive interface and powerful features helped us deliver projects 40% faster.",
      rating: 5,
      avatar: "SC",
      linkedIn: "https://linkedin.com/in/sarahchen",
    },
    {
      name: "Michael Rodriguez",
      role: "Engineering Lead",
      company: "DevStart",
      testimonial:
        "The best requirements management tool we've used. Clean, powerful, and reliable. Our team productivity increased significantly.",
      rating: 5,
      avatar: "MR",
      linkedIn: "https://linkedin.com/in/michaelrodriguez",
    },
    {
      name: "Emily Johnson",
      role: "Project Director",
      company: "InnovateLabs",
      testimonial:
        "Exceptional platform with outstanding support. Requify helped us scale our operations while maintaining quality standards.",
      rating: 5,
      avatar: "EJ",
      linkedIn: "https://linkedin.com/in/emilyjohnson",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", sublabel: "Guaranteed" },
    { value: "500+", label: "Companies", sublabel: "Trust us" },
    { value: "50K+", label: "Requirements", sublabel: "Managed daily" },
    { value: "24/7", label: "Support", sublabel: "Always here" },
  ];

  // Handler functions
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setRegisterDialogOpen(true);
    }
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setSignInDialogOpen(true);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    setSnackbarMessage("You have been logged out successfully");
    setSnackbarOpen(true);
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    handleUserMenuClose();
  };

  // Validation functions
  const validateSignInForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!signInData.username.trim()) {
      errors.username = "Username or email is required";
    }

    if (!signInData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!registerData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!registerData.username.trim()) {
      errors.username = "Username is required";
    } else if (registerData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!registerData.password) {
      errors.password = "Password is required";
    } else if (registerData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!registerData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    if (!registerData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Authentication handlers
  const handleSignInSubmit = async () => {
    if (!validateSignInForm()) return;

    try {
      await login(signInData);
      setSignInDialogOpen(false);
      setSignInData({ username: "", password: "" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!validateRegisterForm()) return;

    try {
      await register(registerData);
      setRegisterDialogOpen(false);
      setRegisterData({
        email: "",
        username: "",
        password: "",
        first_name: "",
        last_name: "",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleWatchDemo = () => {
    setDemoDialogOpen(true);
  };

  const handleScheduleDemo = () => {
    setScheduleDialogOpen(true);
  };

  const handleFeatureClick = (link: string) => {
    if (isAuthenticated) {
      navigate(link);
    } else {
      setSnackbarMessage("Please sign in to access this feature");
      setSnackbarOpen(true);
    }
  };

  const handleSocialClick = (platform: string) => {
    const urls = {
      twitter: "https://twitter.com/requify_app",
      linkedin: "https://linkedin.com/company/requify",
      github: "https://github.com/requify/requify",
    };
    window.open(
      urls[platform as keyof typeof urls],
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDemoRequest = async () => {
    // Simulate API call
    console.log("Demo request:", demoRequest);
    setSnackbarMessage("Demo request submitted! We'll contact you soon.");
    setSnackbarOpen(true);
    setDemoDialogOpen(false);
    setDemoRequest({ name: "", email: "", company: "", message: "" });
  };

  const handleScheduleRequest = async () => {
    // Simulate API call
    console.log("Schedule request:", scheduleRequest);
    setSnackbarMessage(
      "Demo scheduled! You'll receive a confirmation email shortly."
    );
    setSnackbarOpen(true);
    setScheduleDialogOpen(false);
    setScheduleRequest({
      name: "",
      email: "",
      company: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
    });
  };

  const handleTestimonialLinkedIn = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* Navigation */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
          backgroundColor: alpha("#ffffff", 0.95),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 2, height: 64 }}
            >
              <Typography
                variant="h5"
                sx={{
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                  cursor: "pointer",
                }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Requify
              </Typography>
            
            {/* Navigation Buttons */}
            {!isAuthenticated ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="text"
                  onClick={handleSignIn}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  Sign In
                </Button>
                  <Button
                    variant="contained"
                  onClick={handleGetStarted}
                    sx={{
                    borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                    px: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Get Started
                  </Button>
              </Stack>
                ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                  variant="outlined"
                  startIcon={<Dashboard />}
                  onClick={handleDashboard}
                      sx={{
                    borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                    px: 2,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  Dashboard
                    </Button>
                    <Button
                  variant="text"
                  endIcon={<ExpandMore />}
                  onClick={handleUserMenuOpen}
                      sx={{
                    color: "text.primary",
                        fontWeight: 500,
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccountCircle />
                    <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                      {user?.first_name || user?.username || "User"}
                    </Typography>
                  </Stack>
                    </Button>
                
                {/* User Menu */}
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  sx={{
                    mt: 1,
                    "& .MuiPaper-root": {
                      borderRadius: 2,
                      minWidth: 180,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <MenuItem onClick={handleDashboard} sx={{ py: 1.5 }}>
                    <Dashboard sx={{ mr: 2 }} fontSize="small" />
                    Dashboard
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
                    <Logout sx={{ mr: 2 }} fontSize="small" />
                    Sign Out
                  </MenuItem>
                </Menu>
              </Stack>
                )}
              </Stack>
          </Container>
        </Box>

      {/* Hero Section */}
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 8, md: 12 } }}
      >
          <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
              <Fade in={animationTrigger} timeout={800}>
                  <Chip
                    label="Requirements Management Platform"
                    sx={{
                    alignSelf: "flex-start",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      fontWeight: 500,
                    borderRadius: 3,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    }}
                  />
                </Fade>

              <Slide direction="up" in={animationTrigger} timeout={1000}>
                  <Typography
                  variant="h1"
                    sx={{
                    fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                      fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                      color: "text.primary",
                    mb: 2,
                    }}
                  >
                  Build Better
                  <br />
                    <Box
                      component="span"
                      sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      }}
                    >
                      Requirements
                  </Box>
                  </Typography>
                </Slide>

              <Slide direction="up" in={animationTrigger} timeout={1200}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 400,
                      lineHeight: 1.6,
                    maxWidth: 500,
                    }}
                  >
                  The modern requirements management platform that helps teams
                  build better products faster with intelligent automation and
                  seamless collaboration.
                  </Typography>
                </Slide>

              <Slide direction="up" in={animationTrigger} timeout={1400}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                    onClick={handleGetStarted}
                      sx={{
                        py: 1.5,
                      px: 4,
                      borderRadius: 3,
                        textTransform: "none",
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                    startIcon={<PlayArrow />}
                    onClick={handleWatchDemo}
                      sx={{
                        py: 1.5,
                      px: 4,
                      borderRadius: 3,
                        textTransform: "none",
                      fontWeight: 500,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    Watch Demo
                    </Button>
                  </Stack>
                </Slide>
              </Stack>
            </Grid>

          {/* Right Content - Hero Image */}
            <Grid item xs={12} md={6}>
            <Zoom in={animationTrigger} timeout={1600}>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Background accent */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 200,
                    height: 200,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    borderRadius: "50%",
                    filter: "blur(40px)",
                    zIndex: -1,
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    backgroundColor: "white",
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    maxWidth: 600,
                    cursor: "pointer",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                  onClick={handleWatchDemo}
                >
                  <Box
                    component="img"
                    src={illustrationImage}
                    alt="Requify Platform"
                    sx={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 2,
                    }}
                  />
                </Paper>
              </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>

      {/* Stats Section */}
      <Box
        sx={{
          backgroundColor: "white",
          py: 6,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Fade in={animationTrigger} timeout={1000 + index * 200}>
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      fontWeight={600}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize="0.875rem"
                    >
                      {stat.sublabel}
                    </Typography>
                  </Stack>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" spacing={6}>
          <Slide direction="up" in={animationTrigger} timeout={1000}>
            <Stack alignItems="center" spacing={2}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  textAlign: "center",
                  color: "text.primary",
                }}
              >
                Everything you need to manage requirements
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                textAlign="center"
                sx={{ maxWidth: 600, fontWeight: 400 }}
              >
                Powerful features designed to streamline your workflow and boost
                productivity
              </Typography>
            </Stack>
            </Slide>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in={animationTrigger} timeout={1200 + index * 150}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: "white",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                        borderColor: alpha(feature.color, 0.3),
                      },
                    }}
                    onClick={() => handleFeatureClick(feature.link)}
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
                        <Typography
                          variant="h6"
                        fontWeight={600}
                        color="text.primary"
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        lineHeight={1.6}
                        >
                          {feature.description}
                        </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForward fontSize="small" />}
                        sx={{
                          alignSelf: "flex-start",
                          textTransform: "none",
                          fontWeight: 500,
                          color: feature.color,
                          "&:hover": {
                            backgroundColor: alpha(feature.color, 0.05),
                          },
                        }}
                      >
                        Learn More
                      </Button>
                      </Stack>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Stack>
        </Container>

      {/* Testimonials Section */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.grey[50], 0.5),
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={6}>
            <Slide direction="up" in={animationTrigger} timeout={1000}>
              <Stack alignItems="center" spacing={2}>
              <Typography
                  variant="h2"
                sx={{
                    fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                    textAlign: "center",
                  color: "text.primary",
                }}
              >
                  Loved by teams worldwide
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                  textAlign="center"
                  sx={{ maxWidth: 600, fontWeight: 400 }}
              >
                  See how Requify is transforming the way teams manage
                  requirements
              </Typography>
              </Stack>
            </Slide>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                  <Fade in={animationTrigger} timeout={1200 + index * 200}>
                  <Card
                      elevation={0}
                    sx={{
                        p: 4,
                      height: "100%",
                        borderRadius: 3,
                        backgroundColor: "white",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1
                        )}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                        },
                    }}
                  >
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={0.5}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                              sx={{ color: "warning.main", fontSize: 18 }}
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
                          "{testimonial.testimonial}"
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "primary.main",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              cursor: "pointer",
                          }}
                            onClick={() =>
                              handleTestimonialLinkedIn(testimonial.linkedIn)
                            }
                        >
                            {testimonial.avatar}
                        </Avatar>
                          <Stack spacing={0} flex={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {testimonial.name}
                          </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                            {testimonial.role} at {testimonial.company}
                          </Typography>
                          </Stack>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleTestimonialLinkedIn(testimonial.linkedIn)
                            }
                            sx={{
                              color: "text.secondary",
                              "&:hover": { color: "#0A66C2" },
                            }}
                          >
                            <LinkedIn fontSize="small" />
                          </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                  </Fade>
              </Grid>
            ))}
          </Grid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <Container
          maxWidth="md"
          sx={{ position: "relative", textAlign: "center" }}
        >
          <Stack spacing={4} alignItems="center">
            <Slide direction="up" in={animationTrigger} timeout={1000}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Ready to transform your workflow?
              </Typography>
            </Slide>
            <Slide direction="up" in={animationTrigger} timeout={1200}>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: 500,
                  lineHeight: 1.6,
                }}
              >
                Join thousands of teams who have streamlined their requirements
                management with Requify. Start your free trial today.
              </Typography>
            </Slide>
            <Slide direction="up" in={animationTrigger} timeout={1400}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={handleGetStarted}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    backgroundColor: "white",
                    color: "primary.main",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: alpha("#fff", 0.9),
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CalendarToday />}
                  onClick={handleScheduleDemo}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    borderColor: alpha("#fff", 0.3),
                    color: "white",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: alpha("#fff", 0.1),
                    },
                  }}
                >
                  Schedule Demo
                </Button>
              </Stack>
            </Slide>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "white",
          py: 6,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Requify
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 400, lineHeight: 1.6 }}
                >
                  The modern requirements management platform that helps teams
                  build better products faster.
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    support@requify.com
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    +1 (555) 123-4567
                  </Typography>
                </Stack>
              </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                  <IconButton
                  onClick={() => handleSocialClick("twitter")}
                    sx={{
                    color: "text.secondary",
                    "&:hover": { color: "#1DA1F2" },
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                  onClick={() => handleSocialClick("linkedin")}
                    sx={{
                    color: "text.secondary",
                    "&:hover": { color: "#0A66C2" },
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                  <IconButton
                  onClick={() => handleSocialClick("github")}
                    sx={{
                    color: "text.secondary",
                    "&:hover": { color: "#333" },
                    }}
                  >
                    <GitHub />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          <Divider
            sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.1) }}
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ opacity: 0.7 }}
            >
              © 2025 Requify. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                onClick={() =>
                  setSnackbarMessage("Privacy Policy - Coming Soon")
                }
              >
                Privacy Policy
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                onClick={() =>
                  setSnackbarMessage("Terms of Service - Coming Soon")
                }
              >
                Terms of Service
              </Typography>
            </Stack>
          </Stack>
          </Container>
        </Box>

      {/* Watch Demo Dialog */}
      <Dialog
        open={demoDialogOpen}
        onClose={() => setDemoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Request Demo Access
            </Typography>
            <IconButton onClick={() => setDemoDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Get instant access to our interactive demo and see how Requify can
              transform your requirements management process.
            </Typography>
            <TextField
              label="Full Name"
              value={demoRequest.name}
              onChange={(e) =>
                setDemoRequest({ ...demoRequest, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={demoRequest.email}
              onChange={(e) =>
                setDemoRequest({ ...demoRequest, email: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Company"
              value={demoRequest.company}
              onChange={(e) =>
                setDemoRequest({ ...demoRequest, company: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Message (Optional)"
              multiline
              rows={3}
              value={demoRequest.message}
              onChange={(e) =>
                setDemoRequest({ ...demoRequest, message: e.target.value })
              }
              fullWidth
              placeholder="Tell us about your requirements management challenges..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setDemoDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDemoRequest}
            variant="contained"
            disabled={!demoRequest.name || !demoRequest.email}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Get Demo Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Demo Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Schedule Live Demo
            </Typography>
            <IconButton
              onClick={() => setScheduleDialogOpen(false)}
              size="small"
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Book a personalized demo with our team to explore how Requify can
              meet your specific needs.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  value={scheduleRequest.name}
                  onChange={(e) =>
                    setScheduleRequest({
                      ...scheduleRequest,
                      name: e.target.value,
                    })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={scheduleRequest.email}
                  onChange={(e) =>
                    setScheduleRequest({
                      ...scheduleRequest,
                      email: e.target.value,
                    })
                  }
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <TextField
              label="Company"
              value={scheduleRequest.company}
              onChange={(e) =>
                setScheduleRequest({
                  ...scheduleRequest,
                  company: e.target.value,
                })
              }
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Date"
                  type="date"
                  value={scheduleRequest.preferredDate}
                  onChange={(e) =>
                    setScheduleRequest({
                      ...scheduleRequest,
                      preferredDate: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Time"
                  type="time"
                  value={scheduleRequest.preferredTime}
                  onChange={(e) =>
                    setScheduleRequest({
                      ...scheduleRequest,
                      preferredTime: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              value={scheduleRequest.message}
              onChange={(e) =>
                setScheduleRequest({
                  ...scheduleRequest,
                  message: e.target.value,
                })
              }
              fullWidth
              placeholder="Specific features you'd like to see, team size, etc..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setScheduleDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleScheduleRequest}
            variant="contained"
            disabled={!scheduleRequest.name || !scheduleRequest.email}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Schedule Demo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sign In Dialog */}
      <Dialog
        open={signInDialogOpen}
        onClose={() => setSignInDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Sign In to Requify
            </Typography>
            <IconButton onClick={() => setSignInDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Please sign in to continue.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error.error_description}
              </Alert>
            )}

            <TextField
              label="Username or Email"
              value={signInData.username}
              onChange={(e) =>
                setSignInData({ ...signInData, username: e.target.value })
              }
              error={!!formErrors.username}
              helperText={formErrors.username}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={signInData.password}
              onChange={(e) =>
                setSignInData({ ...signInData, password: e.target.value })
              }
              error={!!formErrors.password}
              helperText={formErrors.password}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setSignInDialogOpen(false);
                  setSnackbarMessage(
                    "Password reset functionality coming soon"
                  );
                  setSnackbarOpen(true);
                }}
                sx={{ textDecoration: "none" }}
              >
                Forgot password?
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setSignInDialogOpen(false);
                  setRegisterDialogOpen(true);
                }}
                sx={{ textDecoration: "none" }}
              >
                Don't have an account? Sign up
              </Link>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setSignInDialogOpen(false)}
            color="inherit"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSignInSubmit}
            variant="contained"
            disabled={isLoading || !signInData.username || !signInData.password}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              minWidth: 120,
            }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Create Your Account
            </Typography>
            <IconButton
              onClick={() => setRegisterDialogOpen(false)}
              size="small"
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Join thousands of teams who trust Requify for their requirements
              management.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error.error_description}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={registerData.first_name}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      first_name: e.target.value,
                    })
                  }
                  error={!!formErrors.first_name}
                  helperText={formErrors.first_name}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={registerData.last_name}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      last_name: e.target.value,
                    })
                  }
                  error={!!formErrors.last_name}
                  helperText={formErrors.last_name}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <TextField
              label="Email Address"
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Username"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData({ ...registerData, username: e.target.value })
              }
              error={!!formErrors.username}
              helperText={formErrors.username}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              error={!!formErrors.password}
              helperText={formErrors.password || "Minimum 8 characters"}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack alignItems="center">
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setRegisterDialogOpen(false);
                  setSignInDialogOpen(true);
                }}
                sx={{ textDecoration: "none" }}
              >
                Already have an account? Sign in
              </Link>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setRegisterDialogOpen(false)}
            color="inherit"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegisterSubmit}
            variant="contained"
            disabled={
              isLoading ||
              !registerData.email ||
              !registerData.username ||
              !registerData.password ||
              !registerData.first_name ||
              !registerData.last_name
            }
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              minWidth: 120,
            }}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StartPage;
