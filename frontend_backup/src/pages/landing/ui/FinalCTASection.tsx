import React from "react";
import { Box, Typography, Container, Button, Stack } from "@mui/material";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useTheme } from "@mui/material/styles";

export const FinalCTASection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}00 0%, 
            ${theme.palette.primary.dark}20 100%)`,
          zIndex: 0,
        }}
      />
      
      {/* Animated background elements */}
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          left: "15%",
          width: 80,
          height: 80,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "60%",
          right: "20%",
          width: 60,
          height: 60,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />
      
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, py: 3 }}>
        <Box textAlign="center">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              color: "white",
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            {t("landing.finalCta.title", "Ready to transform your")}
            <br />
            <Box 
              component="span" 
              sx={{ 
                background: "linear-gradient(45deg, #FFD700, #FFA500)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("landing.finalCta.highlight", "requirements process?")}
            </Box>
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 400,
              maxWidth: "600px",
              mx: "auto",
              mb: 4,
              lineHeight: 1.4,
            }}
          >
            {t("landing.finalCta.subtitle", "Join thousands of teams already using Requify to deliver better software faster.")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mb={3}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: "white",
                color: "primary.main",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  backgroundColor: "grey.100",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {t("landing.finalCta.getStarted", "Start your free trial")}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 600,
                borderRadius: 2,
                borderColor: "rgba(255, 255, 255, 0.5)",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {t("landing.finalCta.getDemo", "Book a demo")}
            </Button>
          </Stack>

          {/* Trust indicators */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: { xs: 2, md: 4 },
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Box textAlign="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: { xs: "0.75rem", md: "0.8rem" },
                  mb: 0.5,
                }}
              >
                ✓ No credit card required
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: { xs: "0.75rem", md: "0.8rem" },
                  mb: 0.5,
                }}
              >
                ✓ 14-day free trial
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: { xs: "0.75rem", md: "0.8rem" },
                  mb: 0.5,
                }}
              >
                ✓ Cancel anytime
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: { xs: "0.75rem", md: "0.8rem" },
              display: "block",
            }}
          >
            {t("landing.finalCta.support", "Questions? Contact our sales team for a personalized demo")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}; 