import React from "react";
import { Box, Card, CardContent, Typography, Container } from "@mui/material";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  maxWidth = "sm",
}) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        py: 3,
      }}
    >
      <Container maxWidth={maxWidth}>
        <Card
          sx={{
            maxWidth: 450,
            mx: "auto",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {(title || subtitle) && (
              <Box textAlign="center" mb={3}>
                {title && (
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    fontWeight={600}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
