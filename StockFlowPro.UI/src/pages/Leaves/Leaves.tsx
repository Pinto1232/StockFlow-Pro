import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    CalendarX,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Filter,
    Download,
    RefreshCw,
    Eye,
    Edit,
    User,
} from "lucide-react";

interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: string;
    approvedBy?: string;
}

const Leaves: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Mock data - in a real app, this would come from an API
    const leaveRequests: LeaveRequest[] = [
        {
            id: '1',
            employeeName: 'John Doe',
            employeeId: 'EMP001',
            leaveType: 'Annual Leave',
            startDate: '2024-08-10',
            endDate: '2024-08-14',
            days: 5,
            reason: 'Family vacation',
            status: 'approved',
            appliedDate: '2024-07-25',
            approvedBy: 'Sarah Wilson'
        },
        {
            id: '2',
            employeeName: 'Jane Smith',
            employeeId: 'EMP002',
            leaveType: 'Sick Leave',
            startDate: '2024-08-05',
            endDate: '2024-08-06',
            days: 2,
            reason: 'Medical appointment',
            status: 'pending',
            appliedDate: '2024-08-04'
        },
        {
            id: '3',
            employeeName: 'Mike Brown',
            employeeId: 'EMP003',
            leaveType: 'Personal Leave',
            startDate: '2024-08-12',
            endDate: '2024-08-12',
            days: 1,
            reason: 'Personal matters',
            status: 'rejected',
            appliedDate: '2024-08-01'
        },
        {
            id: '4',
            employeeName: 'Sarah Wilson',
            employeeId: 'EMP004',
            leaveType: 'Maternity Leave',
            startDate: '2024-09-01',
            endDate: '2024-12-01',
            days: 90,
            reason: 'Maternity leave',
            status: 'approved',
            appliedDate: '2024-07-15',
            approvedBy: 'Admin'
        },
        {
            id: '5',
            employeeName: 'David Johnson',
            employeeId: 'EMP005',
            leaveType: 'Emergency Leave',
            startDate: '2024-08-08',
            endDate: '2024-08-09',
            days: 2,
            reason: 'Family emergency',
            status: 'approved',
            appliedDate: '2024-08-07',
            approvedBy: 'Sarah Wilson'
        }
    ];

    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const filteredRequests = selectedStatus === 'all' 
        ? leaveRequests 
        : leaveRequests.filter(req => req.status === selectedStatus);

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
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <CalendarX className="h-4 w-4" />
                        <span>Leaves</span>
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
                                    Leave Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Manage employee leave requests, track leave balances, and approve time off
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Apply Leave
                            </button>
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">
                                <Download className="w-5 h-5" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Leave Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Requests Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    TOTAL
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Total Requests</h5>
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {totalRequests}
                            </div>
                            <div className="flex items-center text-blue-600 text-sm">
                                <span>This month</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    PENDING
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Pending</h5>
                            <div className="text-3xl font-bold text-yellow-600 mb-2">
                                {pendingRequests}
                            </div>
                            <div className="flex items-center text-yellow-600 text-sm">
                                <span>Awaiting approval</span>
                            </div>
                        </div>
                    </div>

                    {/* Approved Requests Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    APPROVED
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Approved</h5>
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {approvedRequests}
                            </div>
                            <div className="flex items-center text-green-600 text-sm">
                                <span>{Math.round((approvedRequests / totalRequests) * 100)}% approval rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Rejected Requests Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    REJECTED
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Rejected</h5>
                            <div className="text-3xl font-bold text-red-600 mb-2">
                                {rejectedRequests}
                            </div>
                            <div className="flex items-center text-red-600 text-sm">
                                <span>{Math.round((rejectedRequests / totalRequests) * 100)}% rejection rate</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Leave Requests Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">Leave Requests</h3>
                        <p className="text-gray-600 mt-1">Manage and track all employee leave requests</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leave Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applied Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.employeeName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.employeeId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {request.leaveType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {request.days} {request.days === 1 ? 'day' : 'days'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(request.status)}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(request.appliedDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button className="text-green-600 hover:text-green-900 transition-colors">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 transition-colors">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leave Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Leave Types Distribution */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Leave Types Distribution</h3>
                            <CalendarX className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Annual Leave</span>
                                <span className="font-semibold text-blue-600">45%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Sick Leave</span>
                                <span className="font-semibold text-green-600">25%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Personal Leave</span>
                                <span className="font-semibold text-yellow-600">15%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Emergency Leave</span>
                                <span className="font-semibold text-orange-600">10%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Maternity/Paternity</span>
                                <span className="font-semibold text-purple-600">5%</span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Leave Trends */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Monthly Leave Trends</h3>
                            <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">January</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">12 days</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">February</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">9 days</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">March</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">15 days</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">April</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">18 days</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">May</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">13 days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Leave Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for Leave</h3>
                        <p className="text-gray-600 mb-6">Leave application form would go here</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Apply Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;