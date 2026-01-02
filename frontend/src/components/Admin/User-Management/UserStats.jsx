// components/users/UserStats.jsx
import React from 'react';
import { Users, CheckCircle, Star, ShoppingBag } from 'lucide-react';

const UserStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100',
      description: 'Registered users'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-50 to-green-100',
      description: 'Currently active'
    },
    {
      title: 'Admin Users',
      value: stats?.adminUsers || 0,
      icon: Star,
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100',
      description: 'Administrators'
    },
    {
      title: 'Avg. Orders',
      value: stats?.avgOrders?.toFixed(1) || '0.0',
      icon: ShoppingBag,
      color: 'amber',
      gradient: 'from-amber-50 to-amber-100',
      description: 'Per user'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{stat.title}</h3>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600 mt-2">{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default UserStats;