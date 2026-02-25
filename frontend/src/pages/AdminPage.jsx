import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Admin Components
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminHeader from '../components/Admin/AdminHeader';
import StatsOverview from '../components/Admin/StatsOverview';
import RecentOrders from '../components/Admin/RecentOrders';
import ProductManagement from '../components/Admin/ProductManagement';
import OrderManagement from '../components/Admin/OrderManagement';
import UserManagement from '../components/Admin/UserManagement';
import AnalyticsDashboard from '../components/Admin/AnalyticsDashboard';
import SettingsPanel from '../components/Admin/SettingsPanel';
import ArtisanManagement from '../components/Admin/ArtisanManagement';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState({
    name: 'Admin',
    email: 'admin@tantika.com',
    role: 'Super Admin'
  });

  // Add a state to track if we should refresh order data
  const [refreshOrders, setRefreshOrders] = useState(0);

  // Mock data
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 248500,
    totalOrders: 156,
    totalProducts: 89,
    totalUsers: 342,
    revenueGrowth: 24.5,
    orderGrowth: 12.3,
    pendingOrders: 18,
    todayOrders: 8
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: 'TNT-2456', customer: 'Rahul Sharma', amount: 2450, status: 'pending', date: '2024-01-15', items: 2 },
    { id: 'TNT-2455', customer: 'Priya Patel', amount: 3899, status: 'shipped', date: '2024-01-14', items: 3 },
    { id: 'TNT-2454', customer: 'Amit Kumar', amount: 1299, status: 'delivered', date: '2024-01-14', items: 1 },
    { id: 'TNT-2453', customer: 'Sneha Roy', amount: 4599, status: 'processing', date: '2024-01-13', items: 4 },
    { id: 'TNT-2452', customer: 'Rajesh Mehta', amount: 899, status: 'delivered', date: '2024-01-12', items: 1 },
  ]);

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem('tantika_token');
      const userStr = localStorage.getItem('tantika_user');
      
      if (!token || !userStr) {
        navigate('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        // Check if user is actually an admin
        if (user.role !== 'admin' && user.role !== 'superadmin') {
          navigate('/dashboard');
          return;
        }
        
        setAdminData({
          name: user.username || 'Admin',
          email: user.email || 'admin@tantika.com',
          role: user.role === 'superadmin' ? 'Super Admin' : 'Admin'
        });
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('tantika_token');
        localStorage.removeItem('tantika_user');
        navigate('/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tantika_token');
    localStorage.removeItem('tantika_user');
    navigate('/login');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // If switching to orders tab, trigger a refresh
    if (tabId === 'orders') {
      setRefreshOrders(prev => prev + 1);
    }
    
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Function to refresh orders from child components
  const handleOrderUpdate = useCallback(() => {
    setRefreshOrders(prev => prev + 1);
  }, []);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <StatsOverview stats={dashboardStats} />
            <RecentOrders orders={recentOrders} onOrderUpdate={handleOrderUpdate} />
            <AnalyticsDashboard />
          </div>
        );
      case 'products':
        return <ProductManagement onUpdate={handleOrderUpdate} />;
      case 'orders':
        // Pass refresh trigger to OrderManagement
        return <OrderManagement key={`orders-${refreshOrders}`} refreshTrigger={refreshOrders} />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AnalyticsDashboard fullView />;
      case 'settings':
        return <SettingsPanel />;
      case 'artisans':
        return <ArtisanManagement />;
      default:
        return (
          <div className="space-y-8">
            <StatsOverview stats={dashboardStats} />
            <RecentOrders orders={recentOrders} onOrderUpdate={handleOrderUpdate} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Layout */}
      <div className={`transition-all duration-300 ${
        isSidebarOpen ? 'lg:pl-64' : 'pl-0'
      }`}>
        {/* Admin Header */}
        <AdminHeader 
          adminData={adminData}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content */}
        <main className="pt-16 p-4 md:p-6 min-h-screen">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard Overview' : `${activeTab} Management`}
              </h1>
              
              {activeTab !== 'dashboard' && (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleOrderUpdate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">↻</span>
                    Refresh
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <span className="mr-2">+</span>
                    Add New
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area - Remove the white background wrapper to allow OrderManagement to have its own styling */}
          <div className={activeTab === 'orders' ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6'}>
            {renderContent()}
          </div>

          {/* Footer Stats - Only show on dashboard */}
          {activeTab === 'dashboard' && (
            <>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Online Users</p>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <span className="text-green-600 text-xl">👤</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Today's Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹8,450</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <span className="text-blue-600 text-xl">💰</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg. Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">₹1,850</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <span className="text-purple-600 text-xl">📈</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">3.2%</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <span className="text-amber-600 text-xl">⚡</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    All Systems Operational
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <span className="text-2xl mb-2 block">💾</span>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-green-600">✓ Online</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <span className="text-2xl mb-2 block">🛡️</span>
                    <p className="font-medium">Security</p>
                    <p className="text-sm text-green-600">✓ Secure</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <span className="text-2xl mb-2 block">📦</span>
                    <p className="font-medium">Inventory</p>
                    <p className="text-sm text-green-600">89 Items</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <span className="text-2xl mb-2 block">💬</span>
                    <p className="font-medium">Support</p>
                    <p className="text-sm text-green-600">✓ Active</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;