import React from "react";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import "./styles/index.css";

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
