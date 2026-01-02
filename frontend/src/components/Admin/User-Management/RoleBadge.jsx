// components/users/RoleBadge.jsx
import React from 'react';

const RoleBadge = ({ role }) => {
  const roleConfig = {
    user: { 
      color: 'bg-blue-100 text-blue-800',
      label: 'User' 
    },
    admin: { 
      color: 'bg-red-100 text-red-800',
      label: 'Admin' 
    },
    // Keep these for compatibility if needed
    customer: { 
      color: 'bg-blue-100 text-blue-800',
      label: 'Customer' 
    },
    premium: { 
      color: 'bg-purple-100 text-purple-800',
      label: 'Premium' 
    },
    vip: { 
      color: 'bg-amber-100 text-amber-800',
      label: 'VIP' 
    }
  };

  const config = roleConfig[role] || roleConfig.user;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default RoleBadge;