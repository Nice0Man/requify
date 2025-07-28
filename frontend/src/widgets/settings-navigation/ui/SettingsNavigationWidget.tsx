/**
 * Settings Navigation Widget
 */

import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  alpha,
  Skeleton,
} from "@mui/material";
import type { SettingsNavigationProps, TabItemProps } from "../model/types";

const TabItem: React.FC<TabItemProps> = ({ tab, index, isActive, onClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 2,
        cursor: "pointer",
        textAlign: "center",
        border: `2px solid ${isActive ? tab.color : alpha(theme.palette.divider, 0.1)}`,
        background: isActive 
          ? alpha(tab.color, 0.1) 
          : alpha(theme.palette.background.paper, 0.5),
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: tab.color,
          transform: "translateY(-2px)",
          boxShadow: `0 8px 20px ${alpha(tab.color, 0.15)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: alpha(tab.color, isActive ? 0.2 : 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          transition: "all 0.3s ease",
        }}
      >
        {React.cloneElement(tab.icon as React.ReactElement, {
          sx: { 
            color: tab.color, 
            fontSize: 24,
            transform: isActive ? "scale(1.1)" : "scale(1)",
            transition: "all 0.3s ease",
          },
        })}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: isActive ? tab.color : theme.palette.text.primary,
          mb: 0.5,
        }}
      >
        {tab.label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "0.75rem",
        }}
      >
        {tab.description}
      </Typography>
    </Paper>
  );
};

const TabItemSkeleton: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        textAlign: "center",
        border: `2px solid ${alpha("#000", 0.05)}`,
      }}
    >
      <Skeleton variant="rectangular" width={48} height={48} sx={{ mx: "auto", mb: 2, borderRadius: 2 }} />
      <Skeleton variant="text" width="80%" sx={{ mx: "auto", mb: 0.5 }} />
      <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
    </Paper>
  );
};

export const SettingsNavigationWidget: React.FC<SettingsNavigationProps> = ({
  activeTab,
  onTabChange,
  tabs,
  isLoading = false,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 3,
          }}
        >
          Категории настроек
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <TabItemSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 3,
        }}
      >
        Категории настроек
      </Typography>
      <Grid container spacing={2}>
        {tabs.map((tab, index) => (
          <Grid item xs={12} sm={6} md={3} key={tab.id}>
            <TabItem
              tab={tab}
              index={index}
              isActive={activeTab === index}
              onClick={() => onTabChange(index)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 