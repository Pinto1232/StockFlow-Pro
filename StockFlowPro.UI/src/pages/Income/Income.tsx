import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    DollarSign,
    TrendingUp,
    Calendar,
    BarChart3,
    PieChart,
    Plus,
    Filter,
    Download,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";

interface IncomeRecord {
    id: string;
    source: string;
    amount: number;
    date: string;
    category: string;
    description: string;
    status: 'received' | 'pending' | 'overdue';
}

const Income: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock data - in a real app, this would come from an API
    const incomeRecords: IncomeRecord[] = [
        {
            id: '1',
            source: 'Product Sales',
            amount: 15420.50,
            date: '2024-08-04',
            category: 'Sales',
            description: 'Monthly product sales revenue',
            status: 'received'
        },
        {
            id: '2',
            source: 'Service Contracts',
            amount: 8750.00,
            date: '2024-08-03',
            category: 'Services',
            description: 'Consulting and maintenance services',
            status: 'received'
        },
        {
            id: '3',
            source: 'Subscription Revenue',
            amount: 2340.00,
            date: '2024-08-02',
            category: 'Recurring',
            description: 'Monthly subscription payments',
            status: 'pending'
        },
        {
            id: '4',
            source: 'Investment Returns',
            amount: 1250.75,
            date: '2024-08-01',
            category: 'Investments',
            description: 'Quarterly investment dividends',
            status: 'received'
        },
        {
            id: '5',
            source: 'License Fees',
            amount: 5600.00,
            date: '2024-07-30',
            category: 'Licensing',
            description: 'Software licensing revenue',
            status: 'overdue'
        }
    ];

    const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
    const receivedIncome = incomeRecords
        .filter(record => record.status === 'received')
        .reduce((sum, record) => sum + record.amount, 0);
    const pendingIncome = incomeRecords
        .filter(record => record.status === 'pending')
        .reduce((sum, record) => sum + record.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>Income</span>
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
                                    Income Management
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Track and manage your revenue streams, income sources, and financial performance
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Add Income
                            </button>
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">
                                <Download className="w-5 h-5" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Income Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Income Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    TOTAL
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Total Income</h5>
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {formatCurrency(totalIncome)}
                            </div>
                            <div className="flex items-center text-green-600 text-sm">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>+12.5% from last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Received Income Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    RECEIVED
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Received</h5>
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {formatCurrency(receivedIncome)}
                            </div>
                            <div className="flex items-center text-blue-600 text-sm">
                                <span>{Math.round((receivedIncome / totalIncome) * 100)}% of total</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Income Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    PENDING
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">Pending</h5>
                            <div className="text-3xl font-bold text-yellow-600 mb-2">
                                {formatCurrency(pendingIncome)}
                            </div>
                            <div className="flex items-center text-yellow-600 text-sm">
                                <span>{Math.round((pendingIncome / totalIncome) * 100)}% of total</span>
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
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
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

                {/* Income Records Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">Income Records</h3>
                        <p className="text-gray-600 mt-1">Detailed view of all income transactions</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Source
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {incomeRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.source}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {record.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {formatCurrency(record.amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(record.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {record.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Income Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Income by Category Chart Placeholder */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Income by Category</h3>
                            <PieChart className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Chart visualization would go here</p>
                            </div>
                        </div>
                    </div>

                    {/* Income Trend Chart Placeholder */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Income Trend</h3>
                            <BarChart3 className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Trend chart would go here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Income Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Income</h3>
                        <p className="text-gray-600 mb-6">Income form would go here</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Add Income
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Income;