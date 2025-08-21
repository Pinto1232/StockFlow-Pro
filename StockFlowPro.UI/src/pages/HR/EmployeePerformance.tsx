import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    UserCheck,
    TrendingUp,
    Award,
    Target,
    Calendar,
    BarChart3,
    Plus,
} from "lucide-react";
import { Projects } from "../../components/projects/Projects";
import { LoadingState } from "../../components/ui";
import { CountUp } from "../../components/ui";

const EmployeePerformance: React.FC = () => {
    // Temporary local loading simulation so LoadingState is visible; replace with real query state
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200); // simulate fetch
        return () => clearTimeout(timer);
    }, []);

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
                {isLoading && (
                    <div className="mb-8">
                        <LoadingState
                            variant="skeleton"
                            skeletonLines={4}
                            message="Loading performance metrics..."
                            className="w-full bg-gray-100/70 rounded-2xl p-6 border border-gray-200"
                        />
                    </div>
                )}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    AVERAGE
                                </span>
                            </div>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
                                <CountUp end={8.4} decimals={1} />
                            </h3>
                            <p className="text-gray-600 text-sm">Performance Score</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    TOP PERFORMERS
                                </span>
                            </div>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
                                <CountUp end={18} />
                            </h3>
                            <p className="text-gray-600 text-sm">High Achievers</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    GOALS
                                </span>
                            </div>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
                                <CountUp end={87} suffix="%" />
                            </h3>
                            <p className="text-gray-600 text-sm">Goals Achieved</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    REVIEWS
                                </span>
                            </div>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
                                <CountUp end={24} />
                            </h3>
                            <p className="text-gray-600 text-sm">Pending Reviews</p>
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                <Projects />
            </div>
        </div>
    );
};

export default EmployeePerformance;