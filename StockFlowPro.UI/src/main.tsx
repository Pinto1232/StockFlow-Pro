import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/queryClient";
import "./index.css";
import "./styles/dropdown.css";
import "./styles/dropdown-fixes.css";
import App from "./App.tsx";
import signalr from "./services/signalrService";

// Ensure SignalR starts on app boot
signalr.start().catch((e) => console.warn("SignalR start failed:", e));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
);
