/**
 * Shared PageLayout Component
 * Простой композитный layout без зависимостей от widgets
 * Компоненты sidebar и header передаются через props из pages слоя
 */

import React, { memo } from "react";
import { Box } from "@mui/material";

// Shared imports
import { ErrorBoundary } from "../ErrorBoundary";

export interface PageLayoutProps {
  /** Заголовок страницы */
  title?: string;
  /** Подзаголовок страницы */
  subtitle?: string;
  /** Дочерние элементы (основной контент) */
  children?: React.ReactNode;
  /** Компонент сайдбара (передается из pages) */
  sidebar?: React.ReactNode;
  /** Компонент заголовка (передается из pages) */
  header?: React.ReactNode;
  /** Действия для заголовка страницы */
  actions?: React.ReactNode[];
  /** Показывать ли сайдбар */
  showSidebar?: boolean;
  /** CSS классы */
  className?: string;
  /** Стили */
  sx?: Record<string, any>;
}

export const PageLayout: React.FC<PageLayoutProps> = memo(
  ({ title, subtitle, children, sidebar, header, actions, showSidebar = true, className, sx }) => {
    return (
      <Box
        className={className}
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          ...sx,
        }}
      >
        {/* Sidebar (передается извне) */}
        {showSidebar && sidebar && <ErrorBoundary>{sidebar}</ErrorBoundary>}

        {/* Main content area */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0, // Предотвращаем переполнение
          }}
        >
          {/* Header (передается извне) */}
          {header && <ErrorBoundary>{header}</ErrorBoundary>}

          {/* Page content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              overflow: "auto",
            }}
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </Box>
        </Box>
      </Box>
    );
  }
);

PageLayout.displayName = "PageLayout";
