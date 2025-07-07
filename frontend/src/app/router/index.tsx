import React from "react";
import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.isProtected ? (
              <ProtectedRoute requiredRole={route.requiredRole}>
                {route.element}
              </ProtectedRoute>
            ) : (
              <PublicRoute>{route.element}</PublicRoute>
            )
          }
        />
      ))}
    </Routes>
  );
};
