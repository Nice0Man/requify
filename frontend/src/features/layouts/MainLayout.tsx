import React, { memo } from "react";
import { Box } from "@mui/material";

// Импорт нового виджета layout
import { MainLayout as LayoutWidget } from "@/widgets/layout";
import type { MainLayoutProps as LayoutWidgetProps } from "@/widgets/layout";

export interface MainLayoutProps {
  /** Дочерние элементы (основной контент страницы) */
  children: React.ReactNode;
  /** Заголовок страницы */
  title?: string;
  /** Подзаголовок страницы */
  subtitle?: string;
  /** Действия для заголовка */
  actions?: React.ReactNode[];
  /** Показывать ли sidebar */
  showSidebar?: boolean;
  /** Показывать ли header */
  showHeader?: boolean;
  /** Показывать ли overflow */
  overflow?: boolean;
  /** CSS классы */
  className?: string;
  /** Кастомные стили */
  sx?: Record<string, any>;
}

/**
 * MainLayout - главный layout для защищенных маршрутов
 * Рефакторен для использования нового @/widgets/layout
 */
export const MainLayout: React.FC<MainLayoutProps> = memo(
  ({
    children,
    title,
    subtitle,
    actions,
    showSidebar = true,
    showHeader = true,
    overflow = false,
    className,
    sx,
  }) => {
    // Конвертируем старые пропсы в новый формат
    const layoutConfig = {
      showSidebar,
      showHeader,
      contentOverflow: overflow ? ("auto" as const) : ("hidden" as const),
      contentPadding: 3,
      enableTransitions: true,
    };

    // Конвертируем массив actions в единый ReactNode
    const layoutActions = actions && actions.length > 0 ? (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions}
      </Box>
    ) : undefined;

    const layoutProps: LayoutWidgetProps = {
      children,
      title,
      subtitle,
      actions: layoutActions,
      config: layoutConfig,
      className,
      sx,
    };

    return <LayoutWidget {...layoutProps} />;
  }
);

MainLayout.displayName = "MainLayout";

