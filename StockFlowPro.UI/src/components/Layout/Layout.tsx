import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SignalRProvider from "../SignalR/SignalRProvider";
import "./Layout.css";

const Layout: React.FC = () => {
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Define pages that should have full-width layout (no sidebar)
    const fullWidthPages = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
    ];
    const isFullWidthPage = fullWidthPages.includes(location.pathname);

    // Define pages that need special content padding
    const isProducts = location.pathname.startsWith("/products");
    const isInvoices = location.pathname.startsWith("/invoices");
    const isDashboard = location.pathname === "/app/dashboard";

    if (isFullWidthPage) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Outlet />
            </div>
        );
    }

    return (
        <SignalRProvider>
            <div className="min-h-screen bg-gray-50">
                {/* Sidebar */}
                <div
                    className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 transition-all duration-300 sidebar-container ${
                        isSidebarCollapsed ? "collapsed" : ""
                    }`}
                >
                    <Sidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Mobile sidebar overlay */}
                {isMobileSidebarOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 sidebar-container">
                            <Sidebar isCollapsed={false} />
                        </div>
                    </div>
                )}

                {/* Fixed Navbar */}
                <div
                    className={`fixed top-0 right-0 z-40 transition-all duration-300 navbar-container ${
                        isSidebarCollapsed ? "collapsed" : ""
                    }`}
                >
                    <Navbar
                        onMobileSidebarToggle={() =>
                            setIsMobileSidebarOpen(!isMobileSidebarOpen)
                        }
                        onSidebarToggle={() =>
                            setIsSidebarCollapsed(!isSidebarCollapsed)
                        }
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                </div>

                {/* Main content area with top padding for navbar */}
                <div
                    className={`pt-16 transition-all duration-300 main-content ${
                        isSidebarCollapsed ? "collapsed" : ""
                    }`}
                >
                    <main className="bg-gray-50 min-h-screen">
                        <div
                            className={`${
                                isProducts || isInvoices || isDashboard
                                    ? "max-w-none px-0 py-0"
                                    : "max-w-none px-6 py-8"
                            }`}
                        >
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </SignalRProvider>
    );
};

export default Layout;