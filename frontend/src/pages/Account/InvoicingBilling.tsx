import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    CreditCard,
    FileText,
    Plus,
    Filter,
    Download,
    Send,
    Clock,
    CheckCircle,
    AlertCircle,
    DollarSign,
} from "lucide-react";

const InvoicingBilling: React.FC = () => {
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
                        <FileText className="h-4 w-4" />
                        <span>Invoicing & Billing</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Invoicing & Billing
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage invoices, billing, and payment processing for your business
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="w-4 h-4" />
                                <span>Create Invoice</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invoice Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                TOTAL
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">456</h3>
                        <p className="text-gray-600 text-sm">Total Invoices</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                PAID
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$125,430</h3>
                        <p className="text-gray-600 text-sm">Total Paid</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                PENDING
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$23,890</h3>
                        <p className="text-gray-600 text-sm">Outstanding</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                OVERDUE
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$5,240</h3>
                        <p className="text-gray-600 text-sm">Overdue Amount</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Create New Invoice</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Generate a new invoice for your clients quickly and easily
                        </p>
                        <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium">
                            Create Invoice
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Send className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Send Reminders</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Send payment reminders to clients with overdue invoices
                        </p>
                        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium">
                            Send Reminders
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Payment Settings</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Configure payment methods and billing preferences
                        </p>
                        <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium">
                            Manage Settings
                        </button>
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Invoices</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice #</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium">#INV-2024-001</td>
                                    <td className="py-4 px-4">Acme Corporation</td>
                                    <td className="py-4 px-4">Dec 1, 2024</td>
                                    <td className="py-4 px-4">Dec 31, 2024</td>
                                    <td className="py-4 px-4 font-semibold">$5,250.00</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Paid
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                                            Download
                                        </button>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium">#INV-2024-002</td>
                                    <td className="py-4 px-4">TechStart Inc.</td>
                                    <td className="py-4 px-4">Nov 28, 2024</td>
                                    <td className="py-4 px-4">Dec 28, 2024</td>
                                    <td className="py-4 px-4 font-semibold">$3,800.00</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                                            View
                                        </button>
                                        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                                            Send Reminder
                                        </button>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium">#INV-2024-003</td>
                                    <td className="py-4 px-4">Global Solutions</td>
                                    <td className="py-4 px-4">Nov 25, 2024</td>
                                    <td className="py-4 px-4">Nov 25, 2024</td>
                                    <td className="py-4 px-4 font-semibold">$2,150.00</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Overdue
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                                            View
                                        </button>
                                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                            Follow Up
                                        </button>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium">#INV-2024-004</td>
                                    <td className="py-4 px-4">Digital Agency</td>
                                    <td className="py-4 px-4">Nov 20, 2024</td>
                                    <td className="py-4 px-4">Dec 20, 2024</td>
                                    <td className="py-4 px-4 font-semibold">$7,500.00</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Paid
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                                            Download
                                        </button>
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

export default InvoicingBilling;