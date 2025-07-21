import React from 'react';
import { Package, Users, FileText, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data - replace with real data from API
  const stats = [
    {
      name: 'Total Products',
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      icon: Package,
    },
    {
      name: 'Total Users',
      value: '89',
      change: '+5%',
      changeType: 'increase',
      icon: Users,
    },
    {
      name: 'Total Invoices',
      value: '456',
      change: '+8%',
      changeType: 'increase',
      icon: FileText,
    },
    {
      name: 'Total Revenue',
      value: '$12,345',
      change: '+15%',
      changeType: 'increase',
      icon: DollarSign,
    },
  ];

  const lowStockProducts = [
    { name: 'Product A', stock: 5 },
    { name: 'Product B', stock: 3 },
    { name: 'Product C', stock: 8 },
  ];

  const recentActivity = [
    { action: 'New product added', time: '2 hours ago' },
    { action: 'User registered', time: '4 hours ago' },
    { action: 'Invoice generated', time: '6 hours ago' },
    { action: 'Stock updated', time: '8 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low stock alerts */}
        <div className="card">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                <span className="text-sm text-orange-600 font-medium">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{activity.action}</span>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;