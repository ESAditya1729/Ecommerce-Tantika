import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  HeadphonesIcon, 
  Clock, 
  Bell, 
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
  Sparkles,
  Award,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArtisanHeader = ({ onMenuClick, artisan, sidebarCollapsed = false, unreadNotifications = 3 }) => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-menu') && !e.target.closest('.notification-menu')) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
      second: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(/[_\s]/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AR';
  };

  const handleSupportClick = () => {
    navigate('/contact');
  };

  const handleLogout = () => {
    localStorage.removeItem('tantika_user');
    localStorage.removeItem('tantika_token');
    window.location.href = '/login';
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const notifications = [
    { id: 1, title: 'New order received', time: '2 min ago', read: false, type: 'order' },
    { id: 2, title: 'Product approved', time: '1 hour ago', read: false, type: 'product' },
    { id: 3, title: 'Payment received', time: '3 hours ago', read: true, type: 'payment' },
    { id: 4, title: 'Customer message', time: '5 hours ago', read: true, type: 'message' },
  ];

  // Calculate header width based on sidebar state
  const getHeaderWidthClass = () => {
    if (typeof window === 'undefined') return '';
    if (window.innerWidth < 1024) return 'w-full';
    return sidebarCollapsed ? 'lg:w-[calc(100%-6rem)]' : 'lg:w-[calc(100%-18rem)]';
  };

  // Calculate header left position based on sidebar state
  const getHeaderLeftClass = () => {
    if (typeof window === 'undefined') return '';
    if (window.innerWidth < 1024) return 'left-0';
    return sidebarCollapsed ? 'lg:left-24' : 'lg:left-72';
  };

  return (
    <header 
      className={`
        fixed top-0 z-40
        ${getHeaderWidthClass()}
        ${getHeaderLeftClass()}
        transition-all duration-300 ease-in-out
        bg-white/90 backdrop-blur-xl 
        border-b border-amber-100/50 
        shadow-sm
        ${isScrolled ? 'shadow-md' : ''}
      `}
    >
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 xl:px-8 py-3">
        {/* Left section - Logo and Menu */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="p-2.5 rounded-xl text-gray-600 hover:bg-amber-50 lg:hidden transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          
          {/* Premium Logo - Hidden on mobile when menu is shown */}
          <div className={`${window.innerWidth < 1024 && onMenuClick ? 'hidden sm:flex' : 'flex'} items-center gap-3`}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                Tantika Artisan
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Award size={12} className="text-amber-500" />
                <span>Premium Artisan Dashboard</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center section - Search (hidden on mobile) */}
        <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
          <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 hidden lg:block"
            aria-label="Toggle theme"
          >
            {isDarkMode ? 
              <Sun size={18} className="text-amber-500" /> : 
              <Moon size={18} className="text-gray-600" />
            }
          </button>

          {/* Date & Time - Desktop */}
          <div className="hidden xl:flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border border-amber-100/50">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600 animate-pulse" />
              <div className="text-sm whitespace-nowrap">
                <span className="text-gray-600 font-medium">{formatDate(currentDateTime)}</span>
                <span className="text-amber-600 font-semibold ml-2 bg-amber-100/50 px-2 py-0.5 rounded-lg">
                  {formatTime(currentDateTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative notification-menu">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 relative group"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600 group-hover:text-amber-600" />
              {unreadNotifications > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell size={16} className="text-amber-600" />
                    Notifications
                  </h3>
                  <span className="text-xs text-amber-600 font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-4 border-b border-gray-50 hover:bg-amber-50/50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${!notif.read ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100">
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Support Button */}
          <button 
            onClick={handleSupportClick}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 group"
            aria-label="Support"
          >
            <HeadphonesIcon size={16} className="text-white" />
            <span className="text-sm font-medium text-white hidden xl:inline">
              Support
            </span>
            <Sparkles size={14} className="text-white/80 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Profile Menu */}
          <div className="relative profile-menu">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 lg:gap-3 p-1.5 lg:pr-3 rounded-xl hover:bg-amber-50 transition-all duration-200 group"
              aria-label="Profile menu"
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
                  <span className="text-sm font-bold text-white">
                    {getInitials(artisan?.username)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <span className="max-w-[120px] truncate">{artisan?.username || 'Artisan'}</span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </p>
                <p className="text-xs text-gray-500 max-w-[120px] truncate">{artisan?.email || 'artisan@tantika.com'}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                  <p className="text-sm font-semibold text-gray-900">{artisan?.username || 'Artisan'}</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{artisan?.email || 'artisan@tantika.com'}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors group">
                    <User size={16} className="text-gray-400 group-hover:text-amber-600" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors group">
                    <Settings size={16} className="text-gray-400 group-hover:text-amber-600" />
                    <span>Account Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors group">
                    <HelpCircle size={16} className="text-gray-400 group-hover:text-amber-600" />
                    <span>Help & Support</span>
                  </button>
                  <div className="border-t border-gray-100 my-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Date/Time Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-t border-amber-100/50">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-amber-600" />
          <span className="text-xs text-gray-600 font-medium">{formatDate(currentDateTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-600 bg-amber-100/50 px-2 py-1 rounded-lg">
            {formatTime(currentDateTime)}
          </span>
          <button 
            onClick={handleSupportClick}
            className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg"
          >
            <HeadphonesIcon size={12} className="text-amber-600" />
            <span className="text-xs text-amber-700">Support</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="hidden lg:flex items-center gap-4 xl:gap-6 px-4 lg:px-6 xl:px-8 py-2 bg-amber-50/30 border-t border-amber-100/50 text-xs overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-600">Today's Revenue:</span>
          <span className="font-semibold text-gray-900">₹12,450</span>
        </div>
        <div className="w-px h-4 bg-amber-200/50 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-600">Pending Orders:</span>
          <span className="font-semibold text-amber-600">8</span>
        </div>
        <div className="w-px h-4 bg-amber-200/50 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-600">Products Sold:</span>
          <span className="font-semibold text-gray-900">156</span>
        </div>
        <div className="w-px h-4 bg-amber-200/50 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-600">Avg. Rating:</span>
          <span className="font-semibold text-amber-600">4.8 ★</span>
        </div>
      </div>
    </header>
  );
};

export default ArtisanHeader;