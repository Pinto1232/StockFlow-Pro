import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    Receipt,
    Download,
    Search,
    Filter,
    Calendar,
    DollarSign,
    FileText,
    Eye,
} from "lucide-react";

const Payslip: React.FC = () => {
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
                        <Briefcase className="h-4 w-4" />
                        <Link to="/hr" className="hover:text-gray-700">Human Resources</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Receipt className="h-4 w-4" />
                        <span>Payslip</span>
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
                                    Payslip Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Generate, view, and manage employee payslips and salary statements
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Download className="w-4 h-4" />
                                <span>Export All</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg">
                                <FileText className="w-4 h-4" />
                                <span>Generate Payslips</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payslip Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                TOTAL
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">$485,200</h3>
                        <p className="text-gray-600 text-sm">Total Payroll</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                GENERATED
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">124</h3>
                        <p className="text-gray-600 text-sm">Payslips Generated</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                PERIOD
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Dec 2024</h3>
                        <p className="text-gray-600 text-sm">Current Period</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                PENDING
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">8</h3>
                        <p className="text-gray-600 text-sm">Pending Approval</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by employee name or ID..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Sales</option>
                            <option>Marketing</option>
                            <option>Operations</option>
                            <option>HR</option>
                        </select>
                        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <option>December 2024</option>
                            <option>November 2024</option>
                            <option>October 2024</option>
                            <option>September 2024</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Payslips Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Employee Payslips</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Gross Salary</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Deductions</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Salary</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">JD</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">John Doe</div>
                                                <div className="text-sm text-gray-600">EMP001</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">Engineering</td>
                                    <td className="py-4 px-4">$8,500</td>
                                    <td className="py-4 px-4">$1,275</td>
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-green-600">$7,225</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Generated
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">JS</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Jane Smith</div>
                                                <div className="text-sm text-gray-600">EMP002</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">Marketing</td>
                                    <td className="py-4 px-4">$6,800</td>
                                    <td className="py-4 px-4">$1,020</td>
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-green-600">$5,780</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Generated
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">MB</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Mike Brown</div>
                                                <div className="text-sm text-gray-600">EMP003</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">Sales</td>
                                    <td className="py-4 px-4">$7,200</td>
                                    <td className="py-4 px-4">$1,080</td>
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-green-600">$6,120</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 cursor-not-allowed text-sm font-medium">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">SW</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Sarah Wilson</div>
                                                <div className="text-sm text-gray-600">EMP004</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">HR</td>
                                    <td className="py-4 px-4">$5,500</td>
                                    <td className="py-4 px-4">$825</td>
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-green-600">$4,675</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Generated
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payroll Summary */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Payroll Summary - December 2024</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Department Breakdown</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Engineering</span>
                                    <span className="font-semibold text-gray-900">$185,400</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Sales</span>
                                    <span className="font-semibold text-gray-900">$142,800</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Marketing</span>
                                    <span className="font-semibold text-gray-900">$98,600</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Operations</span>
                                    <span className="font-semibold text-gray-900">$58,400</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Deductions Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Federal Tax</span>
                                    <span className="font-semibold text-gray-900">$48,520</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">State Tax</span>
                                    <span className="font-semibold text-gray-900">$19,408</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Social Security</span>
                                    <span className="font-semibold text-gray-900">$9,704</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Medicare</span>
                                    <span className="font-semibold text-gray-900">$4,852</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payslip;