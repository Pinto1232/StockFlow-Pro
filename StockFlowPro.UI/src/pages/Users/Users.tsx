import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Users as UsersIcon,
    ArrowLeft,
    Plus,
    Search,
    X,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Shield,
    Mail,
    Calendar,
    Loader2,
} from "lucide-react";
import { useUsers } from "../../architecture/adapters/primary/hooks";
import { UserEntity } from "../../architecture/domain/entities/User";

interface UserFormData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    roleId: number;
}

interface UserUpdateData {
    [key: string]: unknown;
}

const Users: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<number | undefined>();
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const {
        // Data
        users,
        currentUser,
        totalUsers,
        currentPage,
        totalPages,

        // Loading states
        isLoading,
        isCreatingUser,
        isUpdatingUser,
        isDeletingUser,

        // Actions
        createUser,
        updateUser,
        deleteUser,
        activateUser,
        deactivateUser,
        updateFilters,
        clearFilters,

        // Errors
        createUserError,
        updateUserError,
        deleteUserError,
    } = useUsers();

    // Apply filters with default page size of 5
    React.useEffect(() => {
        updateFilters({
            search: searchQuery || undefined,
            roleId: roleFilter,
            isActive: statusFilter,
            page: 1,
            pageSize: 5, // Set default page size to 5
        });
    }, [searchQuery, roleFilter, statusFilter, updateFilters]);

    const handleCreateUser = (userData: UserFormData) => {
        createUser({
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password,
            roleId: userData.roleId,
        });
        setShowCreateModal(false);
    };

    const handleUpdateUser = (userId: string, userData: UserUpdateData) => {
        updateUser({
            id: userId,
            ...userData,
        });
        setShowEditModal(false);
        setSelectedUserId(null);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(parseInt(userId));
        }
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page, pageSize: 5 });
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setRoleFilter(undefined);
        setStatusFilter(undefined);
        clearFilters();
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            case 'manager':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'user':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getStatusBadgeColor = (isActive: boolean) => {
        return isActive
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center gap-2 text-sm">
                    <li className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium"
                        >
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <span className="text-gray-400">/</span>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <UsersIcon className="h-4 w-4" />
                        <span>User Management</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    User Management
                                </h1>
                            </div>
                            <p className="text-gray-600">
                                Manage user accounts, roles, and permissions
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                                disabled={isCreatingUser}
                            >
                                <Plus className="h-4 w-4" />
                                {isCreatingUser ? 'Creating...' : 'Add New User'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <UsersIcon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Total Users
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {totalUsers}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-2xl"></div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <UserCheck className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Active Users
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: UserEntity) => u.isActive).length}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-600 rounded-r-2xl"></div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <UserX className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Inactive Users
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: UserEntity) => !u.isActive).length}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-600 rounded-r-2xl"></div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Shield className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Admins
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: UserEntity) => u.roleInfo.name === 'Admin').length}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600 rounded-r-2xl"></div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, username, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={roleFilter || ''}
                                onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : undefined)}
                                className="appearance-none bg-white px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer min-w-[140px]"
                            >
                                <option value="">All Roles</option>
                                <option value="1">Admin</option>
                                <option value="2">User</option>
                                <option value="3">Manager</option>
                            </select>
                            <select
                                value={statusFilter === undefined ? '' : statusFilter.toString()}
                                onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                                className="appearance-none bg-white px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer min-w-[140px]"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Messages */}
                {(createUserError || updateUserError || deleteUserError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">
                            {createUserError?.message || updateUserError?.message || deleteUserError?.message}
                        </p>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white border-0 rounded-2xl shadow-lg mx-6 overflow-hidden">
                    <div className="p-0">
                        <div className="rounded-2xl overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">
                                        Loading users...
                                    </p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <UsersIcon className="h-12 w-12 text-gray-300 mb-4" />
                                    <h5 className="text-lg font-semibold text-gray-600 mb-2">
                                        No users found
                                    </h5>
                                    <p className="text-gray-500">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full m-0 border-separate border-spacing-0">
                                    <thead>
                                        <tr>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                User
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Role
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Status
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Created
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Last Login
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user: UserEntity, index: number) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-[#f8fafc] transition-colors duration-200"
                                            >
                                                <td className={`align-middle text-sm p-4 ${index !== users.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {user.displayName}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {user.email}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                @{user.username}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`align-middle text-sm p-4 ${index !== users.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${getRoleBadgeColor(user.roleInfo.name)}`}>
                                                        <Shield className="h-3 w-3" />
                                                        {user.roleInfo.name}
                                                    </span>
                                                </td>
                                                <td className={`align-middle text-sm p-4 ${index !== users.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusBadgeColor(user.isActive)}`}>
                                                        {user.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className={`align-middle text-sm p-4 ${index !== users.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className={`align-middle text-sm p-4 ${index !== users.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}>
                                                    {user.lastLoginAt ? (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            {formatDate(user.lastLoginAt)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Never</span>
                                                    )}
                                                </td>
                                                <td className={`align-middle text-sm p-4 ${index !== users.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-right`}>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUserId(user.id);
                                                                setShowEditModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                                                            disabled={isUpdatingUser}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            Edit
                                                        </button>
                                                        
                                                        {user.isActive ? (
                                                            <button
                                                                onClick={() => deactivateUser(parseInt(user.id))}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium"
                                                                disabled={currentUser?.id === user.id}
                                                            >
                                                                <UserX className="h-3 w-3" />
                                                                Deactivate
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => activateUser(parseInt(user.id))}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                                                            >
                                                                <UserCheck className="h-3 w-3" />
                                                                Activate
                                                            </button>
                                                        )}
                                                        
                                                        {currentUser?.id !== user.id && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                                                                disabled={isDeletingUser}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Footer with pagination - Enhanced to match Product Management style */}
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {totalUsers} user{totalUsers !== 1 ? "s" : ""} total
                            </span>
                            <span className="text-xs text-gray-500">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        {totalUsers > 5 && (
                            <nav aria-label="User pagination" className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="First page"
                                >
                                    ««
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Previous page"
                                >
                                    ‹
                                </button>
                                <ul className="flex gap-1 mb-0 text-sm">
                                    {(() => {
                                        const pages = [];
                                        const maxVisiblePages = 5;
                                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                        
                                        // Adjust start page if we're near the end
                                        if (endPage - startPage + 1 < maxVisiblePages) {
                                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                        }
                                        
                                        // Add first page and ellipsis if needed
                                        if (startPage > 1) {
                                            pages.push(
                                                <li key={1}>
                                                    <button
                                                        onClick={() => handlePageChange(1)}
                                                        className="px-3 py-1 rounded transition-colors bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                    >
                                                        1
                                                    </button>
                                                </li>
                                            );
                                            if (startPage > 2) {
                                                pages.push(
                                                    <li key="ellipsis1" className="px-2 py-1 text-gray-400">
                                                        ...
                                                    </li>
                                                );
                                            }
                                        }
                                        
                                        // Add visible page numbers
                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(
                                                <li key={i}>
                                                    <button
                                                        onClick={() => handlePageChange(i)}
                                                        className={`px-3 py-1 rounded transition-colors border ${
                                                            currentPage === i
                                                                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                                                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                                                        }`}
                                                    >
                                                        {i}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        
                                        // Add ellipsis and last page if needed
                                        if (endPage < totalPages) {
                                            if (endPage < totalPages - 1) {
                                                pages.push(
                                                    <li key="ellipsis2" className="px-2 py-1 text-gray-400">
                                                        ...
                                                    </li>
                                                );
                                            }
                                            pages.push(
                                                <li key={totalPages}>
                                                    <button
                                                        onClick={() => handlePageChange(totalPages)}
                                                        className="px-3 py-1 rounded transition-colors bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                    >
                                                        {totalPages}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        
                                        return pages;
                                    })()}
                                </ul>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Next page"
                                >
                                    ›
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Last page"
                                >
                                    »»
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateUser}
                    isLoading={isCreatingUser}
                />
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUserId && (
                <EditUserModal
                    userId={selectedUserId}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUserId(null);
                    }}
                    onSubmit={(userData) => handleUpdateUser(selectedUserId, userData)}
                    isLoading={isUpdatingUser}
                />
            )}
        </div>
    );
};

// Create User Modal Component
const CreateUserModal: React.FC<{
    onClose: () => void;
    onSubmit: (userData: UserFormData) => void;
    isLoading: boolean;
}> = ({ onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        roleId: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={formData.roleId}
                            onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={1}>User</option>
                            <option value={2}>Manager</option>
                            <option value={3}>Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit User Modal Component (simplified for brevity)
const EditUserModal: React.FC<{
    userId: string;
    onClose: () => void;
    onSubmit: (userData: UserUpdateData) => void;
    isLoading: boolean;
}> = ({ onClose, onSubmit, isLoading }) => {
    // This would fetch the user data and show an edit form
    // For brevity, showing a simple implementation
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                <p className="text-gray-600 mb-4">Edit user functionality would go here...</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit({})}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Users;