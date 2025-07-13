import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  keyframes,
  Box,
} from '@mui/material';
import { SidebarItem as SidebarItemType } from '../model/types';

// Анимация появления временного элемента
const dropPreviewAppear = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  100% {
    opacity: 0.6;
    transform: scale(1) translateY(0);
  }
`;

interface TemporaryDropPreviewProps {
  item: SidebarItemType;
  isCollapsed: boolean;
  index: number;
}

export const TemporaryDropPreview: React.FC<TemporaryDropPreviewProps> = ({
  item,
  isCollapsed,
  index,
}) => {
  const theme = useTheme();
  const Icon = item.icon;

  return (
    <ListItem
      sx={{
        px: isCollapsed ? 0.5 : 1,
        py: 0.5,
        animation: `${dropPreviewAppear} 0.3s ease-out`,
      }}
    >
      <ListItemButton
        sx={{
          mx: isCollapsed ? 0.5 : 0.5,
          borderRadius: isCollapsed ? 3.5 : 1.5,
          minHeight: isCollapsed ? 52 : 44,
          pl: isCollapsed ? 0.5 : 1.5,
          pr: isCollapsed ? 0.5 : 1.5,
          py: isCollapsed ? 0.5 : 0.5,
          position: "relative",
          overflow: "hidden",
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          border: isCollapsed ? "none" : `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
          outline: "none !important",
          cursor: "default",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          "&:focus": {
            outline: "none !important",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: isCollapsed ? 52 : 48,
            mr: isCollapsed ? 0 : 1.5,
            ml: isCollapsed ? 0 : 0,
            color: alpha(theme.palette.primary.main, 0.7),
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: isCollapsed ? 48 : 44,
            height: isCollapsed ? 48 : 44,
            borderRadius: isCollapsed ? 3.5 : 1.5,
            backgroundColor: isCollapsed
              ? alpha(theme.palette.primary.main, 0.15)
              : "transparent",
            border: isCollapsed
              ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
              : "none",
            outline: "none !important",
          }}
        >
          <Icon 
            sx={{ 
              fontSize: isCollapsed ? 28 : 22,
              color: "inherit",
              opacity: 0.7,
            }} 
          />
        </ListItemIcon>
        
        {!isCollapsed && (
          <ListItemText
            primary={
              <Box
                component="span"
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: alpha(theme.palette.primary.main, 0.7),
                  opacity: 0.8,
                }}
              >
                {item.label}
              </Box>
            }
            sx={{
              margin: 0,
              "& .MuiListItemText-primary": {
                fontSize: "0.875rem",
                fontWeight: 500,
                lineHeight: 1.4,
              },
            }}
          />
        )}

        {/* Индикатор временного элемента */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            opacity: 0.8,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}; 