import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// IMPORT GLOBAL TRƯỚC để biến và helper sẵn cho toàn app
import "./index.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
