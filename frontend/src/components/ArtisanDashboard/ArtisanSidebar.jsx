// frontend\src\components\ArtisanDashboard\ArtisanSidebar.jsx
import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ArtisanSidebar = ({ isOpen, onClose, currentTab, onTabChange, stats }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Overview', icon: Home, id: 'overview' },
    { name: 'Products', icon: Package, id: 'products', badge: stats?.pendingApproval },
    { name: 'Orders', icon: ShoppingBag, id: 'orders', badge: stats?.activeOrders },
    { name: 'Analytics', icon: BarChart3, id: 'analytics' },
    { name: 'Settings', icon: Settings, id: 'settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('tantika_user');
    window.location.href = '/login';
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    if (onClose) onClose();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <SidebarContent 
            navigation={navigation}
            currentTab={currentTab}
            onTabChange={handleTabClick}
            onClose={onClose}
            onLogout={handleLogout}
            isCollapsed={false}
            showToggle={false}
          />
        </div>
      </div>

      {/* Desktop Sidebar with Collapse */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-amber-100 relative">
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-20 bg-white border border-amber-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-10 group"
          >
            {isCollapsed ? 
              <ChevronRight size={16} className="text-amber-600 group-hover:text-amber-700" /> : 
              <ChevronLeft size={16} className="text-amber-600 group-hover:text-amber-700" />
            }
          </button>
          
          <SidebarContent 
            navigation={navigation}
            currentTab={currentTab}
            onTabChange={handleTabClick}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            showToggle={true}
          />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ navigation, currentTab, onTabChange, onClose, onLogout, isCollapsed, showToggle }) => {
  const getTabStyles = (tabId) => {
    const isActive = currentTab === tabId;
    return `group flex items-center w-full rounded-md transition-all duration-200 transform hover:scale-105 ${
      isCollapsed ? 'px-2 py-3 justify-center' : 'px-2 py-2'
    } ${
      isActive 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' 
        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
    }`;
  };

  const getIconStyles = (tabId) => {
    const isActive = currentTab === tabId;
    return `flex-shrink-0 transition-all duration-200 ${
      isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
    } ${
      isActive ? 'text-white' : 'text-gray-400 group-hover:text-amber-500'
    }`;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Logo/Brand */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-16 px-4 bg-gradient-to-r from-amber-500 to-orange-500`}>
        {isCollapsed ? (
          <span className="text-2xl font-bold text-white">A</span>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white">Artisan's Studio</h1>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded lg:hidden">
                <X size={20} className="text-white" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              if (onClose) onClose();
            }}
            className={getTabStyles(item.id)}
            title={isCollapsed ? item.name : ''}
          >
            <item.icon className={getIconStyles(item.id)} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge > 0 && (
                  <span className={`ml-3 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full animate-pulse ${
                    currentTab === item.id 
                      ? 'bg-white text-amber-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {isCollapsed && item.badge > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-amber-100">
        <button
          onClick={onLogout}
          className={`group flex items-center w-full rounded-md transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
            isCollapsed ? 'justify-center px-2 py-3' : 'px-2 py-2'
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className={`flex-shrink-0 transition-all duration-200 ${
            isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
          } text-gray-400 group-hover:text-red-500`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default ArtisanSidebar;