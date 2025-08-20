import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { LoadingState, ErrorState } from "../ui";

interface PermissionRouteProps {
    children: React.ReactNode;
    permission: string;
    fallback?: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
    children,
    permission,
            fallback = "/app/dashboard",
}) => {
    const { hasPermission, loading, error, refreshPermissions } = usePermissions();

    if (loading) {
        return <LoadingState message="Checking permissions..." />;
    }
    if (error) {
        return <ErrorState title="Permission check failed" error={error} onRetry={refreshPermissions} message="Could not verify your permissions yet." />;
    }

    if (!hasPermission(permission)) {
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};

export default PermissionRoute;
