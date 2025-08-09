import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    CreditCard,
    Banknote,
    Users,
    Calendar,
    DollarSign,
    Plus,
    Download,
    Clock,
} from "lucide-react";

const Payroll: React.FC = () => {
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
                        <Banknote className="h-4 w-4" />
                        <span>Payroll</span>
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
                                    Payroll Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage employee payroll, compensation, and payment processing
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="w-4 h-4" />
                                <span>Run Payroll</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payroll Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                ACTIVE
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
                        <p className="text-gray-600 text-sm">Total Employees</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                MONTHLY
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$45,200</h3>
                        <p className="text-gray-600 text-sm">Total Payroll</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                NEXT
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Dec 15</h3>
                        <p className="text-gray-600 text-sm">Next Pay Date</p>
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
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
                        <p className="text-gray-600 text-sm">Pending Approvals</p>
                    </div>
                </div>

                {/* Recent Payroll Runs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Payroll Runs</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pay Period</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employees</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Gross Pay</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Pay</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Nov 16 - Nov 30, 2024</td>
                                    <td className="py-4 px-4">24</td>
                                    <td className="py-4 px-4">$52,400</td>
                                    <td className="py-4 px-4">$45,200</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Nov 1 - Nov 15, 2024</td>
                                    <td className="py-4 px-4">24</td>
                                    <td className="py-4 px-4">$51,800</td>
                                    <td className="py-4 px-4">$44,700</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">Oct 16 - Oct 31, 2024</td>
                                    <td className="py-4 px-4">23</td>
                                    <td className="py-4 px-4">$49,200</td>
                                    <td className="py-4 px-4">$42,500</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Employee Summary */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Employee Payroll Summary</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Department Breakdown</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Engineering</span>
                                    <span className="font-semibold text-gray-900">$18,500</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Sales</span>
                                    <span className="font-semibold text-gray-900">$12,300</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Marketing</span>
                                    <span className="font-semibold text-gray-900">$8,900</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Operations</span>
                                    <span className="font-semibold text-gray-900">$5,500</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Payroll Taxes & Deductions</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Federal Tax</span>
                                    <span className="font-semibold text-gray-900">$4,200</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">State Tax</span>
                                    <span className="font-semibold text-gray-900">$1,800</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Social Security</span>
                                    <span className="font-semibold text-gray-900">$800</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Medicare</span>
                                    <span className="font-semibold text-gray-900">$400</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payroll;