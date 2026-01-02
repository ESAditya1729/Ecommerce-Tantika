import React from 'react';
import { STATUS_CONFIG } from './constants';

const QuickStats = ({ orders, onStatusFilter, loading }) => {
  const stats = [
    { status: 'pending', label: 'Pending' },
    { status: 'contacted', label: 'Contacted' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
    { status: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
      {stats.map((stat) => {
        const config = STATUS_CONFIG[stat.status];
        const count = orders.filter(o => o.status === stat.status).length;
        
        return (
          <button
            key={stat.status}
            onClick={() => onStatusFilter(stat.status)}
            disabled={loading}
            className={`p-4 border rounded-xl hover:opacity-90 transition-all disabled:opacity-50 ${config.bgColor}`}
          >
            <div className="text-2xl mb-2">{config.icon}</div>
            <p className="font-medium text-gray-900 text-sm">{stat.label}</p>
            <p className="text-xs text-gray-600">{count} orders</p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickStats;