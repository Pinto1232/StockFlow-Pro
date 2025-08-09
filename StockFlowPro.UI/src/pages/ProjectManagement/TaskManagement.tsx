import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    FolderKanban,
    CheckSquare,
    Plus,
    Filter,
    Search,
    Calendar,
    User,
    Flag,
    Clock,
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle,
    Circle,
} from "lucide-react";

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
    project: string;
    tags: string[];
}

const TaskManagement: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);

    // Mock data for demonstration
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            title: "Design user authentication flow",
            description: "Create wireframes and mockups for the login and registration process",
            status: "in-progress",
            priority: "high",
            assignee: "Sarah Johnson",
            dueDate: "2024-01-25",
            project: "E-commerce Platform",
            tags: ["design", "ui/ux", "authentication"]
        },
        {
            id: 2,
            title: "Implement API endpoints",
            description: "Develop REST API endpoints for user management and product catalog",
            status: "todo",
            priority: "high",
            assignee: "Mike Chen",
            dueDate: "2024-01-28",
            project: "E-commerce Platform",
            tags: ["backend", "api", "development"]
        },
        {
            id: 3,
            title: "Database schema optimization",
            description: "Optimize database queries and improve indexing for better performance",
            status: "completed",
            priority: "medium",
            assignee: "Alex Rodriguez",
            dueDate: "2024-01-20",
            project: "Database Migration",
            tags: ["database", "optimization", "performance"]
        },
        {
            id: 4,
            title: "Mobile app testing",
            description: "Conduct comprehensive testing on iOS and Android devices",
            status: "in-progress",
            priority: "medium",
            assignee: "Emily Davis",
            dueDate: "2024-01-30",
            project: "Mobile App Development",
            tags: ["testing", "mobile", "qa"]
        },
        {
            id: 5,
            title: "Documentation update",
            description: "Update API documentation with new endpoints and examples",
            status: "todo",
            priority: "low",
            assignee: "John Smith",
            dueDate: "2024-02-05",
            project: "API Integration",
            tags: ["documentation", "api"]
        }
    ]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'in-progress':
                return <Clock className="h-5 w-5 text-blue-600" />;
            default:
                return <Circle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = selectedFilter === 'all' || task.status === selectedFilter;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const taskStats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
    };

    const toggleTaskStatus = (taskId: number) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                let newStatus: 'todo' | 'in-progress' | 'completed';
                switch (task.status) {
                    case 'todo':
                        newStatus = 'in-progress';
                        break;
                    case 'in-progress':
                        newStatus = 'completed';
                        break;
                    default:
                        newStatus = 'todo';
                        break;
                }
                return { ...task, status: newStatus };
            }
            return task;
        }));
    };

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
                        <FolderKanban className="h-4 w-4" />
                        <Link to="/projects" className="hover:text-gray-700">Project Management</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <CheckSquare className="h-4 w-4" />
                        <span>Task Management</span>
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
                                    Task Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Create, assign, and track project tasks efficiently
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowNewTaskModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <CheckSquare className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">To Do</p>
                                <p className="text-2xl font-bold text-gray-900">{taskStats.todo}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <Circle className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filter:</span>
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { key: 'all', label: 'All Tasks' },
                                    { key: 'todo', label: 'To Do' },
                                    { key: 'in-progress', label: 'In Progress' },
                                    { key: 'completed', label: 'Completed' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setSelectedFilter(filter.key)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            selectedFilter === filter.key
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Tasks ({filteredTasks.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <button
                                            onClick={() => toggleTaskStatus(task.id)}
                                            className="mt-1 hover:scale-110 transition-transform"
                                        >
                                            {getStatusIcon(task.status)}
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                    {task.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('-', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{task.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {task.assignee}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Due {task.dueDate}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Flag className="h-4 w-4" />
                                                    {task.project}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {task.tags.map((tag, index) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Task Modal Placeholder */}
                {showNewTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
                            <p className="text-gray-600 mb-4">Task creation form would go here...</p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowNewTaskModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskManagement;