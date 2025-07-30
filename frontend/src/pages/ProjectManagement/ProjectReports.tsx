import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    FolderKanban,
    BarChart3,
    Download,
    Filter,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    Target,
    Activity,
    PieChart,
    LineChart,
} from "lucide-react";

const ProjectReports: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedReport, setSelectedReport] = useState('overview');

    // Mock data for demonstration
    const reportData = {
        overview: {
            totalProjects: 12,
            completedProjects: 4,
            activeProjects: 8,
            overdueTasks: 3,
            teamProductivity: 87,
            budgetUtilization: 72
        },
        projectProgress: [
            { name: "E-commerce Platform", progress: 75, status: "On Track", dueDate: "2024-02-15" },
            { name: "Mobile App Development", progress: 45, status: "At Risk", dueDate: "2024-03-01" },
            { name: "Database Migration", progress: 100, status: "Completed", dueDate: "2024-01-20" },
            { name: "API Integration", progress: 15, status: "Behind", dueDate: "2024-02-28" }
        ],
        teamPerformance: [
            { name: "Sarah Johnson", tasksCompleted: 24, efficiency: 92, projects: 2 },
            { name: "Mike Chen", tasksCompleted: 31, efficiency: 88, projects: 2 },
            { name: "Emily Davis", tasksCompleted: 18, efficiency: 85, projects: 2 },
            { name: "Alex Rodriguez", tasksCompleted: 15, efficiency: 90, projects: 1 },
            { name: "John Smith", tasksCompleted: 12, efficiency: 87, projects: 1 }
        ],
        timeTracking: {
            totalHours: 1240,
            billableHours: 980,
            efficiency: 79,
            averageTaskTime: 4.2
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'On Track':
                return 'bg-blue-100 text-blue-800';
            case 'At Risk':
                return 'bg-yellow-100 text-yellow-800';
            case 'Behind':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const reportTypes = [
        { key: 'overview', label: 'Project Overview', icon: BarChart3 },
        { key: 'progress', label: 'Progress Reports', icon: TrendingUp },
        { key: 'team', label: 'Team Performance', icon: Users },
        { key: 'time', label: 'Time Tracking', icon: Clock }
    ];

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
                        <FolderKanban className="h-4 w-4" />
                        <Link to="/projects" className="hover:text-gray-700">Project Management</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <BarChart3 className="h-4 w-4" />
                        <span>Project Reports</span>
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
                                    Project Reports
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Generate and view comprehensive project performance reports and analytics
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export Report
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Schedule Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Report Type:</span>
                            </div>
                            <div className="flex gap-2">
                                {reportTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.key}
                                            onClick={() => setSelectedReport(type.key)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                                selectedReport === type.key
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {type.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Period:</span>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                {selectedReport === 'overview' && (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                        <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalProjects}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Target className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed</p>
                                        <p className="text-2xl font-bold text-green-600">{reportData.overview.completedProjects}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-blue-600">{reportData.overview.activeProjects}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Activity className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                                        <p className="text-2xl font-bold text-red-600">{reportData.overview.overdueTasks}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Team Productivity</p>
                                        <p className="text-2xl font-bold text-purple-600">{reportData.overview.teamProductivity}%</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Budget Used</p>
                                        <p className="text-2xl font-bold text-orange-600">{reportData.overview.budgetUtilization}%</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <PieChart className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Placeholder */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <LineChart className="h-5 w-5 text-orange-600" />
                                    Project Progress Trend
                                </h3>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Chart visualization would go here</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-orange-600" />
                                    Resource Allocation
                                </h3>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Pie chart visualization would go here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'progress' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Project Progress Report</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {reportData.projectProgress.map((project, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-600">Due: {project.dueDate}</span>
                                            <span className="text-sm font-medium text-gray-900">{project.progress}% Complete</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'team' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Team Performance Report</h2>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Team Member</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Tasks Completed</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Efficiency</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Projects</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.teamPerformance.map((member, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-900">{member.tasksCompleted}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-orange-600 h-2 rounded-full" 
                                                                style={{ width: `${member.efficiency}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-900">{member.efficiency}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-900">{member.projects}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'time' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Hours</p>
                                        <p className="text-2xl font-bold text-gray-900">{reportData.timeTracking.totalHours}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Billable Hours</p>
                                        <p className="text-2xl font-bold text-green-600">{reportData.timeTracking.billableHours}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Efficiency</p>
                                        <p className="text-2xl font-bold text-orange-600">{reportData.timeTracking.efficiency}%</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Task Time</p>
                                        <p className="text-2xl font-bold text-purple-600">{reportData.timeTracking.averageTaskTime}h</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Activity className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-orange-600" />
                                Time Distribution
                            </h3>
                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">Time tracking chart would go here</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectReports;