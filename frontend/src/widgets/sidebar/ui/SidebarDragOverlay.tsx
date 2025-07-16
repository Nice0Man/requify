import React from "react";
import { createPortal } from "react-dom";
import {
  Paper,
  ListItemIcon,
  ListItemText,
  Badge,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import { DragOverlay } from "@dnd-kit/core";
import { UniqueIdentifier } from "@dnd-kit/core";
import { SidebarItem } from "../model/types";

interface SidebarDragOverlayProps {
  activeId: UniqueIdentifier | null;
  items: SidebarItem[];
  isCollapsed: boolean;
}

export const SidebarDragOverlay: React.FC<SidebarDragOverlayProps> = ({
  activeId,
  items,
  isCollapsed,
}) => {
  const theme = useTheme();

  const activeItem = items.find((item) => item.id === activeId);

  if (!activeItem) {
    return null;
  }

  const Icon = activeItem.icon;

  return createPortal(
    <DragOverlay
      adjustScale={false}
      dropAnimation={{
        duration: 250,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}
      style={{
        cursor: "grabbing",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          display: "flex",
          alignItems: "center",
          px: isCollapsed ? 1 : 1.5,
          py: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: isCollapsed ? 4 : 2,
          backdropFilter: "blur(12px)",
          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
          minWidth: isCollapsed ? 56 : 200,
          maxWidth: isCollapsed ? 56 : 280,
          minHeight: isCollapsed ? 56 : 48,
          
          // Анимация floating эффекта
          transform: "rotate(2deg) scale(1.05)",
          transformOrigin: "center",
          animation: "dragFloat 2s ease-in-out infinite",
          
          "@keyframes dragFloat": {
            "0%, 100%": {
              transform: "rotate(2deg) scale(1.05)",
            },
            "50%": {
              transform: "rotate(-1deg) scale(1.08)",
            },
          },
          
          // Glow effect
          "&::before": {
            content: '""',
            position: "absolute",
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
            borderRadius: "inherit",
            zIndex: -1,
            filter: "blur(4px)",
          },
        }}
      >
        {/* Icon */}
        <ListItemIcon
          sx={{
            minWidth: isCollapsed ? 0 : 40,
            mr: isCollapsed ? 0 : 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...(isCollapsed ? {
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            } : {}),
          }}
        >
          <Badge
            badgeContent={activeItem.badge}
            color="error"
            invisible={!activeItem.badge}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                height: 16,
                minWidth: 16,
                borderRadius: 1,
                fontWeight: 600,
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                right: isCollapsed ? -6 : -4,
                top: isCollapsed ? -2 : 4,
                border: `1px solid ${theme.palette.background.paper}`,
              },
            }}
          >
            <Icon
              sx={{
                fontSize: isCollapsed ? 24 : 20,
                color: theme.palette.primary.main,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </Badge>
        </ListItemIcon>

        {/* Text для expanded режима */}
        {!isCollapsed && (
          <ListItemText
            primary={activeItem.label}
            sx={{
              "& .MuiListItemText-primary": {
                fontSize: "0.875rem",
                fontWeight: 600,
                color: theme.palette.primary.main,
                letterSpacing: "0.01em",
                textShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
              },
            }}
          />
        )}

        {/* Пульсирующий индикатор */}
        <Box
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            backgroundColor: theme.palette.primary.main,
            borderRadius: "50%",
            animation: "pulse 1s ease-in-out infinite",
            
            "@keyframes pulse": {
              "0%": { 
                opacity: 0.8, 
                transform: "scale(1)",
                boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              "50%": { 
                opacity: 1, 
                transform: "scale(1.2)",
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
              "100%": { 
                opacity: 0.8, 
                transform: "scale(1)",
                boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            },
          }}
        />
      </Paper>
    </DragOverlay>,
    document.body
  );
}; 