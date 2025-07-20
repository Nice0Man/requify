import { Box, CssBaseline, useTheme, alpha } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { SidebarWidget, useSidebarState } from "@/widgets/sidebar";
import { HeaderWidget } from "@/widgets/header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const theme = useTheme();
  const { isCollapsed, isMobile } = useSidebarState();

  // Context7 принципы - рассчитываем отступ для main контента
  const getMainMarginLeft = () => {
    if (isMobile) {
      return 0; // На мобильном сайдбар overlay, не отступ
    }
    return isCollapsed ? 72 : 280; // collapsed: 72px, expanded: 280px
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 0.95)} 0%, 
            ${alpha(theme.palette.grey[50], 0.3)} 100%)`,
          // Context7 микро-градиент для глубины
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.02,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
            pointerEvents: "none",
            zIndex: -1,
          },
        }}
      >
        <SidebarWidget />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            // Context7 плавные переходы
            marginLeft: `${getMainMarginLeft()}px`,
            transition: theme.transitions.create(["margin-left"], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
            // На мобильном занимаем всю ширину
            width: isMobile ? "100%" : `calc(100% - ${getMainMarginLeft()}px)`,
            // Context7 subtle shadow для depth
            boxShadow: isMobile
              ? "none"
              : `inset 2px 0 8px ${alpha(theme.palette.common.black, 0.02)}`,
          }}
        >
          <HeaderWidget />

          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              backgroundColor: "transparent", // Прозрачный для градиента
              position: "relative",
              // Context7 scrollbar styling
              "&::-webkit-scrollbar": {
                width: 6,
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: alpha(theme.palette.divider, 0.05),
                borderRadius: 3,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                },
              },
              // Smooth scrolling
              scrollBehavior: "smooth",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
