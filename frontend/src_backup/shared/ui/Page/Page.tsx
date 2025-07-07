import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";

interface PageProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  actions?: React.ReactNode;
  background?: string;
  padding?: number;
}

export const Page: React.FC<PageProps> = ({
  title,
  subtitle,
  icon,
  children,
  maxWidth = "xl",
  actions,
  background,
  padding = 4,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: background || "background.default",
        py: padding,
      }}
    >
      <Container maxWidth={maxWidth}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {icon && (
              <Box
                sx={{
                  fontSize: 40,
                  color: theme.palette.primary.main,
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: subtitle ? 1 : 0,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body1" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {actions && <Box>{actions}</Box>}
        </Box>

        {/* Content */}
        {children}
      </Container>
    </Box>
  );
};
