import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateEnv } from "./lib/env-validation";
import "./lib/i18n"; // Initialize i18n

// Validate environment variables on application startup
try {
  validateEnv();
} catch (error) {
  console.error(error);
  // Continue rendering to show error in UI if needed
}

createRoot(document.getElementById("root")!).render(<App />);
