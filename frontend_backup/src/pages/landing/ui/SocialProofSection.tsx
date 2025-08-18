import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Container, Grid, Avatar, Rating, Chip, IconButton, useTheme } from "@mui/material";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { TrendingUp, Schedule, BugReport, ChevronLeft, ChevronRight, PlayArrow, Pause } from "@mui/icons-material";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const CUSTOMER_STORIES = [
  {
    metric: "85%",
    metricLabel: "faster requirement delivery",
    metricIcon: TrendingUp,
    quote: "Requify transformed our development process completely. We went from chaotic requirements management to a streamlined, collaborative workflow that actually works.",
    author: "Sarah Chen",
    role: "VP of Engineering",
    company: "TechCorp Solutions",
    avatar: "SC",
    rating: 5,
    industry: "SaaS",
  },
  {
    metric: "60%", 
    metricLabel: "reduction in project delays",
    metricIcon: Schedule,
    quote: "The ROI was immediate. Within the first month, we could see dramatic improvements in team alignment and requirement clarity. Game changer for our organization.",
    author: "Michael Rodriguez",
    role: "CTO",
    company: "InnovateLabs Inc.",
    avatar: "MR",
    rating: 5,
    industry: "FinTech",
  },
  {
    metric: "75%",
    metricLabel: "fewer production bugs",
    metricIcon: BugReport,
    quote: "Finally, a tool that actually delivers on its promises. Our stakeholders are now aligned, requirements are crystal clear, and our development velocity has doubled.",
    author: "Emma Thompson", 
    role: "Product Manager",
    company: "GlobalTech Systems",
    avatar: "ET",
    rating: 5,
    industry: "Enterprise",
  },
  {
    metric: "92%",
    metricLabel: "team satisfaction increase",
    metricIcon: TrendingUp,
    quote: "Our team loves the intuitive interface and powerful collaboration features. It's rare to find a tool that both developers and business stakeholders actually enjoy using.",
    author: "David Kim",
    role: "Senior Developer",
    company: "StartupHub Inc.",
    avatar: "DK",
    rating: 5,
    industry: "Startup",
  },
  {
    metric: "45%",
    metricLabel: "faster onboarding for new devs",
    metricIcon: Schedule,
    quote: "New team members can understand our requirements and get up to speed in days, not weeks. The documentation and traceability features are outstanding.",
    author: "Lisa Wagner",
    role: "Engineering Manager",
    company: "ScaleWorks Ltd.",
    avatar: "LW",
    rating: 5,
    industry: "B2B SaaS",
  },
];

const SUCCESS_METRICS = [
  {
    value: "20,000+",
    label: "active teams",
    description: "trusted worldwide",
  },
  {
    value: "3.2M+",
    label: "requirements managed",
    description: "growing 150% annually",
  },
  {
    value: "99.9%",
    label: "uptime SLA",
    description: "enterprise reliability",
  },
];

