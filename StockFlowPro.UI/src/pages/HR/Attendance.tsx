import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    Clock,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Filter,
    Eye,
    Edit,
    User,
} from "lucide-react";

const Attendance: React.FC = () => {
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
                        <Clock className="h-4 w-4" />
                        <span>Attendance</span>
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
                                    Attendance Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Track employee attendance, working hours, and time management
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Download className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg">
                                <Clock className="w-4 h-4" />
                                <span>Mark Attendance</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                PRESENT
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">118</h3>
                        <p className="text-gray-600 text-sm">Present Today</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                ABSENT
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">6</h3>
                        <p className="text-gray-600 text-sm">Absent Today</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                LATE
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
                        <p className="text-gray-600 text-sm">Late Arrivals</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                RATE
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">95.2%</h3>
                        <p className="text-gray-600 text-sm">Attendance Rate</p>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700 font-medium">Date Range:</span>
                        </div>
                        <input
                            type="date"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            defaultValue="2024-12-01"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="date"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            defaultValue="2024-12-31"
                        />
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Sales</option>
                            <option>Marketing</option>
                            <option>Operations</option>
                            <option>HR</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200">
                            <Filter className="w-4 h-4" />
                            <span>Apply Filter</span>
                        </button>
                    </div>
                </div>

                {/* Today's Attendance */}
                <div className="bg-white border-0 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden mb-8">
                    <div className="p-0">
                        <div className="rounded-2xl overflow-hidden">
                            <table className="w-full m-0 border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                            Employee
                                        </th>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                            Department
                                        </th>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                            Check In
                                        </th>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                            Check Out
                                        </th>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                            Hours
                                        </th>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                            Status
                                        </th>
                                        <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-[#f8fafc] transition-colors duration-200">
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                                                    <div className="text-sm text-gray-500">EMP001</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                                                Engineering
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-gray-700">
                                            08:45 AM
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-gray-700">
                                            05:30 PM
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] font-medium text-gray-900">
                                            8h 45m
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                                                <CheckCircle className="w-4 h-4" />
                                                Present
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(6,182,212,0.4)] border-0 min-w-[70px]" title="View Details">
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]" title="Edit Record">
                                                    <Edit className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-[#f8fafc] transition-colors duration-200">
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                                                    <div className="text-sm text-gray-500">EMP002</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                                                Marketing
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-gray-700">
                                            09:15 AM
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-gray-700">
                                            06:00 PM
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] font-medium text-gray-900">
                                            8h 45m
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                                                <AlertCircle className="w-4 h-4" />
                                                Late
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(6,182,212,0.4)] border-0 min-w-[70px]" title="View Details">
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]" title="Edit Record">
                                                    <Edit className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-[#f8fafc] transition-colors duration-200">
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Mike Brown</div>
                                                    <div className="text-sm text-gray-500">EMP003</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                                                Sales
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-gray-700">
                                            08:30 AM
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-gray-700">
                                            -
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] font-medium text-gray-900">
                                            -
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9]">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
                                                <Clock className="w-4 h-4" />
                                                Working
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 border-b border-[#f1f5f9] text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(6,182,212,0.4)] border-0 min-w-[70px]" title="View Details">
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]" title="Edit Record">
                                                    <Edit className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-[#f8fafc] transition-colors duration-200">
                                        <td className="align-middle text-sm p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Sarah Wilson</div>
                                                    <div className="text-sm text-gray-500">EMP004</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="align-middle text-sm p-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                                                HR
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 text-gray-700">
                                            -
                                        </td>
                                        <td className="align-middle text-sm p-4 text-gray-700">
                                            -
                                        </td>
                                        <td className="align-middle text-sm p-4 font-medium text-gray-900">
                                            -
                                        </td>
                                        <td className="align-middle text-sm p-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]">
                                                <XCircle className="w-4 h-4" />
                                                Absent
                                            </span>
                                        </td>
                                        <td className="align-middle text-sm p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(6,182,212,0.4)] border-0 min-w-[70px]" title="View Details">
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]" title="Edit Record">
                                                    <Edit className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer with pagination and bulk actions - Matching Products Style */}
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Today's Attendance - December 15, 2024
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                                4 records
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] border-0">
                                <Download className="h-3 w-3" />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Weekly Attendance Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Attendance Trend</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Monday</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">96%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tuesday</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">94%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Wednesday</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">98%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Thursday</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">92%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Friday</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">89%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Department Attendance */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Department Attendance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Engineering</span>
                                <span className="font-semibold text-green-600">97%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Sales</span>
                                <span className="font-semibold text-green-600">95%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Marketing</span>
                                <span className="font-semibold text-green-600">93%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Operations</span>
                                <span className="font-semibold text-yellow-600">91%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">HR</span>
                                <span className="font-semibold text-green-600">96%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Attendance Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <div className="text-2xl font-bold text-green-600 mb-1">2,856</div>
                            <div className="text-sm text-green-700 font-medium">Total Present Days</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                            <div className="text-2xl font-bold text-red-600 mb-1">144</div>
                            <div className="text-sm text-red-700 font-medium">Total Absent Days</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                            <div className="text-2xl font-bold text-yellow-600 mb-1">89</div>
                            <div className="text-sm text-yellow-700 font-medium">Late Arrivals</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600 mb-1">8.2h</div>
                            <div className="text-sm text-blue-700 font-medium">Avg Hours/Day</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;