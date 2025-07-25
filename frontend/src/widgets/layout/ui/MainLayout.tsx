import React, { useMemo, useCallback, memo } from "react";
import { Box, useTheme } from "@mui/material";
import { ErrorBoundary } from "@/shared/ui";
import { useCurrentUser } from "@/features/auth/hooks/useAuthQuery";
import type { User } from "@/entities/user";
import { AppSidebarWidget } from "@/widgets/app-sidebar";
import { useLayout } from "../model/useLayout";
import type { MainLayoutProps } from "../model/types";

/**
 * Основной layout приложения с оптимизированной производительностью
 * Следует принципам FSD архитектуры
 */
export const MainLayout: React.FC<MainLayoutProps> = memo(
  ({
    children,
    actions,
    config: userConfig,
    className,
    sx,
    onSidebarStateChange,
  }) => {
    const theme = useTheme();

    // Получаем текущего пользователя
    const { data: userProfile, isLoading: isUserLoading } = useCurrentUser();

    // Преобразуем UserProfile в User для совместимости с AppSidebarWidget (мемоизированно)
    const user: User | undefined = useMemo(() => {
      if (!userProfile) return undefined;

      return {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        avatar_url: userProfile.avatar_url,
        is_active: true, // Предполагаем, что аутентифицированный пользователь активен
        email_verified: true, // Предполагаем, что email подтвержден
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
        last_login_at: userProfile.last_login_at,
      };
    }, [userProfile]);

    const {
      state,
      config,
      actions: layoutActions,
    } = useLayout(userConfig, undefined, onSidebarStateChange);

    // Мемоизированный обработчик изменения состояния sidebar
    const handleSidebarStateChange = useCallback(
      (isCollapsed: boolean) => {
        layoutActions.toggleSidebar();
        onSidebarStateChange?.(isCollapsed);
      },
      [layoutActions, onSidebarStateChange]
    );

    // Конфигурация для AppSidebarWidget
    const sidebarConfig = useMemo(
      () => ({
        showHeader: config.showHeader,
        showUserProfile: true,
        enableDragAndDrop: false,
        enableKeyboardNavigation: true,
        animationDuration: config.enableTransitions ? 300 : 0,
      }),
      [config]
    );

    // Стили главного контейнера
    const containerStyles = useMemo(
      () => ({
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        transition: config.enableTransitions
          ? theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            })
          : undefined,
        ...sx,
      }),
      [theme, config.enableTransitions, sx]
    );

    // Стили основного контента (БЕЗ overflow - предотвращаем двойные скроллы)
    const mainContentStyles = useMemo(
      () => ({
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0, // Предотвращаем overflow
        height: "100vh", // Фиксированная высота
      }),
      []
    );

    // Стили области контента (ТОЛЬКО здесь overflow)
    const contentAreaStyles = useMemo(
      () => ({
        flexGrow: 1,
        p: config.contentPadding,
        bgcolor: theme.palette.background.default,
        overflow: "auto", // Единственный скролл здесь
        // Адаптивные отступы
        [theme.breakpoints.down("md")]: {
          p: Math.max(1, config.contentPadding - 1),
        },
      }),
      [theme, config]
    );

    // Мемоизированный обработчик навигации
    const handleNavigation = useCallback((path: string, item: any) => {
      // Можно добавить аналитику навигации
      console.debug("Layout: Navigation to", path, item);
    }, []);

    // Мемоизированная секция с actions
    const actionsSection = useMemo(
      () =>
        actions ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              minHeight: 64,
              flexShrink: 0, // Не сжимается
            }}
          >
            {actions}
          </Box>
        ) : null,
      [actions, theme.palette.divider]
    );

    // Мемоизированный loader
    const loadingContent = useMemo(
      () => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          Загрузка...
        </Box>
      ),
      []
    );

    return (
      <ErrorBoundary>
        <Box className={className} sx={containerStyles}>
          {/* Sidebar */}
          {config.showSidebar && (
            <ErrorBoundary>
              <AppSidebarWidget
                user={user}
                defaultCollapsed={state.isSidebarCollapsed}
                config={{
                  ...sidebarConfig,
                  animationDuration: 300 as const,
                }}
                onStateChange={handleSidebarStateChange}
                onNavigate={handleNavigation}
              />
            </ErrorBoundary>
          )}

          {/* Main content area */}
          <Box component="main" sx={mainContentStyles}>
            {/* Actions area */}
            {actionsSection}

            {/* Page content */}
            <Box sx={contentAreaStyles}>
              <ErrorBoundary>
                {/* Показываем loader пока загружается пользователь, если это критично */}
                {isUserLoading && config.showSidebar
                  ? loadingContent
                  : children}
              </ErrorBoundary>
            </Box>
          </Box>
        </Box>
      </ErrorBoundary>
    );
  }
);

MainLayout.displayName = "MainLayout";
