import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    FolderKanban,
    LayoutDashboard,
    CheckSquare,
    Users,
    BarChart3,
    Settings,
    TrendingUp,
} from "lucide-react";

const ProjectManagement: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full py-4">
                <div className="px-4 sm:px-6 lg:px-8">
                    <ol className="flex items-center gap-2 text-sm">
                        <li className="flex items-center gap-2 text-gray-500">
                            <Home className="h-4 w-4" />
                            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li className="flex items-center gap-2 text-gray-900 font-semibold">
                            <FolderKanban className="h-4 w-4" />
                            <span>Project Management</span>
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Project Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage projects, tasks, team collaboration, and track progress efficiently
                            </p>
                        </div>
                    </div>
                </div>

                {/* Project Management Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {/* Project Overview Card */}
                    <Link
                        to="/projects/overview"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <LayoutDashboard className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    OVERVIEW
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Project Overview</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                View project status, key metrics, and overall progress
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-medium mt-auto">
                                <span>View Overview</span>
                                <TrendingUp className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Task Management Card */}
                    <Link
                        to="/projects/tasks"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CheckSquare className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    TASKS
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Task Management</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Create, assign, and track project tasks
                            </p>
                            <div className="flex items-center text-green-600 text-sm font-medium mt-auto">
                                <span>Manage Tasks</span>
                                <CheckSquare className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Team Collaboration Card */}
                    <Link
                        to="/projects/team"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    TEAM
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Team Collaboration</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Collaborate with team members and manage assignments
                            </p>
                            <div className="flex items-center text-purple-600 text-sm font-medium mt-auto">
                                <span>Collaborate</span>
                                <Users className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Project Reports Card */}
                    <Link
                        to="/projects/reports"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    REPORTS
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Project Reports</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Generate and view project performance reports
                            </p>
                            <div className="flex items-center text-orange-600 text-sm font-medium mt-auto">
                                <span>View Reports</span>
                                <BarChart3 className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Project Settings Card */}
                    <Link
                        to="/projects/settings"
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    SETTINGS
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Project Settings</h5>
                            <p className="text-gray-600 text-sm mb-4">
                                Configure project settings and preferences
                            </p>
                            <div className="flex items-center text-gray-600 text-sm font-medium mt-auto">
                                <span>Manage Settings</span>
                                <Settings className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Project Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                            <div className="text-sm text-blue-700 font-medium">Total Projects</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                            <div className="text-sm text-green-700 font-medium">Active Projects</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-3xl font-bold text-purple-600 mb-2">24</div>
                            <div className="text-sm text-purple-700 font-medium">Team Members</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                            <div className="text-3xl font-bold text-orange-600 mb-2">156</div>
                            <div className="text-sm text-orange-700 font-medium">Active Tasks</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagement;