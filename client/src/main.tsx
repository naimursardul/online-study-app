import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { AuthProvider } from "./lib/Auth-context.tsx";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <App />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
