import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { ProtectedLayout } from "./ProtectedLayout";
import { PublicRoute } from "./PublicRoute";
import { CircularProgress, Box } from "@mui/material";

// Компонент загрузки для Suspense fallback
const SuspenseFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.isProtected ? (
                <ProtectedLayout requiredRole={route.requiredRole}>
                  {route.element}
                </ProtectedLayout>
              ) : (
                <PublicRoute>{route.element}</PublicRoute>
              )
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
};
