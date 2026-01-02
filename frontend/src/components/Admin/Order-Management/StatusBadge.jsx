import React from 'react';
import { STATUS_CONFIG } from './constants';

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;