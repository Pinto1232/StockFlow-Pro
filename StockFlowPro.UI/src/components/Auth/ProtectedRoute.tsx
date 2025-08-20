import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../../hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();

    // Persist last visited app path for restoring after refresh/login
    useEffect(() => {
        if (isAuthenticated) {
            // Only store /app/* paths
            if (location.pathname.startsWith("/app/")) {
                sessionStorage.setItem("lastAppPath", location.pathname + location.search);
            }
        }
    }, [isAuthenticated, location.pathname, location.search]);

    // Attempt restore if hitting bare /app root (handled by index redirect) – we intercept here
    if (isAuthenticated && location.pathname === "/app") {
        const stored = sessionStorage.getItem("lastAppPath");
        if (stored && stored !== "/app/dashboard") {
            return <Navigate to={stored} replace />;
        }
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
