import React from "react";
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Fade,
  Backdrop,
  useTheme 
} from "@mui/material";

export interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "page" | "overlay" | "inline";
  showLogo?: boolean;
  open?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "medium",
  variant = "inline",
  showLogo = false,
  open = true,
}) => {
  const theme = useTheme();

  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return { spinner: 32, logo: 32, fontSize: "0.875rem" };
      case "large":
        return { spinner: 80, logo: 64, fontSize: "1.25rem" };
      default:
        return { spinner: 60, logo: 48, fontSize: "1rem" };
    }
  };

  const sizeConfig = getSizeConfig();

  const SpinnerContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: variant === "inline" ? 1 : 3,
        p: variant === "inline" ? 2 : 4,
        ...(variant !== "inline" && {
          borderRadius: 3,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
        }),
      }}
    >
      {/* Logo/Brand (optional) */}
      {showLogo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: variant === "inline" ? 0 : 2,
          }}
        >
          <Box
            sx={{
              width: sizeConfig.logo,
              height: sizeConfig.logo,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: sizeConfig.fontSize,
              fontWeight: 700,
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1.05)",
                  opacity: 0.8,
                },
              },
            }}
          >
            R
          </Box>
          {size !== "small" && (
            <Typography
              variant={size === "large" ? "h5" : "h6"}
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Requify
            </Typography>
          )}
        </Box>
      )}

      {/* Enhanced Spinner */}
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          size={sizeConfig.spinner}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            animation: "spin 1.5s linear infinite",
            "@keyframes spin": {
              "0%": {
                transform: "rotate(0deg)",
              },
              "100%": {
                transform: "rotate(360deg)",
              },
            },
          }}
        />
        <CircularProgress
          size={sizeConfig.spinner}
          thickness={4}
          variant="determinate"
          value={25}
          sx={{
            color: theme.palette.secondary.main,
            position: "absolute",
            left: 0,
            animation: "spinReverse 2s linear infinite",
            "@keyframes spinReverse": {
              "0%": {
                transform: "rotate(0deg)",
              },
              "100%": {
                transform: "rotate(-360deg)",
              },
            },
          }}
        />
      </Box>

      {/* Loading Message */}
      {message && (
        <Typography
          variant={size === "small" ? "body2" : "body1"}
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            textAlign: "center",
            animation: "fadeInOut 2s ease-in-out infinite",
            "@keyframes fadeInOut": {
              "0%, 100%": {
                opacity: 0.7,
              },
              "50%": {
                opacity: 1,
              },
            },
          }}
        >
          {message}
        </Typography>
      )}

      {/* Loading Dots (only for non-small sizes) */}
      {size !== "small" && (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            "& > div": {
              width: size === "large" ? 10 : 8,
              height: size === "large" ? 10 : 8,
              borderRadius: "50%",
              background: theme.palette.primary.main,
              animation: "bounce 1.4s ease-in-out infinite both",
              "&:nth-of-type(1)": { animationDelay: "-0.32s" },
              "&:nth-of-type(2)": { animationDelay: "-0.16s" },
            },
            "@keyframes bounce": {
              "0%, 80%, 100%": {
                transform: "scale(0)",
              },
              "40%": {
                transform: "scale(1)",
              },
            },
          }}
        >
          <div />
          <div />
          <div />
        </Box>
      )}
    </Box>
  );

  if (variant === "overlay") {
    return (
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
        open={open}
      >
        <SpinnerContent />
      </Backdrop>
    );
  }

  if (variant === "page") {
    return (
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 40%, ${theme.palette.primary.main}08 0%, transparent 50%), 
                          radial-gradient(circle at 70% 70%, ${theme.palette.secondary.main}08 0%, transparent 50%)`,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <SpinnerContent />
          </Box>
        </Box>
      </Fade>
    );
  }

  // Inline variant
  return (
    <Fade in={open} timeout={300}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <SpinnerContent />
      </Box>
    </Fade>
  );
};

// Specialized variants for common use cases
export const PageLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = "Loading page..." 
}) => (
  <LoadingSpinner 
    variant="page" 
    size="large" 
    message={message} 
    showLogo 
  />
);

export const OverlayLoadingSpinner: React.FC<{ 
  message?: string; 
  open?: boolean 
}> = ({ 
  message = "Loading...", 
  open = true 
}) => (
  <LoadingSpinner 
    variant="overlay" 
    size="medium" 
    message={message} 
    open={open} 
  />
);

export const InlineLoadingSpinner: React.FC<{ 
  message?: string; 
  size?: "small" | "medium" | "large" 
}> = ({ 
  message = "Loading...", 
  size = "medium" 
}) => (
  <LoadingSpinner 
    variant="inline" 
    size={size} 
    message={message} 
  />
); 