import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    BarChart3,
    Banknote,
    CreditCard,
    FileText,
    TrendingUp,
    DollarSign,
    Calculator,
    Receipt,
} from "lucide-react";

const Account: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center gap-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-500">
                        <Home className="h-4 w-4" />
                        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <CreditCard className="h-4 w-4" />
                        <span>Account</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Account Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage your financial operations, accounting, and business finances
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {/* Financial Reports Card */}
                    <Link
                        to="/account/financial-reports"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    REPORTS
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Financial Reports</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                View comprehensive financial reports and analytics
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-medium mt-auto">
                                <span>View Reports</span>
                                <TrendingUp className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Payroll Card */}
                    <Link
                        to="/account/payroll"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Banknote className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    PAYROLL
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Payroll</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Manage employee payroll and compensation
                            </p>
                            <div className="flex items-center text-green-600 text-sm font-medium mt-auto">
                                <span>Manage Payroll</span>
                                <DollarSign className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Expense Tracking Card */}
                    <Link
                        to="/account/expense-tracking"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    EXPENSES
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Expense Tracking</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Track and categorize business expenses
                            </p>
                            <div className="flex items-center text-orange-600 text-sm font-medium mt-auto">
                                <span>Track Expenses</span>
                                <Calculator className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Invoicing & Billing Card */}
                    <Link
                        to="/account/invoicing-billing"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    BILLING
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Invoicing & Billing</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Manage invoices, billing, and payment processing
                            </p>
                            <div className="flex items-center text-purple-600 text-sm font-medium mt-auto">
                                <span>Manage Billing</span>
                                <Receipt className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Account Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600 mb-2">$125,430</div>
                            <div className="text-sm text-blue-700 font-medium">Total Revenue</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <div className="text-3xl font-bold text-green-600 mb-2">$23,890</div>
                            <div className="text-sm text-green-700 font-medium">Monthly Expenses</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-3xl font-bold text-purple-600 mb-2">$101,540</div>
                            <div className="text-sm text-purple-700 font-medium">Net Profit</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;