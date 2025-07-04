import React from "react";
import { Box, CircularProgress, Typography, Skeleton } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number | string;
  message?: string;
  variant?: "spinner" | "skeleton" | "inline";
  skeletonHeight?: number;
  skeletonCount?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  variant = "spinner",
  skeletonHeight = 60,
  skeletonCount = 3,
}) => {
  if (variant === "skeleton") {
    return (
      <Box>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={skeletonHeight}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (variant === "inline") {
    return (
      <Box display="inline-flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        {message && (
          <Typography variant="body2" style={{ marginLeft: 8 }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      padding={2}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ marginTop: 16 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};
