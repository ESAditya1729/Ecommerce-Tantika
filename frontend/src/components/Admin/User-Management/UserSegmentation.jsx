// components/users/UserSegmentation.jsx
import React from 'react';
import { Users, TrendingUp, UserCheck, UserX } from 'lucide-react';

const UserSegmentation = ({ segments, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const segmentCards = [
    {
      title: 'User Segments',
      icon: Users,
      gradient: 'from-blue-50 to-blue-100',
      items: [
        {
          label: 'New Users (30 days)',
          count: segments?.newUsers || 0,
          color: 'bg-blue-100 text-blue-800'
        },
        {
          label: 'Active Users',
          count: segments?.activeUsers || 0,
          color: 'bg-green-100 text-green-800'
        },
        {
          label: 'Inactive Users',
          count: segments?.inactiveUsers || 0,
          color: 'bg-yellow-100 text-yellow-800'
        }
      ]
    },
    {
      title: 'Quick Actions',
      icon: TrendingUp,
      gradient: 'from-purple-50 to-purple-100',
      items: [
        { label: 'Send Newsletter', action: 'newsletter', color: 'bg-purple-600' },
        { label: 'Export User Data', action: 'export', color: 'bg-blue-600' },
        { label: 'Create User Segment', action: 'segment', color: 'bg-green-600' }
      ]
    },
    {
      title: 'Admin Users',
      icon: UserCheck,
      gradient: 'from-green-50 to-green-100',
      items: segments?.topCustomers || []
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {segmentCards.map((card, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${card.gradient} p-6 rounded-xl`}
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            {card.title}
          </h3>
          
          <div className="space-y-3">
            {card.title === 'User Segments' && card.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={`px-3 py-1 ${item.color} text-sm rounded-full`}>
                  {item.count}
                </span>
              </div>
            ))}
            
            {card.title === 'Quick Actions' && card.items.map((item, i) => (
              <button
                key={i}
                className={`w-full px-4 py-3 ${item.color} text-white rounded-lg hover:opacity-90 text-sm font-medium transition-opacity`}
                onClick={() => console.log(`Action: ${item.action}`)}
              >
                {item.label}
              </button>
            ))}
            
            {card.title === 'Admin Users' && card.items.map((user, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.name || user.username}</p>
                    <p className="text-xs text-gray-500">{user.totalOrders || 0} orders</p>
                  </div>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSegmentation;