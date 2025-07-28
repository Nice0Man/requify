import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/shared/ui";
import type { MainLayoutProps } from "@/shared/ui";

export interface ProtectedLayoutProps extends Omit<MainLayoutProps, 'children'> {
  /** Контент страницы */
  children: React.ReactNode;
  /** Роль, необходимая для доступа */
  requiredRole?: string;
  /** Роли, необходимые для доступа */
  requiredRoles?: string[];
}

/**
 * ProtectedLayout - комбинирует ProtectedRoute + MainLayout
 * Автоматически добавляет authentication check и layout с sidebar
 */
export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  requiredRole,
  requiredRoles,
  title,
  subtitle,
  actions,
  showSidebar = true,
  showHeader = true,
  className,
  sx,
  ...props
}) => {
  return (
    <ProtectedRoute requiredRole={requiredRole} requiredRoles={requiredRoles}>
      <MainLayout
        title={title}
        subtitle={subtitle}
        actions={actions}
        showSidebar={showSidebar}
        showHeader={showHeader}
        className={className}
        sx={sx}
        {...props}
      >
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
}; 