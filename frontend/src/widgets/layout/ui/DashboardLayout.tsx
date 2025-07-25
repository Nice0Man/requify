import React, { memo } from "react";
import { Box, useTheme } from "@mui/material";
import type { DashboardLayoutProps } from "../model/types";

export const DashboardLayout = memo<DashboardLayoutProps>(({
  mode = "detailed",
  layout = "grid",
  header,
  sidebar,
  children,
  showSidebar = true,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: theme.palette.background.default,
        ...sx,
      }}
    >
      {/* Header */}
      {header}
      
      {/* Main content area */}
      <Box display="flex" flex={1} overflow="hidden">
        {/* Sidebar */}
        {showSidebar && sidebar}
        
        {/* Content */}
        <Box
          component="main"
          flex={1}
          p={mode === "minimal" ? 1 : 2}
          overflow="auto"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
});

DashboardLayout.displayName = "DashboardLayout"; 