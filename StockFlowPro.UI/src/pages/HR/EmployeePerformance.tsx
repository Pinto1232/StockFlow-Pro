import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    UserCheck,
    TrendingUp,
    Award,
    Target,
    Star,
    Calendar,
    BarChart3,
    Plus,
} from "lucide-react";

const EmployeePerformance: React.FC = () => {
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
                        <UserCheck className="h-4 w-4" />
                        <span>Employee Performance</span>
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
                                    Employee Performance
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Track, evaluate, and manage employee performance metrics and reviews
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <BarChart3 className="w-4 h-4" />
                                <span>Generate Report</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="w-4 h-4" />
                                <span>New Review</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                AVERAGE
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">8.4</h3>
                        <p className="text-gray-600 text-sm">Performance Score</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                TOP PERFORMERS
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">18</h3>
                        <p className="text-gray-600 text-sm">High Achievers</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                GOALS
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">87%</h3>
                        <p className="text-gray-600 text-sm">Goals Achieved</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                REVIEWS
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
                        <p className="text-gray-600 text-sm">Pending Reviews</p>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performers This Quarter</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">John Doe</h4>
                            <p className="text-sm text-gray-600 mb-2">Senior Software Engineer</p>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">9.8</span>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                            <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Jane Smith</h4>
                            <p className="text-sm text-gray-600 mb-2">Marketing Manager</p>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-gray-600">9.5</span>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Mike Brown</h4>
                            <p className="text-sm text-gray-600 mb-2">Sales Director</p>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-orange-600">9.2</span>
                        </div>
                    </div>
                </div>

                {/* Performance Reviews Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Performance Reviews</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Review Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
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
                                                <div className="text-sm text-gray-600">Senior Software Engineer</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">Engineering</td>
                                    <td className="py-4 px-4">Dec 1, 2024</td>
                                    <td className="py-4 px-4">
                                        <span className="text-lg font-bold text-green-600">9.8</span>
                                    </td>
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
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">JS</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Jane Smith</div>
                                                <div className="text-sm text-gray-600">Marketing Manager</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">Marketing</td>
                                    <td className="py-4 px-4">Nov 28, 2024</td>
                                    <td className="py-4 px-4">
                                        <span className="text-lg font-bold text-green-600">9.5</span>
                                    </td>
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
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">MB</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Mike Brown</div>
                                                <div className="text-sm text-gray-600">Sales Director</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">Sales</td>
                                    <td className="py-4 px-4">Nov 25, 2024</td>
                                    <td className="py-4 px-4">
                                        <span className="text-lg font-bold text-green-600">9.2</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            In Review
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

                {/* Performance Metrics */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics by Department</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Average Scores</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Engineering</span>
                                    <span className="font-semibold text-gray-900">8.9</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Sales</span>
                                    <span className="font-semibold text-gray-900">8.6</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Marketing</span>
                                    <span className="font-semibold text-gray-900">8.4</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Operations</span>
                                    <span className="font-semibold text-gray-900">8.1</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Goal Achievement Rate</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Engineering</span>
                                    <span className="font-semibold text-gray-900">92%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Sales</span>
                                    <span className="font-semibold text-gray-900">89%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Marketing</span>
                                    <span className="font-semibold text-gray-900">85%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Operations</span>
                                    <span className="font-semibold text-gray-900">81%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeePerformance;