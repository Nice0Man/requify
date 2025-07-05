import React from "react";
import { Box, BoxProps, CircularProgress, Typography } from "@mui/material";
import { useResponsiveImage } from "../hooks/useResponsiveImage";

interface ResponsiveImageProps extends Omit<BoxProps, "component" | "onError"> {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  lazy?: boolean;
  placeholder?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  sizes?: string;
  srcSet?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  borderRadius?: number | string;
  showLoadingSpinner?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = "100%",
  height = "auto",
  aspectRatio,
  lazy = true,
  placeholder,
  errorFallback,
  onLoad,
  onError,
  sizes,
  srcSet,
  objectFit = "cover",
  objectPosition = "center",
  borderRadius = 0,
  showLoadingSpinner = true,
  sx,
  ...boxProps
}) => {
  const { imgRef, isLoaded, hasError } = useResponsiveImage({
    src,
    alt,
    lazy,
    onLoad,
    onError,
  });

  const containerSx = {
    position: "relative" as const,
    width,
    height,
    ...(aspectRatio && { aspectRatio }),
    borderRadius,
    overflow: "hidden" as const,
    backgroundColor: "#f5f5f5",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...sx,
  };

  const imageSx = {
    width: "100%",
    height: "100%",
    objectFit,
    objectPosition,
    transition: "opacity 0.3s ease-in-out",
    opacity: isLoaded ? 1 : 0,
  };

  if (hasError) {
    return (
      <Box sx={containerSx} {...boxProps}>
        {errorFallback || (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", p: 2 }}
          >
            Failed to load image
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={containerSx} {...boxProps}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <Box
          sx={{
            position: "absolute" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex" as const,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            backgroundColor: "#f5f5f5",
            zIndex: 1,
          }}
        >
          {placeholder ||
            (showLoadingSpinner && (
              <CircularProgress size={24} sx={{ color: "text.secondary" }} />
            ))}
        </Box>
      )}

      {/* Image */}
      <Box
        ref={imgRef}
        component="img"
        src={lazy ? undefined : src}
        alt={alt}
        sizes={sizes}
        srcSet={srcSet}
        loading={lazy ? "lazy" : "eager"}
        sx={imageSx}
      />
    </Box>
  );
};

// Предустановленные варианты для типичных случаев использования
export const HeroImage: React.FC<Omit<ResponsiveImageProps, "aspectRatio">> = (
  props
) => (
  <ResponsiveImage
    aspectRatio="16/9"
    objectFit="cover"
    borderRadius={2}
    {...props}
  />
);

export const AvatarImage: React.FC<
  Omit<ResponsiveImageProps, "aspectRatio" | "borderRadius">
> = (props) => (
  <ResponsiveImage
    aspectRatio="1/1"
    objectFit="cover"
    borderRadius="50%"
    {...props}
  />
);

export const CardImage: React.FC<Omit<ResponsiveImageProps, "aspectRatio">> = (
  props
) => (
  <ResponsiveImage
    aspectRatio="4/3"
    objectFit="cover"
    borderRadius={1}
    {...props}
  />
);
