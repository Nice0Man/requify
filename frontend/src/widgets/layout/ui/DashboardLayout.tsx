import React from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import { SidebarWidget } from "@/widgets/sidebar";
import { HeaderWidget } from "@/widgets/header";
import { useSidebarState } from "@/widgets/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const theme = useTheme();
  const { isCollapsed, isMobile } = useSidebarState();

  // Рассчитываем отступ для main контента
  const getMainMarginLeft = () => {
    if (isMobile) {
      return 0; // На мобильном сайдбар overlay, не отступ
    }
    return isCollapsed ? 72 : 280; // collapsed: 72px, expanded: 280px
  };

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
            // Правильные отступы с учетом состояния сайдбара
            marginLeft: `${getMainMarginLeft()}px`,
            transition: "margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1)",
            // На мобильном занимаем всю ширину
            width: isMobile ? "100%" : `calc(100% - ${getMainMarginLeft()}px)`,
          }}
        >
          <HeaderWidget />
          
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              backgroundColor: theme.palette.background.default,
              position: "relative",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
