import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    FolderKanban,
    Settings,
    Save,
    Bell,
    Users,
    Shield,
    Clock,
    Mail,
    Smartphone,
    Globe,
    Key,
    Eye,
    EyeOff,
    AlertCircle,
    Info,
} from "lucide-react";

const ProjectSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [showApiKey, setShowApiKey] = useState(false);
    const [settings, setSettings] = useState({
        general: {
            projectName: "StockFlow Pro Projects",
            description: "Comprehensive project management system",
            timezone: "UTC-5",
            dateFormat: "MM/DD/YYYY",
            workingHours: "9:00 AM - 5:00 PM"
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            taskReminders: true,
            deadlineAlerts: true,
            teamUpdates: false,
            weeklyReports: true
        },
        permissions: {
            allowGuestAccess: false,
            requireApproval: true,
            autoAssignTasks: false,
            allowFileSharing: true,
            enableComments: true,
            allowTimeTracking: true
        },
        integrations: {
            slackEnabled: false,
            teamsEnabled: true,
            googleCalendar: true,
            jiraSync: false,
            githubIntegration: false
        }
    });

    const tabs = [
        { key: 'general', label: 'General', icon: Settings },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'permissions', label: 'Permissions', icon: Shield },
        { key: 'integrations', label: 'Integrations', icon: Globe },
        { key: 'security', label: 'Security', icon: Key }
    ];

    const handleSettingChange = (category: string, setting: string, value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: value
            }
        }));
    };

    const handleSave = () => {
        // Save settings logic would go here
        console.log('Settings saved:', settings);
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
                        <Settings className="h-4 w-4" />
                        <span>Project Settings</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-gray-500 to-slate-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Project Settings
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Configure project settings, preferences, and system integrations
                            </p>
                        </div>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                                                activeTab === tab.key
                                                    ? 'bg-gray-100 text-gray-900 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                            {/* General Settings */}
                            {activeTab === 'general' && (
                                <div className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Project Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.general.projectName}
                                                onChange={(e) => handleSettingChange('general', 'projectName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={settings.general.description}
                                                onChange={(e) => handleSettingChange('general', 'description', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={settings.general.timezone}
                                                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                                >
                                                    <option value="UTC-5">UTC-5 (Eastern)</option>
                                                    <option value="UTC-6">UTC-6 (Central)</option>
                                                    <option value="UTC-7">UTC-7 (Mountain)</option>
                                                    <option value="UTC-8">UTC-8 (Pacific)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date Format
                                                </label>
                                                <select
                                                    value={settings.general.dateFormat}
                                                    onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                                >
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Working Hours
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.general.workingHours}
                                                onChange={(e) => handleSettingChange('general', 'workingHours', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Settings */}
                            {activeTab === 'notifications' && (
                                <div className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                                    <div className="space-y-6">
                                        {Object.entries(settings.notifications).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        {key.includes('email') && <Mail className="h-4 w-4 text-gray-600" />}
                                                        {key.includes('push') && <Smartphone className="h-4 w-4 text-gray-600" />}
                                                        {key.includes('task') && <Clock className="h-4 w-4 text-gray-600" />}
                                                        {key.includes('deadline') && <AlertCircle className="h-4 w-4 text-gray-600" />}
                                                        {key.includes('team') && <Users className="h-4 w-4 text-gray-600" />}
                                                        {key.includes('weekly') && <Bell className="h-4 w-4 text-gray-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {key === 'emailNotifications' && 'Receive notifications via email'}
                                                            {key === 'pushNotifications' && 'Receive push notifications on your device'}
                                                            {key === 'taskReminders' && 'Get reminders for upcoming tasks'}
                                                            {key === 'deadlineAlerts' && 'Alerts for approaching deadlines'}
                                                            {key === 'teamUpdates' && 'Updates about team activities'}
                                                            {key === 'weeklyReports' && 'Weekly project summary reports'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('notifications', key, !value)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        value ? 'bg-gray-600' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            value ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Permissions Settings */}
                            {activeTab === 'permissions' && (
                                <div className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Permission Settings</h2>
                                    <div className="space-y-6">
                                        {Object.entries(settings.permissions).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Shield className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {key === 'allowGuestAccess' && 'Allow guest users to view projects'}
                                                            {key === 'requireApproval' && 'Require approval for new team members'}
                                                            {key === 'autoAssignTasks' && 'Automatically assign tasks to team members'}
                                                            {key === 'allowFileSharing' && 'Enable file sharing between team members'}
                                                            {key === 'enableComments' && 'Allow comments on tasks and projects'}
                                                            {key === 'allowTimeTracking' && 'Enable time tracking for tasks'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('permissions', key, !value)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        value ? 'bg-gray-600' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            value ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Integrations Settings */}
                            {activeTab === 'integrations' && (
                                <div className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Integration Settings</h2>
                                    <div className="space-y-6">
                                        {Object.entries(settings.integrations).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Globe className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {key === 'slackEnabled' && 'Connect with Slack for team communication'}
                                                            {key === 'teamsEnabled' && 'Integrate with Microsoft Teams'}
                                                            {key === 'googleCalendar' && 'Sync deadlines with Google Calendar'}
                                                            {key === 'jiraSync' && 'Synchronize with Jira for issue tracking'}
                                                            {key === 'githubIntegration' && 'Connect with GitHub repositories'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {value ? 'Connected' : 'Disconnected'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleSettingChange('integrations', key, !value)}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                            value 
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {value ? 'Disconnect' : 'Connect'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Security Settings */}
                            {activeTab === 'security' && (
                                <div className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info className="h-4 w-4 text-yellow-600" />
                                                <p className="font-medium text-yellow-800">API Access</p>
                                            </div>
                                            <p className="text-sm text-yellow-700 mb-3">
                                                Use this API key to integrate with external services. Keep it secure and don't share it publicly.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type={showApiKey ? "text" : "password"}
                                                        value="sk-proj-1234567890abcdef"
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                    />
                                                    <button
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                                    Regenerate
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-medium text-gray-900">Security Options</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                                    </div>
                                                    <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                                        Enable
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Session Timeout</p>
                                                        <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                                                    </div>
                                                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                                                        <option value="30">30 minutes</option>
                                                        <option value="60">1 hour</option>
                                                        <option value="120">2 hours</option>
                                                        <option value="480">8 hours</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Data Backup</p>
                                                        <p className="text-sm text-gray-600">Automatically backup project data</p>
                                                    </div>
                                                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                        Configure
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettings;