import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./shared/lib/i18n";

// Global styles and theme setup
import "@/app/styles/index.css";

// Viewport height fix for mobile devices
import { initViewportHeight } from "./shared/utils/viewportHeight";

// Initialize viewport height fix
initViewportHeight();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
