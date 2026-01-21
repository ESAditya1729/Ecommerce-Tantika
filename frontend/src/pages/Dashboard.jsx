import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  ShoppingBag,
  Heart,
  Package,
  Settings,
} from "lucide-react";

// Components
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";
import { NoUserState } from "../components/NoUserState";
import { DashboardHeader } from "../components/Dashboard/DashboardHeader";
import { WelcomeSection } from "../components/Dashboard/WelcomeSection";
import { StatsGrid } from "../components/Dashboard/StatsGrid";
import { ProfileCard } from "../components/Dashboard/ProfileCard";
import { RecentActivityCard } from "../components/Dashboard/RecentActivityCard";
import { QuickActionsCard } from "../components/Dashboard/QuickActionsCard";
import { InfoCard } from "../components/Dashboard/InfoCard";
import { WelcomeBanner } from "../components/Dashboard/WelcomeBanner";
import { FooterNote } from "../components/Dashboard/FooterNote";

// Modals
import { EditProfileModal } from "../components/Modals/EditMyProfileModal";
import { WishlistModal } from "../components/Modals/WishlistModal";
import OrderHistoryModal from "../components/Modals/OrderHistoryModal";
import { SettingsModal } from "../components/Modals/SettingsModal";
import { AddressBookModal } from "../components/Modals/AddressBookModal";

// New Component Suggestion (create this file if needed)
// import { RefreshIndicator } from '../components/Dashboard/RefreshIndicator';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount: 0,
    cartCount: 0,
    totalSpent: 0,
    points: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Memoize fetch function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setRefreshing(true);
        setError(null);

        const token = localStorage.getItem("tantika_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/usernorms/dashboard/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            // Add timeout logic for better UX
            signal: AbortSignal.timeout?.(10000), // 10 second timeout
          },
        );

        if (!response.ok) {
          if (response.status === 401) throw new Error("Unauthorized");
          throw new Error(
            `API Error: ${response.status} - ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.success) {
          setUser(data.data.user);
          setStats(data.data.stats);
          setRecentActivity(data.data.recentActivity || []);

          localStorage.setItem("tantika_user", JSON.stringify(data.data.user));
        } else {
          throw new Error(data.message || "Failed to load dashboard");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);

        if (err.message === "Unauthorized") {
          localStorage.removeItem("tantika_token");
          localStorage.removeItem("tantika_user");
          navigate("/login");
          return;
        }

        setError(
          err.message ||
            "Failed to load dashboard data. Please check if backend server is running.",
        );

        // Enhanced fallback logic
        const userStr = localStorage.getItem("tantika_user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            // Create minimal stats from localStorage if available
            const storedStats = JSON.parse(
              localStorage.getItem("tantika_stats"),
            );
            if (storedStats) {
              setStats(storedStats);
            }
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError);
          }
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate, API_BASE_URL],
  );

  useEffect(() => {
    fetchDashboardData();

    // Store stats in localStorage on unmount for fallback
    return () => {
      localStorage.setItem("tantika_stats", JSON.stringify(stats));
    };
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("tantika_token");
    localStorage.removeItem("tantika_user");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("tantika_stats");
    navigate("/login");
  };

  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  // Organized quick actions by category
  const quickActionHandlers = {
    editProfile: () => setShowEditProfile(true),
    wishlist: () => setShowWishlist(true),
    orders: () => setShowOrderHistory(true),
    settings: () => setShowSettings(true),
    shop: () => navigate("/shop"),
    addresses: () => setShowAddressBook(true),
    contact: () => navigate("/contact"),
    artisans: () => navigate("/artisans"),
  };

  const handleQuickAction = (action) => {
    const handler = quickActionHandlers[action];
    if (handler) {
      handler();
    } else {
      console.warn(`No handler for action: ${action}`);
    }
  };

  const handleSaveProfileSuccess = (updatedUser) => {
    setUser(updatedUser);
    handleRefresh();
  };

  const handleWishlistUpdate = () => {
    handleRefresh();
  };

  if (loading) return <LoadingSpinner />;

  if (error && !user) {
    return (
      <ErrorState
        error={error}
        onLogin={() => navigate("/login")}
        onRetry={handleRefresh}
      />
    );
  }

  if (!user) {
    return <NoUserState onLogin={() => navigate("/login")} />;
  }

  // Calculate member duration
  const memberSince = new Date(user.createdAt);
  const today = new Date();
  const monthsAsMember = Math.max(
    1,
    Math.floor((today - memberSince) / (1000 * 60 * 60 * 24 * 30)),
  );
  const artisansSupported = Math.max(1, Math.floor(stats.totalSpent / 1000));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Refresh Indicator - Could be extracted to a separate component */}
      {refreshing && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Updating dashboard...</span>
        </div>
      )}

      <DashboardHeader
        user={user}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <WelcomeSection user={user} stats={stats} />
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsGrid stats={stats} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium mb-1">
                  Connection Issue
                </p>
                <p className="text-yellow-700 text-sm mb-2">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <ProfileCard
                user={user}
                onEditProfile={handleEditProfile}
                onLogout={handleLogout}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <RecentActivityCard activities={recentActivity} />
            </div>
          </div>

          {/* Right Column - 1/3 width on large screens */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <QuickActionsCard
                onQuickAction={handleQuickAction}
                stats={stats} // Pass stats for action badges
              />
            </div>

            {/* Member Info Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-6">
              <InfoCard
                title="Member Since"
                value={memberSince.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                subtitle={`Thank you for being part of our community for ${monthsAsMember} month${monthsAsMember > 1 ? "s" : ""}!`}
                icon={Clock}
                color="green"
                iconClassName="text-green-600"
              />
            </div>

            {/* Support & Orders Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6">
              <InfoCard
                title="Your Impact"
                value={`₹${stats.totalSpent.toLocaleString("en-IN")}`}
                subtitle={`Supporting ${artisansSupported}+ artisans across India`}
                icon={TrendingUp}
                color="blue"
                iconClassName="text-blue-600"
              >
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Completed Orders
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stats.completedOrders}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <ShoppingBag className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Pending Orders
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stats.pendingOrders}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Heart className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Wishlist Items
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stats.wishlistCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="mt-8 lg:mt-12">
          <WelcomeBanner />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 lg:mt-12">
        <FooterNote onRefresh={handleRefresh} />
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
        onSaveSuccess={handleSaveProfileSuccess}
      />

      <WishlistModal
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        userId={user?.id}
        onRefreshDashboard={handleRefresh}
      />

      <OrderHistoryModal
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
        userId={user?.id}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userId={user?.id}
      />

      <AddressBookModal
        isOpen={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        userId={user?.id}
      />
    </div>
  );
};

export default Dashboard;
