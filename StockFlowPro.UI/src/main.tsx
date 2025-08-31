import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/queryClient";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";
import "./styles/dropdown.css";
import "./styles/dropdown-fixes.css";
import App from "./App.tsx";
import signalr from "./services/signalrService";
import { ToastProvider } from "./components/ui/ToastProvider";

// Import environment configuration to trigger startup logging
import "./config/environment";

// Ensure SignalR starts on app boot
signalr.start().catch((e) => console.warn("SignalR start failed:", e));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ToastProvider maxToasts={5} defaultPosition="bottom-center">
                <App />
            </ToastProvider>
        </QueryClientProvider>
    </StrictMode>,
);
