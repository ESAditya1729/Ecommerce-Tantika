// components/users/UserAvatar.jsx
import React from 'react';

const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U';
  const avatarUrl = user?.avatar || null;
  
  if (avatarUrl) {
    return (
      <img
        className={`${sizeClasses[size]} rounded-full`}
        src={avatarUrl}
        alt={user.name || user.username}
      />
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center`}>
      <span className="text-white font-bold">{initials}</span>
    </div>
  );
};

export default UserAvatar;