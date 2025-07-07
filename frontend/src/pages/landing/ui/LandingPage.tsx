import React from "react";
import { useNavigate } from "react-router-dom";
import { LandingWidget } from "@/widgets/landing";
import { useAuth } from "@/features/auth";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <LandingWidget
      onGetStarted={handleGetStarted}
      isAuthenticated={isAuthenticated}
    />
  );
};
