import React, { memo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

export interface DashboardHeaderProps {
  className?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Dashboard Header Component with Context7 Design
 * Always positioned at the top of the dashboard
 */
export const DashboardHeader = memo<DashboardHeaderProps>(
  ({ className, isRefreshing = false, onRefresh }) => {
    const t = i18n.t;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleRefresh = useCallback(() => {
      if (!isRefreshing && onRefresh) {
        onRefresh();
      }
    }, [isRefreshing, onRefresh]);

    return (
      <Box
        className={className}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          mb: 3,
          animation: "fadeInDown 0.6s ease-out",
          "@keyframes fadeInDown": {
            "0%": {
              opacity: 0,
              transform: "translateY(-20px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 3.5,
            },
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: "blur(20px)",
            boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.06)}`,
            position: "relative",
            overflow: "hidden",
            // Context7 accent gradient bar
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.secondary.main} 50%, 
                ${theme.palette.info.main} 100%)`,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  background: `linear-gradient(135deg, 
                    ${theme.palette.text.primary} 0%, 
                    ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 0.5,
                }}
              >
                {t("dashboard.title", "Dashboard")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  color: theme.palette.text.secondary,
                }}
              >
                {t(
                  "dashboard.subtitle",
                  "Welcome back! Here's what's happening with your projects."
                )}
              </Typography>
            </Box>

            <Tooltip
              title={
                isRefreshing
                  ? t("dashboard.refreshing", "Refreshing...")
                  : t("dashboard.refresh", "Refresh data")
              }
              arrow
            >
              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    transform: "scale(1.05)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <Refresh
                  sx={{
                    fontSize: { xs: 22, sm: 24 },
                    color: theme.palette.primary.main,
                    ...(isRefreshing && {
                      animation: "spin 1s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }),
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    );
  }
);

DashboardHeader.displayName = "DashboardHeader";
