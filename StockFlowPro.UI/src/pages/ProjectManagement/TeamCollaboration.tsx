import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    FolderKanban,
    Users,
    Search,
    Mail,
    Calendar,
    CheckCircle,
    MessageSquare,
    Video,
    FileText,
    MoreHorizontal,
    UserPlus,
} from "lucide-react";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    email: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy';
    projects: string[];
    tasksCompleted: number;
    tasksInProgress: number;
    joinDate: string;
    skills: string[];
}

interface Project {
    id: number;
    name: string;
    members: number[];
    progress: number;
    dueDate: string;
    status: 'active' | 'completed' | 'on-hold';
}

const TeamCollaboration: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState('team');

    // Mock data for demonstration
    const teamMembers: TeamMember[] = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "UI/UX Designer",
            email: "sarah.johnson@company.com",
            avatar: "SJ",
            status: "online",
            projects: ["E-commerce Platform", "Mobile App"],
            tasksCompleted: 24,
            tasksInProgress: 3,
            joinDate: "2023-06-15",
            skills: ["Figma", "Adobe XD", "Prototyping", "User Research"]
        },
        {
            id: 2,
            name: "Mike Chen",
            role: "Full Stack Developer",
            email: "mike.chen@company.com",
            avatar: "MC",
            status: "online",
            projects: ["E-commerce Platform", "API Integration"],
            tasksCompleted: 31,
            tasksInProgress: 5,
            joinDate: "2023-03-20",
            skills: ["React", "Node.js", "Python", "PostgreSQL"]
        },
        {
            id: 3,
            name: "Emily Davis",
            role: "QA Engineer",
            email: "emily.davis@company.com",
            avatar: "ED",
            status: "busy",
            projects: ["Mobile App", "Database Migration"],
            tasksCompleted: 18,
            tasksInProgress: 2,
            joinDate: "2023-08-10",
            skills: ["Selenium", "Jest", "Manual Testing", "Automation"]
        },
        {
            id: 4,
            name: "Alex Rodriguez",
            role: "DevOps Engineer",
            email: "alex.rodriguez@company.com",
            avatar: "AR",
            status: "offline",
            projects: ["Database Migration"],
            tasksCompleted: 15,
            tasksInProgress: 1,
            joinDate: "2023-05-05",
            skills: ["Docker", "Kubernetes", "AWS", "CI/CD"]
        },
        {
            id: 5,
            name: "John Smith",
            role: "Technical Writer",
            email: "john.smith@company.com",
            avatar: "JS",
            status: "online",
            projects: ["API Integration"],
            tasksCompleted: 12,
            tasksInProgress: 2,
            joinDate: "2023-09-01",
            skills: ["Documentation", "Technical Writing", "API Docs"]
        }
    ];

    const projects: Project[] = [
        {
            id: 1,
            name: "E-commerce Platform Redesign",
            members: [1, 2],
            progress: 75,
            dueDate: "2024-02-15",
            status: "active"
        },
        {
            id: 2,
            name: "Mobile App Development",
            members: [1, 3],
            progress: 45,
            dueDate: "2024-03-01",
            status: "active"
        },
        {
            id: 3,
            name: "Database Migration",
            members: [3, 4],
            progress: 100,
            dueDate: "2024-01-20",
            status: "completed"
        },
        {
            id: 4,
            name: "API Integration",
            members: [2, 5],
            progress: 15,
            dueDate: "2024-02-28",
            status: "active"
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'busy':
                return 'bg-yellow-500';
            case 'offline':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    const getProjectStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'on-hold':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                        <Users className="h-4 w-4" />
                        <span>Team Collaboration</span>
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
                                    Team Collaboration
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Collaborate with team members, manage assignments, and track team performance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Invite Member
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Start Meeting
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Members</p>
                                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Online Now</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {teamMembers.filter(m => m.status === 'online').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {projects.filter(p => p.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FolderKanban className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { key: 'team', label: 'Team Members', icon: Users },
                                { key: 'projects', label: 'Project Teams', icon: FolderKanban },
                                { key: 'communication', label: 'Communication', icon: MessageSquare }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setSelectedTab(tab.key)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                            selectedTab === tab.key
                                                ? 'border-purple-500 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {selectedTab === 'team' && (
                            <div>
                                {/* Search */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search team members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Team Members Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMembers.map((member) => (
                                        <div key={member.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {member.avatar}
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                                        <p className="text-sm text-gray-600">{member.role}</p>
                                                    </div>
                                                </div>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Joined {member.joinDate}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-green-600">{member.tasksCompleted}</p>
                                                    <p className="text-xs text-gray-600">Completed</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-blue-600">{member.tasksInProgress}</p>
                                                    <p className="text-xs text-gray-600">In Progress</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {member.skills.slice(0, 3).map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {member.skills.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                                                            +{member.skills.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    Message
                                                </button>
                                                <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Video className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedTab === 'projects' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Teams</h3>
                                <div className="space-y-4">
                                    {projects.map((project) => (
                                        <div key={project.id} className="border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Due {project.dueDate}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex -space-x-2">
                                                    {project.members.map((memberId) => {
                                                        const member = teamMembers.find(m => m.id === memberId);
                                                        return member ? (
                                                            <div
                                                                key={memberId}
                                                                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                                                title={member.name}
                                                            >
                                                                {member.avatar}
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {project.members.length} members
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm text-gray-600">{project.progress}% Complete</span>
                                                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedTab === 'communication' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Communication Hub</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Team Chat</h4>
                                        <p className="text-sm text-gray-600 mb-4">Real-time messaging with team members</p>
                                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Open Chat
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Video className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Video Meetings</h4>
                                        <p className="text-sm text-gray-600 mb-4">Schedule and join video conferences</p>
                                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                            Start Meeting
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <FileText className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Shared Documents</h4>
                                        <p className="text-sm text-gray-600 mb-4">Collaborate on documents and files</p>
                                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                            View Files
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamCollaboration;