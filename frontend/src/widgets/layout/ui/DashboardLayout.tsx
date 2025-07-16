import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import { SidebarWidget } from "@/widgets/sidebar";
import { HeaderWidget } from "@/widgets/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <SidebarWidget />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <HeaderWidget />
          
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              backgroundColor: theme.palette.background.default,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
