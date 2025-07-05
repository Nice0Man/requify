import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./app/styles/index.css";

// Force hide scrollbars immediately
const hideScrollbarStyles = `
  html, body, #root, *, div, section, main, article, aside, nav, header, footer {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  html::-webkit-scrollbar, body::-webkit-scrollbar, #root::-webkit-scrollbar,
  *::-webkit-scrollbar, div::-webkit-scrollbar, section::-webkit-scrollbar,
  main::-webkit-scrollbar, article::-webkit-scrollbar, aside::-webkit-scrollbar,
  nav::-webkit-scrollbar, header::-webkit-scrollbar, footer::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
    -webkit-appearance: none !important;
  }
  
  html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, #root::-webkit-scrollbar-track,
  *::-webkit-scrollbar-track {
    display: none !important;
    background: transparent !important;
  }
  
  html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb, #root::-webkit-scrollbar-thumb,
  *::-webkit-scrollbar-thumb {
    display: none !important;
    background: transparent !important;
  }
  
  html::-webkit-scrollbar-corner, body::-webkit-scrollbar-corner, #root::-webkit-scrollbar-corner,
  *::-webkit-scrollbar-corner {
    display: none !important;
    background: transparent !important;
  }
`;

// Inject styles immediately
const styleElement = document.createElement("style");
styleElement.textContent = hideScrollbarStyles;
document.head.insertBefore(styleElement, document.head.firstChild);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
