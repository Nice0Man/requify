import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth.context";
import QuickAuth from "@/widgets/landing/ui/QuickAuth";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return null;
  }

  // Don't render auth page if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return <QuickAuth />;
};

export default AuthPage; 