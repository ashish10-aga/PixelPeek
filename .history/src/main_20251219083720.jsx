import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/base.css";
import ThemeManager from "./js/theme-manager";
import ThemeUI from "./js/theme-ui";

// Initialize theme system
ThemeManager.init();
ThemeUI.showSelection();

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
