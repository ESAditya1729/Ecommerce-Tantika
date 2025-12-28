import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Settings,
  HelpCircle,
  Bell,
  Home,
  X,
  Database,
  Activity,
  Shield,
  MessageSquare,
  FileText,
  ArrowLeft,
  Store
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Database className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const supportItems = [
    { id: 'help', label: 'Help Center', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'activity', label: 'Activity Log', icon: <Activity className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  ];

  const handleItemClick = (tabId) => {
    setActiveTab(tabId);
    // Don't close sidebar on desktop, only on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {isOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed positioning */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 lg:translate-x-0 lg:w-64`}
        style={{ 
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg">T</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">তন্তিকা Admin</h2>
                <p className="text-gray-400 text-sm">Management Panel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Back to Main Site Button */}
          <Link
            to="/"
            className="mt-4 flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Main Site</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <p className="text-xs uppercase text-gray-500 tracking-wider mb-4 px-3">
            Main Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-6">
            <p className="text-xs uppercase text-gray-500 tracking-wider mb-4 px-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              <Link
                to="/shop"
                className="flex items-center space-x-3 px-4 py-3 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg transition-colors text-blue-300 hover:text-blue-100"
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">Visit Shop</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors text-purple-300 hover:text-purple-100"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">Customer Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8">
            <p className="text-xs uppercase text-gray-500 tracking-wider mb-4 px-3">
              Support
            </p>
            <nav className="space-y-1">
              {supportItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">System Load</span>
              <span className="text-sm text-green-400">42%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: '42%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Updated just now
            </p>
          </div>

          {/* Admin Info */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="font-bold">A</span>
              </div>
              <div>
                <p className="font-medium">Super Admin</p>
                <p className="text-sm text-gray-400">admin@tantika.com</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-gray-700 rounded">
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium">Owner</p>
              </div>
              <div className="text-center p-2 bg-gray-700 rounded">
                <p className="text-xs text-gray-400">Since</p>
                <p className="text-sm font-medium">2024</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;