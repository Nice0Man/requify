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
  Typography,
} from '@mui/material';
import { SidebarItem as SidebarItemType } from '../model/types';
import { DropIndicator } from './DropIndicator';

// Анимация появления временного элемента
const dropPreviewAppear = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  100% {
    opacity: 0.8;
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
    <>
      {/* Индикатор места вставки */}
      <Box sx={{ px: isCollapsed ? 1 : 1.5, py: 0.5 }}>
        <DropIndicator />
      </Box>

      {/* Временный preview элемент с отступами */}
      <ListItem
        sx={{
          px: isCollapsed ? 0.5 : 1,
          py: 0,
          mb: 1, // Отступ снизу для создания пространства
          animation: `${dropPreviewAppear} 0.3s ease-out`,
        }}
      >
        <ListItemButton
          sx={{
            // Используем те же стили что и в SidebarItem
            mx: isCollapsed ? 0.5 : 0.5,
            borderRadius: isCollapsed ? 3.5 : 1.5,
            minHeight: isCollapsed ? 52 : 44,
            pl: isCollapsed ? 0.5 : 1.5,
            pr: isCollapsed ? 0.5 : 1.5,
            py: isCollapsed ? 0.5 : 0.5,
            position: "relative",
            overflow: "hidden",
            // Preview стили - полупрозрачный фон
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            outline: "none !important",
            cursor: "default",
            opacity: 0.8,
            // Убираем hover эффекты для preview
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            "&:focus": {
              outline: "none !important",
            },
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <ListItemIcon
            sx={{
              // Используем те же размеры что и в SidebarItem
              minWidth: isCollapsed ? 52 : 48,
              mr: isCollapsed ? 0 : 1.5,
              ml: isCollapsed ? 0 : 0,
              color: theme.palette.primary.main, // Всегда синий цвет как в SidebarItem
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isCollapsed ? 48 : 44,
              height: isCollapsed ? 48 : 44,
              borderRadius: isCollapsed ? 2.5 : 1.5,
              // В collapsed режиме добавляем фон как в SidebarItem
              backgroundColor: isCollapsed
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
              border: isCollapsed
                ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                : "none",
              boxShadow: isCollapsed
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`
                : "none",
            }}
          >
            <Icon 
              sx={{ 
                fontSize: isCollapsed ? 28 : 22, // Те же размеры что в SidebarItem
                color: "inherit",
                opacity: 0.8, // Слегка приглушен для preview
              }} 
            />
          </ListItemIcon>
          
          {!isCollapsed && (
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.875rem", // Те же стили что в SidebarItem
                      fontWeight: 400,
                      color: theme.palette.primary.main, // Синий цвет как в активном состоянии
                      transition: "all 0.2s ease",
                      letterSpacing: "0.01em",
                      lineHeight: 1.4,
                      opacity: 0.8, // Слегка приглушен для preview
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              }
              sx={{
                margin: 0,
                "& .MuiListItemText-primary": {
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  lineHeight: 1.4,
                },
              }}
            />
          )}

          {/* Индикатор preview элемента */}
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              opacity: 0.6,
              animation: `${keyframes`
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
              `} 2s ease-in-out`,
            }}
          />
        </ListItemButton>
      </ListItem>
    </>
  );
}; 