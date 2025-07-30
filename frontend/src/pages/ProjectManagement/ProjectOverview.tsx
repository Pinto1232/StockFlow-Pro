import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    FolderKanban,
    LayoutDashboard,
    Users,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    Target,
    BarChart3,
    Activity,
    Plus,
    ArrowRight,
} from "lucide-react";

const ProjectOverview: React.FC = () => {
    // Mock data for demonstration
    const projectStats = {
        totalProjects: 12,
        activeProjects: 8,
        completedProjects: 4,
        overdueTasks: 3,
        teamMembers: 24,
        upcomingDeadlines: 5
    };

    const recentProjects = [
        {
            id: 1,
            name: "E-commerce Platform Redesign",
            status: "In Progress",
            progress: 75,
            dueDate: "2024-02-15",
            team: 6,
            priority: "High"
        },
        {
            id: 2,
            name: "Mobile App Development",
            status: "In Progress",
            progress: 45,
            dueDate: "2024-03-01",
            team: 4,
            priority: "Medium"
        },
        {
            id: 3,
            name: "Database Migration",
            status: "Completed",
            progress: 100,
            dueDate: "2024-01-20",
            team: 3,
            priority: "High"
        },
        {
            id: 4,
            name: "API Integration",
            status: "Planning",
            progress: 15,
            dueDate: "2024-02-28",
            team: 5,
            priority: "Low"
        }
    ];

    const upcomingTasks = [
        {
            id: 1,
            title: "Design Review Meeting",
            project: "E-commerce Platform",
            dueDate: "Today",
            priority: "High"
        },
        {
            id: 2,
            title: "API Documentation",
            project: "Mobile App Development",
            dueDate: "Tomorrow",
            priority: "Medium"
        },
        {
            id: 3,
            title: "User Testing Session",
            project: "E-commerce Platform",
            dueDate: "Jan 25",
            priority: "High"
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Planning':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'text-red-600';
            case 'Medium':
                return 'text-yellow-600';
            case 'Low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

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
                        <Link to="/project-management" className="hover:text-gray-700">Project Management</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Project Overview</span>
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
                                    Project Overview
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Monitor project status, track progress, and manage your team's work
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                New Project
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{projectStats.totalProjects}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{projectStats.activeProjects}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{projectStats.completedProjects}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                                <p className="text-2xl font-bold text-red-600">{projectStats.overdueTasks}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Team Members</p>
                                <p className="text-2xl font-bold text-gray-900">{projectStats.teamMembers}</p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                                <p className="text-2xl font-bold text-gray-900">{projectStats.upcomingDeadlines}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Recent Projects */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Recent Projects
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentProjects.map((project) => (
                                    <div key={project.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {project.team} members
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Due {project.dueDate}
                                                </span>
                                                <span className={`font-medium ${getPriorityColor(project.priority)}`}>
                                                    {project.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-gray-600">{project.progress}% Complete</span>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                                View Details
                                                <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                Upcoming Tasks
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                                        <p className="text-sm text-gray-600">{task.project}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{task.dueDate}</span>
                                            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link 
                                to="/project-management/task-management"
                                className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1"
                            >
                                View All Tasks
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow text-left group">
                            <Target className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-medium text-gray-900 mb-2">Create Project</h3>
                            <p className="text-sm text-gray-600">Start a new project</p>
                        </button>
                        <Link 
                            to="/project-management/task-management"
                            className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow text-left group"
                        >
                            <CheckCircle className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-medium text-gray-900 mb-2">Add Task</h3>
                            <p className="text-sm text-gray-600">Create a new task</p>
                        </Link>
                        <Link 
                            to="/project-management/team-collaboration"
                            className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow text-left group"
                        >
                            <Users className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-medium text-gray-900 mb-2">Invite Team</h3>
                            <p className="text-sm text-gray-600">Add team members</p>
                        </Link>
                        <Link 
                            to="/project-management/reports"
                            className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow text-left group"
                        >
                            <BarChart3 className="h-8 w-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-medium text-gray-900 mb-2">View Reports</h3>
                            <p className="text-sm text-gray-600">Generate reports</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;