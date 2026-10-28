import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import DonatePage from "./DonatePage.jsx";

const isDonatePage = /^\/donate(\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isDonatePage ? <DonatePage /> : <App />}</React.StrictMode>
);
