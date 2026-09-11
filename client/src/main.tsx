import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { AuthProvider } from "./lib/Auth-context.tsx";
import { MasterDataProvider } from "./lib/MasterData-context.tsx";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme/ThemeProvider.tsx";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/shared/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <MasterDataProvider>
            <TooltipProvider>
              <App />
              <Analytics />
              <Toaster
                position="top-center"
                // Long enough to read, short enough not to stack; sonner also
                // dedupes by a shared toast id, which saveToCollectionBtn relies
                // on when one page fires a request per question card.
                duration={4000}
              />
            </TooltipProvider>
          </MasterDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
