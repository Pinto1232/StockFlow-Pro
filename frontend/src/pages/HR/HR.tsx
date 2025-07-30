import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    Users,
    UserCheck,
    Receipt,
    Clock,
    Calendar,
    TrendingUp,
    FileText,
} from "lucide-react";

const HR: React.FC = () => {
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
                        <Briefcase className="h-4 w-4" />
                        <span>Human Resources</span>
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
                                    Human Resources Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage employees, performance, payroll, and organizational operations
                            </p>
                        </div>
                    </div>
                </div>

                {/* HR Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                    {/* Employee Directory Card */}
                    <Link
                        to="/hr/employee-directory"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    DIRECTORY
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Employee Directory</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                View and manage employee information and contacts
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-medium mt-auto">
                                <span>View Directory</span>
                                <Users className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Employee Performance Card */}
                    <Link
                        to="/hr/employee-performance"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <UserCheck className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    PERFORMANCE
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Employee Performance</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Track and evaluate employee performance metrics
                            </p>
                            <div className="flex items-center text-green-600 text-sm font-medium mt-auto">
                                <span>View Performance</span>
                                <TrendingUp className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Payslip Card */}
                    <Link
                        to="/hr/payslip"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    PAYSLIP
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Payslip</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Generate and manage employee payslips
                            </p>
                            <div className="flex items-center text-orange-600 text-sm font-medium mt-auto">
                                <span>Manage Payslips</span>
                                <FileText className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Attendance Card */}
                    <Link
                        to="/hr/attendance"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    ATTENDANCE
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Attendance</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Track employee attendance and working hours
                            </p>
                            <div className="flex items-center text-purple-600 text-sm font-medium mt-auto">
                                <span>View Attendance</span>
                                <Clock className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Holidays Card */}
                    <Link
                        to="/hr/holidays"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    HOLIDAYS
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Holidays</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Manage holidays, leave requests, and time off
                            </p>
                            <div className="flex items-center text-teal-600 text-sm font-medium mt-auto">
                                <span>Manage Holidays</span>
                                <Calendar className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">HR Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600 mb-2">124</div>
                            <div className="text-sm text-blue-700 font-medium">Total Employees</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                            <div className="text-sm text-green-700 font-medium">Attendance Rate</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-3xl font-bold text-purple-600 mb-2">8.4</div>
                            <div className="text-sm text-purple-700 font-medium">Avg Performance</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                            <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
                            <div className="text-sm text-orange-700 font-medium">Pending Requests</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HR;