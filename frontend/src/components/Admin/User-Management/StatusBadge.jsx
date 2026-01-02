// components/users/StatusBadge.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  return status === 'active' ? (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
      <CheckCircle className="w-3 h-3 mr-1" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
      Inactive
    </span>
  );
};

export default StatusBadge;