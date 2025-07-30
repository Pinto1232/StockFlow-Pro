import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// Hexagonal Architecture Provider
import { ArchitectureProvider } from "./architecture/adapters/primary/ArchitectureProvider";

// Components
import Layout from "./components/Layout/Layout.tsx";
import {
    ProtectedRoute,
    PermissionRoute,
    AuthProvider,
} from "./components/Auth";
import { Permissions } from "./utils/permissions.ts";

// Pages
import Login from "./pages/Auth/Login.tsx";
import Register from "./pages/Auth/Register.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import Products from "./pages/Products/Products.tsx";
import ProductDetail from "./pages/Products/ProductDetail.tsx";
import Users from "./pages/Users/Users.tsx";
import UserDetail from "./pages/Users/UserDetail.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import Invoices from "./pages/Invoices/Invoices.tsx";
import AdminPanel from "./pages/Admin/AdminPanel.tsx";
import PermissionsDemo from "./pages/Admin/PermissionsDemo.tsx";
import UserSync from "./pages/Sync/UserSync.tsx";
import NotificationsPage from "./pages/NotificationsPage.tsx";
import ArchitectureTestPage from "./pages/Debug/ArchitectureTestPage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import Account from "./pages/Account/Account.tsx";
import FinancialReports from "./pages/Account/FinancialReports.tsx";
import Payroll from "./pages/Account/Payroll.tsx";
import ExpenseTracking from "./pages/Account/ExpenseTracking.tsx";
import InvoicingBilling from "./pages/Account/InvoicingBilling.tsx";

function App() {
    return (
        <ArchitectureProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50">
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected routes */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route
                                    index
                                    element={
                                        <Navigate to="/dashboard" replace />
                                    }
                                />
                                <Route
                                    path="dashboard"
                                    element={<Dashboard />}
                                />

                                {/* Products */}
                                <Route path="products" element={<Products />} />
                                <Route
                                    path="products/:id"
                                    element={<ProductDetail />}
                                />

                                {/* Invoices */}
                                <Route
                                    path="invoices"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.Invoice.ViewInvoices
                                            }
                                        >
                                            <Invoices />
                                        </PermissionRoute>
                                    }
                                />

                                {/* Users */}
                                <Route
                                    path="users"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.Users.ViewAll
                                            }
                                        >
                                            <Users />
                                        </PermissionRoute>
                                    }
                                />
                                <Route
                                    path="users/:id"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.Users.ViewAll
                                            }
                                        >
                                            <UserDetail />
                                        </PermissionRoute>
                                    }
                                />

                                {/* Admin */}
                                <Route
                                    path="admin"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System
                                                    .ViewAdminPanel
                                            }
                                        >
                                            <AdminPanel />
                                        </PermissionRoute>
                                    }
                                />
                                <Route
                                    path="permissions-demo"
                                    element={<PermissionsDemo />}
                                />
                                <Route
                                    path="sync"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System.SyncData
                                            }
                                        >
                                            <UserSync />
                                        </PermissionRoute>
                                    }
                                />

                                {/* Account */}
                                <Route
                                    path="account"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System
                                                    .ViewAdminPanel
                                            }
                                        >
                                            <Account />
                                        </PermissionRoute>
                                    }
                                />
                                <Route
                                    path="account/financial-reports"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System
                                                    .ViewAdminPanel
                                            }
                                        >
                                            <FinancialReports />
                                        </PermissionRoute>
                                    }
                                />
                                <Route
                                    path="account/payroll"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System
                                                    .ViewAdminPanel
                                            }
                                        >
                                            <Payroll />
                                        </PermissionRoute>
                                    }
                                />
                                <Route
                                    path="account/expense-tracking"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System
                                                    .ViewAdminPanel
                                            }
                                        >
                                            <ExpenseTracking />
                                        </PermissionRoute>
                                    }
                                />
                                <Route
                                    path="account/invoicing-billing"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.Invoice.ViewInvoices
                                            }
                                        >
                                            <InvoicingBilling />
                                        </PermissionRoute>
                                    }
                                />

                                {/* Notifications */}
                                <Route path="notifications" element={<NotificationsPage />} />

                                {/* Debug/Testing */}
                                <Route path="architecture-test" element={<ArchitectureTestPage />} />

                                {/* Profile & Settings */}
                                <Route path="profile" element={<Profile />} />
                                <Route
                                    path="settings"
                                    element={
                                        <PermissionRoute
                                            permission={
                                                Permissions.System
                                                    .ManageSettings
                                            }
                                        >
                                            <Settings />
                                        </PermissionRoute>
                                    }
                                />
                            </Route>

                            {/* 404 route */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </ArchitectureProvider>
    );
}

export default App;
