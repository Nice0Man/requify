import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./shared/lib/i18n";

// Global styles and theme setup
import "@/app/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
