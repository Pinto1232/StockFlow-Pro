import React, { useState } from "react";

interface DemoCredentialsProps {
    onCredentialSelect?: (email: string, password: string) => void;
}

const DemoCredentials: React.FC<DemoCredentialsProps> = ({
    onCredentialSelect,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const demoUsers = [
        {
            role: "Admin",
            email: "admin@stockflow.com",
            password: "admin123",
            description: "Full access to all features",
            color: "bg-red-100 text-red-800 border-red-200",
        },
        {
            role: "Manager",
            email: "manager@stockflow.com",
            password: "manager123",
            description: "Management level access",
            color: "bg-blue-100 text-blue-800 border-blue-200",
        },
        {
            role: "User",
            email: "user@stockflow.com",
            password: "user123",
            description: "Standard user access",
            color: "bg-green-100 text-green-800 border-green-200",
        },
    ];

    const handleCredentialClick = (email: string, password: string) => {
        if (onCredentialSelect) {
            onCredentialSelect(email, password);
        }
    };

    return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left"
            >
                <div className="flex items-center space-x-2">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    <span className="text-sm font-medium text-gray-700">
                        Demo Credentials
                    </span>
                </div>
                <i
                    className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-gray-400 text-xs`}
                ></i>
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-3">
                    <p className="text-xs text-gray-600">
                        Click on any credential below to auto-fill the login
                        form:
                    </p>

                    {demoUsers.map((user, index) => (
                        <div
                            key={index}
                            onClick={() =>
                                handleCredentialClick(user.email, user.password)
                            }
                            className="cursor-pointer p-3 rounded-md border transition-all hover:shadow-sm hover:scale-[1.02]"
                            style={{
                                backgroundColor: user.color.includes("red")
                                    ? "#fef2f2"
                                    : user.color.includes("blue")
                                      ? "#eff6ff"
                                      : "#f0fdf4",
                                borderColor: user.color.includes("red")
                                    ? "#fecaca"
                                    : user.color.includes("blue")
                                      ? "#dbeafe"
                                      : "#bbf7d0",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.color}`}
                                        >
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {user.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        Password:
                                    </p>
                                    <p className="text-sm font-mono text-gray-700">
                                        {user.password}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            This is a demo environment. These credentials are
                            for testing purposes only.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemoCredentials;
