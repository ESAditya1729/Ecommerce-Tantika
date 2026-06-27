// components/ArtisanDashboard/ArtisanHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Loader,
  Check,
  ShoppingBag,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ArtisanHeader = ({ 
  onMenuClick, 
  artisan, 
  sidebarCollapsed = false,
  onTabChange // ========== NEW PROP ==========
}) => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Fetch unread count periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('tantika_token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setLoadingNotifications(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/artisan?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    setShowNotifications(false);
    
    // Navigate based on notification type
    if (notification.data?.orderId) {
      navigate(`/dashboard/orders/${notification.data.orderId}`);
    } else if (notification.data?.productId) {
      navigate(`/dashboard/products/${notification.data.productId}`);
    } else if (notification.data?.payoutId) {
      navigate(`/dashboard/payouts/${notification.data.payoutId}`);
    }
  };

  // ========== FIXED: Handle "View all notifications" click ==========
  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    if (onTabChange) {
      onTabChange('notifications');
    } else {
      // Fallback: navigate to notifications page if onTabChange not provided
      navigate('/dashboard/notifications');
    }
  };

  const getNotificationIcon = (templateId) => {
    const icons = {
      'order_placed': <ShoppingBag className="w-4 h-4 text-blue-500" />,
      'order_status_update': <Truck className="w-4 h-4 text-purple-500" />,
      'order_cancelled': <X className="w-4 h-4 text-red-500" />,
      'product_approved': <CheckCircle className="w-4 h-4 text-green-500" />,
      'product_rejected': <AlertCircle className="w-4 h-4 text-red-500" />,
      'product_submitted': <Package className="w-4 h-4 text-yellow-500" />,
      'low_stock_alert': <AlertCircle className="w-4 h-4 text-orange-500" />,
      'payout_processed': <CheckCircle className="w-4 h-4 text-green-500" />,
      'payout_failed': <AlertCircle className="w-4 h-4 text-red-500" />,
      'account_approved': <CheckCircle className="w-4 h-4 text-green-500" />,
      'account_rejected': <AlertCircle className="w-4 h-4 text-red-500" />,
      'system_announcement': <Bell className="w-4 h-4 text-amber-500" />,
      'new_message': <MessageSquare className="w-4 h-4 text-blue-500" />
    };
    return icons[templateId] || <Bell className="w-4 h-4 text-gray-500" />;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeFull = (date) => {
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

  // Calculate header width based on sidebar state
  const getHeaderWidthClass = () => {
    if (typeof window === 'undefined') return '';
    if (window.innerWidth < 1024) return 'w-full';
    return sidebarCollapsed ? 'lg:w-[calc(100%-6rem)]' : 'lg:w-[calc(100%-18rem)]';
  };

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
          
          <div className="flex items-center gap-3">
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

        {/* Center section - Search */}
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
                  {formatTimeFull(currentDateTime)}
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
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={markingAll}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        {markingAll ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer - FIXED: View all notifications button */}
                <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleViewAllNotifications}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                  <p className="text-sm font-semibold text-gray-900">{artisan?.username || 'Artisan'}</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{artisan?.email || 'artisan@tantika.com'}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/dashboard/profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors group"
                  >
                    <User size={16} className="text-gray-400 group-hover:text-amber-600" />
                    <span>Profile Settings</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/dashboard/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors group"
                  >
                    <Settings size={16} className="text-gray-400 group-hover:text-amber-600" />
                    <span>Account Settings</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/dashboard/support');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors group"
                  >
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
            {formatTimeFull(currentDateTime)}
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
    </header>
  );
};

export default ArtisanHeader;