import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useAuth } from '../model';
import { useAuthGuard } from '../model/auth.hooks';
import type { AuthGuardConfig } from '../model';

export interface AuthGuardProps extends AuthGuardConfig {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  loadingComponent,
  unauthorizedComponent,
  requireAuth = true,
  requirePermissions = [],
  requireAllPermissions = false,
  redirectTo = '/auth/login',
  allowUnverifiedEmail = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isInitialized, user, permissions } = useAuth();
  
  const guardConfig: AuthGuardConfig = {
    requireAuth,
    requirePermissions,
    requireAllPermissions,
    redirectTo,
    allowUnverifiedEmail,
  };

  const { isAuthorized, isLoading: guardLoading } = useAuthGuard(guardConfig);

  // Show loading while auth is initializing or guard is checking
  if (!isInitialized || isLoading || guardLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Handle unauthenticated users
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Handle unverified email if required
  if (requireAuth && !allowUnverifiedEmail && user && !(user as any).email_verified) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    
    return (
      <Result
        status="warning"
        title="Email Verification Required"
        subTitle="Please verify your email address to access this feature."
        extra={[
          <Button type="primary" key="verify">
            Resend Verification Email
          </Button>,
          <Button key="logout">
            Sign Out
          </Button>,
        ]}
      />
    );
  }

  // Handle insufficient permissions
  if (requirePermissions && requirePermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? requirePermissions.every(permission => permissions.includes(permission))
      : requirePermissions.some(permission => permissions.includes(permission));

    if (!hasRequiredPermissions) {
      if (unauthorizedComponent) {
        return <>{unauthorizedComponent}</>;
      }
      
      return (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this resource."
          extra={[
            <Button type="primary" key="home" onClick={() => window.history.back()}>
              Go Back
            </Button>,
          ]}
        />
      );
    }
  }

  // User is authorized, render children
  if (isAuthorized === false) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You are not authorized to access this resource."
        extra={[
          <Button type="primary" key="home" onClick={() => window.history.back()}>
            Go Back
          </Button>,
        ]}
      />
    );
  }

  return <>{children}</>;
};

// Convenience wrapper for requiring authentication
export const RequireAuth: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}> = ({ children, fallback, redirectTo }) => {
  return (
    <AuthGuard requireAuth={true} fallback={fallback} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  );
};

// Convenience wrapper for requiring permissions
export const RequirePermissions: React.FC<{
  children: React.ReactNode;
  permissions: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({ children, permissions, requireAll = false, fallback }) => {
  return (
    <AuthGuard 
      requireAuth={true}
      requirePermissions={permissions}
      requireAllPermissions={requireAll}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}; 