// frontend\src\components\ArtisanDashboard\ArtisanHeader.jsx
import React, { useState, useEffect } from 'react';
import { Menu, HeadphonesIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArtisanHeader = ({ onMenuClick, artisan }) => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      ?.split('_')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AR';
  };

  const handleSupportClick = () => {
    navigate('/contact');
  };

  return (
    <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick} 
            className="p-2 rounded-md text-gray-600 hover:bg-amber-50 lg:hidden transition-colors"
          >
            <Menu size={24} />
          </button>
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hidden sm:block">
              Tantika Artisan
            </span>
          </div>
        </div>

        {/* Right side - DateTime, Support, Profile */}
        <div className="flex items-center space-x-6">
          {/* Date and Time */}
          <div className="hidden md:flex items-center space-x-3 bg-amber-50 px-4 py-2 rounded-lg">
            <Clock size={18} className="text-amber-600" />
            <div className="text-sm">
              <span className="text-gray-600 font-medium">{formatDate(currentDateTime)}</span>
              <span className="text-amber-600 font-semibold ml-2">{formatTime(currentDateTime)}</span>
            </div>
          </div>

          {/* Support Button */}
          <button 
            onClick={handleSupportClick}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all duration-200 group"
          >
            <HeadphonesIcon size={18} className="text-amber-600 group-hover:text-amber-700" />
            <span className="text-sm font-medium text-amber-700 group-hover:text-amber-800 hidden sm:block">
              Support
            </span>
          </button>
          
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-sm font-medium text-white">
                {getInitials(artisan?.username)}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-800">{artisan?.username}</p>
              <p className="text-xs text-gray-500">{artisan?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Date/Time - visible only on small screens */}
      <div className="md:hidden flex items-center justify-between px-6 py-2 bg-amber-50/50 border-t border-amber-100">
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-amber-600" />
          <span className="text-xs text-gray-600">{formatDate(currentDateTime)}</span>
        </div>
        <span className="text-xs font-semibold text-amber-600">{formatTime(currentDateTime)}</span>
      </div>
    </header>
  );
};

export default ArtisanHeader;