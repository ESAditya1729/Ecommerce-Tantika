import React from 'react';
import { Users, Clock, UserCheck, UserX, Ban, TrendingUp } from 'lucide-react';

const ArtisanStatsCards = ({ stats }) => {
  const statItems = [
    { 
      key: 'total', 
      label: 'Total Artisans', 
      icon: Users, 
      color: 'blue', 
      count: stats.total 
    },
    { 
      key: 'pending', 
      label: 'Pending', 
      icon: Clock, 
      color: 'yellow', 
      count: stats.pending,
      badge: stats.newApplications > 0 ? `+${stats.newApplications} new` : null 
    },
    { 
      key: 'approved', 
      label: 'Approved', 
      icon: UserCheck, 
      color: 'green', 
      count: stats.approved 
    },
    { 
      key: 'rejected', 
      label: 'Rejected', 
      icon: UserX, 
      color: 'red', 
      count: stats.rejected 
    },
    { 
      key: 'suspended', 
      label: 'Suspended', 
      icon: Ban, 
      color: 'gray', 
      count: stats.suspended 
    },
    { 
      key: 'newApplications', 
      label: 'New (7 days)', 
      icon: TrendingUp, 
      color: 'purple', 
      count: stats.newApplications 
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {statItems.map((stat) => (
        <div key={stat.key} className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className={`p-3 bg-${stat.color}-100 rounded-lg mr-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.count}</p>
              {stat.badge && (
                <p className="text-xs text-green-600">{stat.badge}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtisanStatsCards;