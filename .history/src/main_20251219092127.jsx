import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/base.css";

// Clear theme modal flag to show modal every time (can be removed later)
localStorage.removeItem('pixelpeekThemeModalShown');

// Initialize analytics on app load
if (process.env.NODE_ENV === "production") {
  window.addEventListener("beforeunload", () => {
    // Flush any remaining analytics
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize theme system AFTER React mounts
setTimeout(() => {
  import('./js/theme-manager').then((module) => {
    const ThemeManager = module.default;
    ThemeManager.init();
    
    // Show theme UI after a short delay
    setTimeout(() => {
      import('./js/theme-ui').then((uiModule) => {
        const ThemeUI = uiModule.default;
        ThemeUI.showSelection();
      }).catch((err) => console.error('Failed to initialize theme UI:', err));
    }, 100);
  }).catch((err) => console.error('Failed to initialize theme manager:', err));
}, 0);
