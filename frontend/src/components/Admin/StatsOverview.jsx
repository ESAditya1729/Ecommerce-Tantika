import React from 'react';
import { DollarSign, Package, Users, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      change: stats.revenueGrowth,
      color: 'green',
      description: 'From all orders'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-6 h-6" />,
      change: stats.orderGrowth,
      color: 'blue',
      description: 'Processed orders'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="w-6 h-6" />,
      change: 8.2,
      color: 'purple',
      description: 'Active listings'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      change: 5.7,
      color: 'orange',
      description: 'Registered users'
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Business Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <div className={`text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-900 mb-1">{stat.title}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">This Month</span>
                <span className="font-medium text-gray-900">+15.3%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-blue-900">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">Need immediate attention</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Today's Orders</p>
              <p className="text-2xl font-bold text-green-900">{stats.todayOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Delivered successfully</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Avg. Rating</p>
              <p className="text-2xl font-bold text-purple-900">4.8/5.0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">Based on 156 reviews</p>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;