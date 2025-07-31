import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

interface PermissionButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    disabledMessage?: string;
}

/**
 * Button component that is only enabled/visible based on user permissions
 */
const PermissionButton: React.FC<PermissionButtonProps> = ({
    permission,
    permissions,
    requireAll = false,
    children,
    fallback = null,
    disabledMessage = "You don't have permission to perform this action",
    className = "",
    ...buttonProps
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } =
        usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    }

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        // Return disabled button with tooltip
        return (
            <button
                {...buttonProps}
                disabled={true}
                title={disabledMessage}
                className={`${className} opacity-50 cursor-not-allowed`}
            >
                {children}
            </button>
        );
    }

    return (
        <button {...buttonProps} className={className}>
            {children}
        </button>
    );
};

export default PermissionButton;
