import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    Calendar,
    Plus,
    Edit,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
} from "lucide-react";

const Holidays: React.FC = () => {
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
                        <Briefcase className="h-4 w-4" />
                        <Link to="/hr" className="hover:text-gray-700">Human Resources</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Calendar className="h-4 w-4" />
                        <span>Holidays</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Holidays & Leave Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage company holidays, leave requests, and time-off policies
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="w-4 h-4" />
                                <span>Add Holiday</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Holiday Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                TOTAL
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
                        <p className="text-gray-600 text-sm">Total Holidays</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                APPROVED
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">18</h3>
                        <p className="text-gray-600 text-sm">Leave Requests</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                PENDING
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">7</h3>
                        <p className="text-gray-600 text-sm">Pending Requests</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                REJECTED
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
                        <p className="text-gray-600 text-sm">Rejected Requests</p>
                    </div>
                </div>

                {/* Upcoming Holidays */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Holidays</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    NATIONAL
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Christmas Day</h4>
                            <p className="text-sm text-gray-600 mb-2">December 25, 2024</p>
                            <p className="text-xs text-gray-500">Federal Holiday</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    NATIONAL
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">New Year's Day</h4>
                            <p className="text-sm text-gray-600 mb-2">January 1, 2025</p>
                            <p className="text-xs text-gray-500">Federal Holiday</p>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    COMPANY
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Company Day</h4>
                            <p className="text-sm text-gray-600 mb-2">January 15, 2025</p>
                            <p className="text-xs text-gray-500">Company Holiday</p>
                        </div>
                    </div>
                </div>

                {/* Leave Requests */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Leave Requests</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Leave Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Days</th>
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
                                                <div className="text-sm text-gray-600">Engineering</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Vacation
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">Dec 23, 2024</td>
                                    <td className="py-4 px-4">Dec 27, 2024</td>
                                    <td className="py-4 px-4">5</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Approved
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 text-sm">
                                                <Trash2 className="w-4 h-4" />
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
                                                <div className="text-sm text-gray-600">Marketing</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Sick Leave
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">Dec 15, 2024</td>
                                    <td className="py-4 px-4">Dec 16, 2024</td>
                                    <td className="py-4 px-4">2</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-green-600 hover:text-green-800 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 text-sm">
                                                <XCircle className="w-4 h-4" />
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
                                                <div className="text-sm text-gray-600">Sales</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Personal
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">Jan 2, 2025</td>
                                    <td className="py-4 px-4">Jan 3, 2025</td>
                                    <td className="py-4 px-4">2</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-green-600 hover:text-green-800 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 text-sm">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Holiday Calendar and Leave Balance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Holiday Calendar */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">2024 Holiday Calendar</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                <div>
                                    <div className="font-semibold text-gray-900">Christmas Day</div>
                                    <div className="text-sm text-gray-600">December 25</div>
                                </div>
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    National
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <div className="font-semibold text-gray-900">New Year's Day</div>
                                    <div className="text-sm text-gray-600">January 1</div>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    National
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <div>
                                    <div className="font-semibold text-gray-900">Martin Luther King Jr. Day</div>
                                    <div className="text-sm text-gray-600">January 20</div>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    National
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div>
                                    <div className="font-semibold text-gray-900">Presidents' Day</div>
                                    <div className="text-sm text-gray-600">February 17</div>
                                </div>
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    National
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Leave Balance Summary */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Leave Balance Summary</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">Vacation Days</span>
                                    <span className="font-semibold text-gray-900">18/25</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">Sick Leave</span>
                                    <span className="font-semibold text-gray-900">5/12</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">Personal Days</span>
                                    <span className="font-semibold text-gray-900">2/5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">Comp Time</span>
                                    <span className="font-semibold text-gray-900">8/15</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '53%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Holidays;