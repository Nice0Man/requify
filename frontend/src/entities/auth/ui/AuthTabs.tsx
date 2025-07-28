import React from "react";
import { Box, Tabs, Tab, useTheme, alpha, LinearProgress } from "@mui/material";
import { Login, PersonAdd } from "@mui/icons-material";

export interface AuthTabsProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
  isLoading?: boolean;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  activeTab,
  onTabChange,
  isLoading = false,
}) => {
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  return (
    <>
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(
            "#ffffff",
            0.9
          )}, ${alpha("#f8fafc", 0.9)})`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              py: 2,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <Tab
            label="Sign In"
            icon={<Login />}
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab
            label="Create Account"
            icon={<PersonAdd />}
            iconPosition="start"
            sx={{ gap: 1 }}
          />
        </Tabs>
      </Box>

      {/* Loading Progress */}
      {isLoading && (
        <LinearProgress
          variant="indeterminate"
          sx={{
            height: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        />
      )}
    </>
  );
};
