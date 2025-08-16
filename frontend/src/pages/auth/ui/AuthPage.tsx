import React from "react";
import { AuthContainerWidget } from "@/widgets/auth";

/**
 * Страница авторизации - тонкая обертка над AuthContainerWidget
 * Следует принципам FSD архитектуры
 */
const AuthPage: React.FC = () => {
  return <AuthContainerWidget />;
};

export default AuthPage;
