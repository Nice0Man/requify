import React from "react";
import {
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import type { PricingHeaderProps } from "../model/types";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

export const PricingHeader: React.FC<PricingHeaderProps> = ({
  title,
  subtitle,
  highlightText,
}) => {
  const theme = useTheme();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}
    >
      <MotionTypography
        variant="h2"
        sx={{
          fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
          fontWeight: 700,
          color: "text.primary",
          mb: { xs: 2, md: 2.5 },
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
        {highlightText && (
          <>
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
              {highlightText}
            </Box>
          </>
        )}
      </MotionTypography>

      <MotionTypography
        variant="h6"
        sx={{
          color: "text.secondary",
          fontSize: { xs: "1rem", md: "1.125rem" },
          fontWeight: 400,
          maxWidth: "600px",
          mx: "auto",
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </MotionTypography>
    </MotionBox>
  );
}; 