import React from "react";
import { Box, BoxProps } from "@mui/material";

interface ResponsiveImageProps extends Omit<BoxProps, "component"> {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  srcSet,
  sizes = "100vw",
  width = "100%",
  height = "auto",
  objectFit = "cover",
  loading = "lazy",
  priority = false,
  sx,
  ...boxProps
}) => {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      loading={priority ? "eager" : loading}
      sx={{
        width,
        height,
        objectFit,
        display: "block",
        ...sx,
      }}
      {...boxProps}
    />
  );
};
