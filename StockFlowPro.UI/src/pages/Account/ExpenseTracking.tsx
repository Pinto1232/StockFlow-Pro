import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    CreditCard,
    Plus,
    Filter,
    Download,
    Calendar,
    Receipt,
    Car,
    Coffee,
    Wifi,
    Building,
} from "lucide-react";

const ExpenseTracking: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center gap-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-500">
                        <Home className="h-4 w-4" />
                        <Link to="/app/dashboard" className="hover:text-gray-700">Dashboard</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-500">
                        <CreditCard className="h-4 w-4" />
                        <Link to="/account" className="hover:text-gray-700">Account</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Receipt className="h-4 w-4" />
                        <span>Expense Tracking</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Expense Tracking
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Track and categorize business expenses for better financial management
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="w-4 h-4" />
                                <span>Add Expense</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expense Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                MONTHLY
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$23,890</h3>
                        <p className="text-gray-600 text-sm">Total Expenses</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                THIS MONTH
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">156</h3>
                        <p className="text-gray-600 text-sm">Total Transactions</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                TOP CATEGORY
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$8,450</h3>
                        <p className="text-gray-600 text-sm">Office Supplies</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                AVERAGE
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$153</h3>
                        <p className="text-gray-600 text-sm">Per Transaction</p>
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Expense Categories</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Building className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Office Supplies</p>
                                        <p className="text-sm text-gray-600">45 transactions</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">$8,450</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Car className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Travel</p>
                                        <p className="text-sm text-gray-600">23 transactions</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">$6,200</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Wifi className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Software & Tools</p>
                                        <p className="text-sm text-gray-600">18 transactions</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">$4,890</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Coffee className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Meals & Entertainment</p>
                                        <p className="text-sm text-gray-600">32 transactions</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">$3,350</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Trend</h3>
                        <div className="h-64 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Expense trend chart will be displayed here</p>
                        </div>
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Expenses</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Method</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Dec 1, 2024</td>
                                    <td className="py-4 px-4">Office Supplies - Staples</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                            Office Supplies
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-semibold">$245.50</td>
                                    <td className="py-4 px-4">Company Card</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                            Approved
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Nov 30, 2024</td>
                                    <td className="py-4 px-4">Flight to NYC - Business Trip</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                            Travel
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-semibold">$450.00</td>
                                    <td className="py-4 px-4">Personal Card</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Nov 29, 2024</td>
                                    <td className="py-4 px-4">Adobe Creative Suite</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                                            Software
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-semibold">$52.99</td>
                                    <td className="py-4 px-4">Company Card</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                            Approved
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Nov 28, 2024</td>
                                    <td className="py-4 px-4">Team Lunch - Client Meeting</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                                            Meals
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-semibold">$125.75</td>
                                    <td className="py-4 px-4">Company Card</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                            Approved
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracking;