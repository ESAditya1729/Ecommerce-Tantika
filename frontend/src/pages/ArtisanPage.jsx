import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtisanSidebar from '../components/ArtisanDashboard/ArtisanSidebar';
import ArtisanHeader from '../components/ArtisanDashboard/ArtisanHeader';
import OverviewTab from '../components/ArtisanDashboard/OverviewTab';
import ProductsTab from '../components/ArtisanDashboard/ProductsTab';
import OrdersTab from '../components/ArtisanDashboard/OrdersTab';
import AnalyticsTab from '../components/ArtisanDashboard/AnalyticsTab';
import SettingsTab from '../components/ArtisanDashboard/SettingsTab';

const ArtisanDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [artisan, setArtisan] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 24,
    pendingApproval: 3,
    activeOrders: 8,
    completedOrders: 156,
    totalEarnings: 45890,
    averageRating: 4.8
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: '#ORD-001', product: 'Handwoven Rug', customer: 'Priya S.', amount: '₹2,499', status: 'pending', date: '2024-02-24' },
    { id: '#ORD-002', product: 'Terracotta Vase', customer: 'Amit K.', amount: '₹899', status: 'processing', date: '2024-02-23' },
    { id: '#ORD-003', product: 'Cotton Saree', customer: 'Meera R.', amount: '₹3,999', status: 'shipped', date: '2024-02-22' },
  ]);

  const [pendingProducts, setPendingProducts] = useState([
    { id: 1, name: 'Macrame Wall Hanging', price: '₹1,299', submittedDate: '2024-02-23', status: 'under_review' },
    { id: 2, name: 'Hand-painted Diya Set', price: '₹599', submittedDate: '2024-02-22', status: 'changes_requested' },
    { id: 3, name: 'Crochet Baby Blanket', price: '₹2,499', submittedDate: '2024-02-21', status: 'under_review' },
  ]);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarChange = (e) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener('sidebarCollapsed', handleSidebarChange);
    return () => window.removeEventListener('sidebarCollapsed', handleSidebarChange);
  }, []);

  // Get artisan data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('tantika_user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setArtisan({
          id: parsedData.id,
          artisanId: parsedData.artisanId,
          username: parsedData.username,
          email: parsedData.email,
          phone: parsedData.phone,
          role: parsedData.role,
          isActive: parsedData.isActive,
          createdAt: parsedData.createdAt
        });
      } catch (error) {
        console.error('Error parsing artisan data:', error);
      }
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (window.innerWidth < 1024) return 'ml-0';
    return sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-72';
  };

  // Render current tab
  const renderTab = () => {
    switch(currentTab) {
      case 'overview':
        return <OverviewTab 
          stats={stats} 
          recentOrders={recentOrders}
          pendingProducts={pendingProducts}
          onTabChange={setCurrentTab}
        />;
      case 'products':
        return <ProductsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Sidebar */}
      <ArtisanSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        stats={stats}
        onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      {/* Main Content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${getMainContentMargin()}
        `}
      >
        {/* Header
        <ArtisanHeader 
          onMenuClick={() => setSidebarOpen(true)}
          artisan={artisan}
          sidebarCollapsed={sidebarCollapsed}
        /> */}

        {/* Page Content */}
        <main className="p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Tab Content */}
            {renderTab()}
          </div>
        </main>

        {/* Footer (optional) */}
        <footer className="border-t border-amber-100/50 py-4 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2024 Tantika Artisan Dashboard. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Help Center</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ArtisanDashboard;