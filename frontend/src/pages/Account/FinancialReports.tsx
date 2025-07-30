import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    CreditCard,
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Download,
} from "lucide-react";

const FinancialReports: React.FC = () => {
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
                    <li className="flex items-center gap-2 text-gray-500">
                        <CreditCard className="h-4 w-4" />
                        <Link to="/account" className="hover:text-gray-700">Account</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <BarChart3 className="h-4 w-4" />
                        <span>Financial Reports</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Financial Reports
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                View comprehensive financial reports and analytics for your business
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>Date Range</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-green-600 text-sm font-medium">+12.5%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$125,430</h3>
                        <p className="text-gray-600 text-sm">Total Revenue</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-red-600 text-sm font-medium">-3.2%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$23,890</h3>
                        <p className="text-gray-600 text-sm">Total Expenses</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-blue-600 text-sm font-medium">+18.7%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$101,540</h3>
                        <p className="text-gray-600 text-sm">Net Profit</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-purple-600 text-sm font-medium">81%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">81%</h3>
                        <p className="text-gray-600 text-sm">Profit Margin</p>
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h3>
                        <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Revenue chart will be displayed here</p>
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Expense Breakdown</h3>
                        <div className="h-64 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Expense chart will be displayed here</p>
                        </div>
                    </div>

                    {/* Profit & Loss */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Profit & Loss Statement</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Total Revenue</span>
                                <span className="font-semibold text-gray-900">$125,430</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Cost of Goods Sold</span>
                                <span className="font-semibold text-gray-900">$15,200</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Operating Expenses</span>
                                <span className="font-semibold text-gray-900">$8,690</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t-2 border-gray-200 pt-4">
                                <span className="text-lg font-bold text-gray-900">Net Profit</span>
                                <span className="text-lg font-bold text-green-600">$101,540</span>
                            </div>
                        </div>
                    </div>

                    {/* Cash Flow */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Cash Flow</h3>
                        <div className="h-64 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Cash flow chart will be displayed here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;