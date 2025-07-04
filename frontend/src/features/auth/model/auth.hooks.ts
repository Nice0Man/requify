import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AuthGuardConfig, AuthRedirectConfig } from './auth.types';

// =============================================================================
// Auth Guard Hook
// =============================================================================

export const useAuthGuard = (config: AuthGuardConfig = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // This would integrate with the auth context when it's created
  const isAuthenticated = false; // TODO: Get from useAuth()
  const permissions: string[] = []; // TODO: Get from useAuth()
  const user = null; // TODO: Get from useAuth()

  useEffect(() => {
    const checkAuthorization = () => {
      // Check authentication requirement
      if (config.requireAuth && !isAuthenticated) {
        setIsAuthorized(false);
        if (config.redirectTo) {
          navigate(config.redirectTo, { 
            state: { from: location.pathname },
            replace: true 
          });
        }
        return;
      }

      // Check permission requirements
      if (config.requirePermissions && config.requirePermissions.length > 0) {
        const hasRequiredPermissions = config.requireAllPermissions
          ? config.requirePermissions.every(permission => permissions.includes(permission))
          : config.requirePermissions.some(permission => permissions.includes(permission));

        if (!hasRequiredPermissions) {
          setIsAuthorized(false);
          if (config.redirectTo) {
            navigate(config.redirectTo, { replace: true });
          }
          return;
        }
      }

      // Check email verification requirement
      if (!config.allowUnverifiedEmail && user && !(user as any).email_verified) {
        setIsAuthorized(false);
        if (config.redirectTo) {
          navigate(config.redirectTo, { replace: true });
        }
        return;
      }

      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [
    isAuthenticated,
    permissions,
    user,
    config.requireAuth,
    config.requirePermissions,
    config.requireAllPermissions,
    config.redirectTo,
    config.allowUnverifiedEmail,
    navigate,
    location.pathname
  ]);

  return {
    isAuthorized,
    isLoading: isAuthorized === null,
  };
};

// =============================================================================
// Auth Redirect Hook
// =============================================================================

export const useAuthRedirect = (config: AuthRedirectConfig = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // This would integrate with the auth context when it's created
  const isAuthenticated = false; // TODO: Get from useAuth()

  const redirectToLogin = () => {
    const loginPath = config.loginRedirect || '/auth/login';
    navigate(loginPath, {
      state: { from: location.pathname },
      replace: true
    });
  };

  const redirectToLogout = () => {
    const logoutPath = config.logoutRedirect || '/';
    navigate(logoutPath, { replace: true });
  };

  const redirectToRegister = () => {
    const registerPath = config.registerRedirect || '/auth/register';
    navigate(registerPath, {
      state: { from: location.pathname },
      replace: true
    });
  };

  const redirectToDefault = () => {
    const from = (location.state as any)?.from;
    const defaultPath = config.defaultRedirect || '/dashboard';
    navigate(from || defaultPath, { replace: true });
  };

  const redirectAfterAuth = () => {
    if (isAuthenticated) {
      redirectToDefault();
    }
  };

  return {
    redirectToLogin,
    redirectToLogout, 
    redirectToRegister,
    redirectToDefault,
    redirectAfterAuth,
  };
}; 