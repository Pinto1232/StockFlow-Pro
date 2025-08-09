import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

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
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};

export default PermissionRoute;
