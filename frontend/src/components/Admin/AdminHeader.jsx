import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, User, Settings, HelpCircle } from 'lucide-react';

const AdminHeader = ({ adminData, onLogout, onToggleSidebar, isSidebarOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New order received #TNT-2456', time: '5 min ago', read: false },
    { id: 2, message: 'Low stock alert: Kantha Stoles', time: '1 hour ago', read: false },
    { id: 3, message: 'Weekly report is ready', time: '2 hours ago', read: true },
    { id: 4, message: 'User registration completed', time: '1 day ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search products, orders, users..."
                  className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">{unreadCount} unread</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            </div>

            {/* Help */}
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <HelpCircle className="w-6 h-6" />
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Settings className="w-6 h-6" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {adminData.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-medium text-gray-900">{adminData.name}</p>
                  <p className="text-sm text-gray-500">{adminData.role}</p>
                </div>
              </button>

              {/* Profile Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {adminData.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{adminData.name}</p>
                        <p className="text-sm text-gray-500">{adminData.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                      <User className="w-5 h-5" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                      <Settings className="w-5 h-5" />
                      <span>Account Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                      <HelpCircle className="w-5 h-5" />
                      <span>Help & Support</span>
                    </button>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;