export const SocialProofSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Создаем autoplay plugin с управлением состоянием
  const autoplay = useCallback(() => {
    return Autoplay({ 
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: isPlaying,
    });
  }, [isPlaying]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      containScroll: 'trimSnaps',
    },
    [autoplay()]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    const autoplayPlugin = emblaApi?.plugins()?.autoplay;
    if (!autoplayPlugin) return;

    const shouldPlay = !isPlaying;
    setIsPlaying(shouldPlay);
    
    if (shouldPlay) {
      autoplayPlugin.play();
    } else {
      autoplayPlugin.stop();
    }
  }, [emblaApi, isPlaying]);

  // Отслеживание текущего слайда
  const onSelect = useCallback((emblaApi: any) => {
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main}08 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main}08 0%, transparent 50%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {t("landing.proof.title", "Join 20,000+ teams")}
            <br />
            <Box component="span" sx={{ color: "primary.main" }}>
              {t("landing.proof.titleHighlight", "delivering better software")}
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.9rem", md: "1.1rem" },
              fontWeight: 400,
              maxWidth: "600px",
              mx: "auto",
              mb: 3,
            }}
          >
            {t("landing.proof.subtitle", "Real results from real teams who transformed their development process")}
          </Typography>
        </Box>

        {/* Success Metrics */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 3, md: 6 },
            flexWrap: "wrap",
            mb: 5,
            p: 3,
            backgroundColor: "background.paper",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 20px -8px rgba(0,0,0,0.1)",
          }}
        >
          {SUCCESS_METRICS.map((metric, index) => (
            <Box key={index} textAlign="center">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  color: "primary.main",
                  mb: 0.5,
                }}
              >
                {metric.value}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 0.25,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              >
                {metric.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.75rem", md: "0.8rem" },
                }}
              >
                {metric.description}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Testimonial Slider */}
        <Box sx={{ position: "relative", mb: 4 }}>
          {/* Slider Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <IconButton
              onClick={scrollPrev}
              sx={{
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  backgroundColor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={toggleAutoplay}
              sx={{
                backgroundColor: isPlaying ? "primary.light" : "background.paper",
                border: "1px solid",
                borderColor: isPlaying ? "primary.main" : "divider",
                color: isPlaying ? "primary.main" : "text.secondary",
                "&:hover": {
                  backgroundColor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton
              onClick={scrollNext}
              sx={{
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  backgroundColor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Embla Carousel */}
          <Box className="embla" sx={{ overflow: "hidden" }} ref={emblaRef}>
            <Box 
              className="embla__container" 
              sx={{ 
                display: "flex",
                gap: 2,
              }}
            >
              {CUSTOMER_STORIES.map((story, index) => {
                const MetricIcon = story.metricIcon;
                return (
                  <Box
                    key={index}
                    className="embla__slide"
                    sx={{
                      flex: "0 0 100%",
                      minWidth: 0,
                      maxWidth: "600px",
                      mx: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "background.paper",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        p: 4,
                        position: "relative",
                        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.1)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          boxShadow: "0 12px 40px -8px rgba(99, 102, 241, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {/* Industry Tag */}
                      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                        <Chip
                          label={story.industry}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: "0.7rem",
                            fontWeight: 500,
                          }}
                        />
                      </Box>

                      {/* Metric with icon */}
                      <Box 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          gap: 2, 
                          mb: 3,
                          p: 2,
                          backgroundColor: "primary.light",
                          borderRadius: 2,
                        }}
                      >
                        <MetricIcon sx={{ color: "primary.main", fontSize: 28 }} />
                        <Box textAlign="center">
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: "1.8rem", md: "2.2rem" },
                              color: "primary.main",
                              lineHeight: 1,
                              mb: 0.5,
                            }}
                          >
                            {story.metric}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 500,
                              fontSize: { xs: "0.8rem", md: "0.9rem" },
                            }}
                          >
                            {story.metricLabel}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Rating */}
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                        <Rating
                          value={story.rating}
                          readOnly
                          size="medium"
                          sx={{ 
                            "& .MuiRating-iconFilled": {
                              color: "warning.main",
                            },
                          }}
                        />
                      </Box>

                      {/* Quote */}
                      <Typography
                        variant="h6"
                        sx={{
                          color: "text.primary",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          textAlign: "center",
                          mb: 3,
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          fontWeight: 400,
                          position: "relative",
                          "&::before": {
                            content: '"""',
                            position: "absolute",
                            left: -16,
                            top: -8,
                            fontSize: "3rem",
                            color: "primary.main",
                            opacity: 0.3,
                          },
                          "&::after": {
                            content: '"""',
                            position: "absolute",
                            right: -16,
                            bottom: -24,
                            fontSize: "3rem",
                            color: "primary.main",
                            opacity: 0.3,
                          },
                        }}
                      >
                        {story.quote}
                      </Typography>

                      {/* Author */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundColor: "primary.main",
                            fontSize: "1rem",
                            fontWeight: 700,
                          }}
                        >
                          {story.avatar}
                        </Avatar>
                        <Box textAlign="center">
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              mb: 0.25,
                              fontSize: { xs: "0.95rem", md: "1rem" },
                            }}
                          >
                            {story.author}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.8rem", md: "0.85rem" },
                              mb: 0.25,
                            }}
                          >
                            {story.role}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "primary.main",
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", md: "0.85rem" },
                            }}
                          >
                            {story.company}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Slide Indicators */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 3,
            }}
          >
            {CUSTOMER_STORIES.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: currentSlide === index ? "primary.main" : "divider",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: currentSlide === index ? "primary.dark" : "text.secondary",
                    transform: "scale(1.1)",
                  },
                }}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}; 