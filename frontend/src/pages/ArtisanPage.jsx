import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Memoized stats to prevent unnecessary re-renders
  const [stats] = useState({
    totalProducts: 24,
    pendingApproval: 3,
    activeOrders: 8,
    completedOrders: 156,
    totalEarnings: 45890,
    averageRating: 4.8
  });

  const [recentOrders] = useState([
    { id: '#ORD-001', product: 'Handwoven Rug', customer: 'Priya S.', amount: '₹2,499', status: 'pending', date: '2024-02-24' },
    { id: '#ORD-002', product: 'Terracotta Vase', customer: 'Amit K.', amount: '₹899', status: 'processing', date: '2024-02-23' },
    { id: '#ORD-003', product: 'Cotton Saree', customer: 'Meera R.', amount: '₹3,999', status: 'shipped', date: '2024-02-22' },
  ]);

  const [pendingProducts] = useState([
    { id: 1, name: 'Macrame Wall Hanging', price: '₹1,299', submittedDate: '2024-02-23', status: 'under_review' },
    { id: 2, name: 'Hand-painted Diya Set', price: '₹599', submittedDate: '2024-02-22', status: 'changes_requested' },
    { id: 3, name: 'Crochet Baby Blanket', price: '₹2,499', submittedDate: '2024-02-21', status: 'under_review' },
  ]);

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-close sidebar on mobile when resizing to desktop
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

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
    const loadArtisanData = async () => {
      setIsLoading(true);
      try {
        const userData = localStorage.getItem('tantika_user');
        if (userData) {
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
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error parsing artisan data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadArtisanData();
  }, [navigate]);

  // Handle sidebar toggle with better UX
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Handle tab change with smooth scroll to top
  const handleTabChange = useCallback((tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Close sidebar on mobile after tab selection
    if (windowWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [windowWidth]);

  // Calculate main content classes based on sidebar state
  const mainContentClasses = useMemo(() => {
    const baseClasses = 'transition-all duration-300 ease-in-out min-h-screen';
    if (windowWidth < 1024) return baseClasses;
    return `${baseClasses} ${sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-72'}`;
  }, [windowWidth, sidebarCollapsed]);

  // Render current tab with loading state
  const renderTab = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    }

    const tabProps = {
      stats,
      recentOrders,
      pendingProducts,
      onTabChange: handleTabChange,
      artisan
    };

    switch(currentTab) {
      case 'overview':
        return <OverviewTab {...tabProps} />;
      case 'products':
        return <ProductsTab {...tabProps} />;
      case 'orders':
        return <OrdersTab {...tabProps} />;
      case 'analytics':
        return <AnalyticsTab {...tabProps} />;
      case 'settings':
        return <SettingsTab {...tabProps} artisan={artisan} />;
      default:
        return <OverviewTab {...tabProps} />;
    }
  }, [currentTab, isLoading, stats, recentOrders, pendingProducts, handleTabChange, artisan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <ArtisanSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        stats={stats}
        onCollapse={setSidebarCollapsed}
        userName={artisan?.username}
      />

      {/* Main Content */}
      <div className={mainContentClasses}>
        {/* Header */}
        <ArtisanHeader 
          onMenuClick={handleSidebarToggle}
          artisan={artisan}
          sidebarCollapsed={sidebarCollapsed}
          unreadNotifications={3}
        />

        {/* Page Content */}
        <main className="pt-[calc(72px+48px)] sm:pt-[calc(80px+48px)] lg:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="content-container animate-fadeIn">
            {/* Tab Content */}
            {renderTab()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-amber-100/50 dark:border-gray-800/50 py-4 px-4 lg:px-8 mt-8">
          <div className="content-container">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <p className="text-center sm:text-left">
                © 2024 Tantika Artisan Dashboard. 
                <span className="hidden sm:inline"> All rights reserved.</span>
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <a href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors tap-highlight-none touch-target flex items-center justify-center px-3">
                  Privacy
                </a>
                <a href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors tap-highlight-none touch-target flex items-center justify-center px-3">
                  Terms
                </a>
                <a href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors tap-highlight-none touch-target flex items-center justify-center px-3">
                  Help
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay for Sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ArtisanDashboard;