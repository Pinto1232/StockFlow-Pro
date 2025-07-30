import React from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    Users,
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    MapPin,
    Edit,
} from "lucide-react";

const EmployeeDirectory: React.FC = () => {
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
                        <Users className="h-4 w-4" />
                        <span>Employee Directory</span>
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
                                    Employee Directory
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                View and manage employee information, contacts, and organizational structure
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="w-4 h-4" />
                                <span>Add Employee</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search employees by name, department, or position..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Sales</option>
                            <option>Marketing</option>
                            <option>Operations</option>
                            <option>HR</option>
                        </select>
                        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>All Positions</option>
                            <option>Manager</option>
                            <option>Senior</option>
                            <option>Junior</option>
                            <option>Intern</option>
                        </select>
                    </div>
                </div>

                {/* Employee Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {/* Employee Card 1 */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">JD</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">John Doe</h3>
                            <p className="text-sm text-gray-600">Senior Software Engineer</p>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                                Engineering
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>john.doe@company.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>New York, NY</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                                <Edit className="w-4 h-4" />
                                <span>View Profile</span>
                            </button>
                        </div>
                    </div>

                    {/* Employee Card 2 */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">JS</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Jane Smith</h3>
                            <p className="text-sm text-gray-600">Marketing Manager</p>
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                                Marketing
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>jane.smith@company.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>+1 (555) 234-5678</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>Los Angeles, CA</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                                <Edit className="w-4 h-4" />
                                <span>View Profile</span>
                            </button>
                        </div>
                    </div>

                    {/* Employee Card 3 */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">MB</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Mike Brown</h3>
                            <p className="text-sm text-gray-600">Sales Director</p>
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                                Sales
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>mike.brown@company.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>+1 (555) 345-6789</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>Chicago, IL</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                                <Edit className="w-4 h-4" />
                                <span>View Profile</span>
                            </button>
                        </div>
                    </div>

                    {/* Employee Card 4 */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">SW</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Sarah Wilson</h3>
                            <p className="text-sm text-gray-600">HR Specialist</p>
                            <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                                Human Resources
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>sarah.wilson@company.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>+1 (555) 456-7890</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>Miami, FL</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                                <Edit className="w-4 h-4" />
                                <span>View Profile</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Department Summary */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Department Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600 mb-1">32</div>
                            <div className="text-sm text-blue-700 font-medium">Engineering</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <div className="text-2xl font-bold text-green-600 mb-1">18</div>
                            <div className="text-sm text-green-700 font-medium">Sales</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600 mb-1">24</div>
                            <div className="text-sm text-purple-700 font-medium">Marketing</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                            <div className="text-2xl font-bold text-orange-600 mb-1">15</div>
                            <div className="text-sm text-orange-700 font-medium">Operations</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl">
                            <div className="text-2xl font-bold text-teal-600 mb-1">8</div>
                            <div className="text-sm text-teal-700 font-medium">HR</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDirectory;