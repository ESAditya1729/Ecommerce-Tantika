import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  Award,
  Moon,
  Sun,
  UserCircle
} from 'lucide-react';

const ArtisanSidebar = ({ isOpen, onClose, currentTab, onTabChange, stats, onCollapse, userName = "Artisan" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Emit custom event for the main layout
    window.dispatchEvent(new CustomEvent('sidebarCollapsed', { 
      detail: { collapsed: newState }
    }));
    
    // Call the onCollapse prop if provided
    if (onCollapse) {
      onCollapse(newState);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navigation = [
    { 
      name: 'Overview', 
      icon: Home, 
      id: 'overview',
      description: 'Dashboard & insights',
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      name: 'Products', 
      icon: Package, 
      id: 'products', 
      badge: stats?.pendingApproval,
      description: 'Manage your products',
      gradient: 'from-blue-500 to-indigo-500'
    },
    { 
      name: 'Orders', 
      icon: ShoppingBag, 
      id: 'orders', 
      badge: stats?.activeOrders,
      description: 'Track & manage orders',
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      id: 'analytics',
      description: 'Performance metrics',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      id: 'settings',
      description: 'Account preferences',
      gradient: 'from-gray-500 to-slate-500'
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('tantika_user');
    localStorage.removeItem('tantika_token');
    window.location.href = '/login';
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
          <SidebarContent 
            navigation={navigation}
            currentTab={currentTab}
            onTabChange={handleTabClick}
            onClose={onClose}
            onLogout={handleLogout}
            isCollapsed={false}
            showToggle={false}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            userName={userName}
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-500 ease-in-out ${
          isCollapsed ? 'lg:w-24' : 'lg:w-72'
        }`}
        style={{ zIndex: 40 }}
      >
        <div className="relative flex flex-col flex-1 min-h-0 bg-white/90 backdrop-blur-xl border-r border-amber-100/50 shadow-2xl">
          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-24 bg-white border-2 border-amber-200 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group z-20"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? 
              <ChevronRight size={18} className="text-amber-600 group-hover:text-amber-700" /> : 
              <ChevronLeft size={18} className="text-amber-600 group-hover:text-amber-700" />
            }
          </button>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
          
          <SidebarContent 
            navigation={navigation}
            currentTab={currentTab}
            onTabChange={handleTabClick}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            showToggle={true}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            userName={userName}
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ 
  navigation, 
  currentTab, 
  onTabChange, 
  onClose, 
  onLogout, 
  isCollapsed, 
  showToggle,
  hoveredItem,
  setHoveredItem,
  showTooltip,
  setShowTooltip,
  userName,
  toggleDarkMode,
  isDarkMode
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getTabStyles = (tabId) => {
    const isActive = currentTab === tabId;
    const isHovered = hoveredItem === tabId;
    
    return `group relative flex items-center w-full rounded-xl transition-all duration-300 ${
      isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
    } ${
      isActive 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 scale-105' 
        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
    } ${isHovered && !isActive ? 'bg-amber-50/80' : ''}`;
  };

  const getIconStyles = (tabId) => {
    const isActive = currentTab === tabId;
    return `flex-shrink-0 transition-all duration-300 ${
      isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
    } ${
      isActive 
        ? 'text-white animate-pulse' 
        : 'text-gray-400 group-hover:text-amber-500 group-hover:scale-110'
    }`;
  };

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onLogout();
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Logo Section with Glass Effect */}
      <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-24 px-4 overflow-hidden flex-shrink-0`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 opacity-90" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}} />
        
        {isCollapsed ? (
          <div className="relative">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Award className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Artisan's Studio</h1>
                  <p className="text-xs text-white/80 mt-0.5">Crafting Excellence</p>
                </div>
              </div>
            </div>
            {onClose && (
              <button 
                onClick={onClose} 
                className="relative p-2 hover:bg-white/20 rounded-xl transition-all duration-200 lg:hidden group"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>
            )}
          </>
        )}
      </div>

      {/* User Profile Summary */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-amber-100/50 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 bg-amber-50/50 rounded-xl">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">Artisan • Premium</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
        {navigation.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onTabChange(item.id)}
                onMouseEnter={() => {
                  setHoveredItem(item.id);
                  if (isCollapsed) setShowTooltip(item.id);
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setShowTooltip(null);
                }}
                className={getTabStyles(item.id)}
                aria-label={isCollapsed ? item.name : undefined}
              >
                <Icon className={getIconStyles(item.id)} />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                    {item.badge > 0 && (
                      <div className="relative">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                          isActive 
                            ? 'bg-white text-amber-600' 
                            : 'bg-amber-100 text-amber-600'
                        }`}>
                          {item.badge}
                        </span>
                        <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/30" />
                      </div>
                    )}
                  </>
                )}

                {isCollapsed && item.badge > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && showTooltip === item.id && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-xl animate-fadeIn">
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{item.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-2 border-t border-amber-100/50 bg-gradient-to-t from-amber-50/30 to-transparent flex-shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`group flex items-center w-full rounded-xl transition-all duration-300 hover:bg-amber-100 ${
            isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
          }`}
          title={isCollapsed ? 'Toggle theme' : ''}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className={`flex-shrink-0 transition-all duration-300 ${
              isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
            } text-amber-500 group-hover:rotate-90`} />
          ) : (
            <Moon className={`flex-shrink-0 transition-all duration-300 ${
              isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
            } text-gray-400 group-hover:text-amber-500 group-hover:rotate-12`} />
          )}
          {!isCollapsed && <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Theme</span>}
        </button>

        {/* Notifications */}
        <button
          className={`group relative flex items-center w-full rounded-xl transition-all duration-300 hover:bg-amber-100 ${
            isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
          }`}
          title={isCollapsed ? 'Notifications' : ''}
          aria-label="Notifications"
        >
          <Bell className={`flex-shrink-0 transition-all duration-300 ${
            isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
          } text-gray-400 group-hover:text-amber-500 group-hover:scale-110`} />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Notifications</span>
              <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                3
              </span>
            </>
          )}
          {isCollapsed && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className={`group relative flex items-center w-full rounded-xl transition-all duration-300 hover:bg-red-50 overflow-hidden ${
            isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
          }`}
          title={isCollapsed ? 'Logout' : ''}
          aria-label="Logout"
        >
          {isLoggingOut && (
            <div className="absolute inset-0 bg-red-500 animate-pulse" />
          )}
          <LogOut className={`flex-shrink-0 transition-all duration-300 relative z-10 ${
            isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
          } text-gray-400 group-hover:text-red-500 group-hover:translate-x-1`} />
          {!isCollapsed && (
            <span className="relative z-10 text-sm font-medium text-gray-600 group-hover:text-red-600">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          )}
        </button>

        {/* Version Info */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <p className="text-xs text-gray-400">Version 2.0.0</p>
            <p className="text-xs text-gray-300">© 2024 Artisan's Studio</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanSidebar;