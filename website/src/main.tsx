import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";

const isAdminRoute =
  window.location.pathname === "/admin" ||
  window.location.pathname.startsWith("/admin/");

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isAdminRoute ? <AdminApp /> : <App />}</StrictMode>,
);
