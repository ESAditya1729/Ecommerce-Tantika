// Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Heart,
  User,
  ShoppingCart,
  Clock,
  Sparkles,
  LogOut,
  TrendingUp,
  Award,
  MessageSquare,
  Settings,
  Shield,
  Bell,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// ==================== COMPONENTS ====================
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
      <p className="text-sm text-gray-500 mt-2">Fetching your personalized experience</p>
    </div>
  </div>
);

const ErrorState = ({ error, onLogin, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="text-center p-8 max-w-md">
      <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <div className="space-y-3">
        <button
          onClick={onLogin}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        >
          Go to Login
        </button>
        <button
          onClick={onRetry}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

const NoUserState = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
      <p className="text-gray-600 mb-6">Please login to access your dashboard</p>
      <button
        onClick={onLogin}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
      >
        Go to Login
      </button>
    </div>
  </div>
);

const DashboardHeader = ({ user, onRefresh }) => (
  <div className="bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  </div>
);

const WelcomeSection = ({ user, stats }) => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="mb-6 md:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          তন্তিকাতে স্বাগতম, <span className="text-yellow-300">{user.username}!</span> 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Your personalized Bengali craft journey awaits
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
            <Mail className="w-4 h-4 mr-2" />
            {user.email}
          </span>
          {user.phone && (
            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
              <Phone className="w-4 h-4 mr-2" />
              {user.phone}
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium">
            <Award className="w-4 h-4 mr-2" />
            {stats.points} Points
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
            <span className="text-white text-3xl font-bold">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {user.role === 'admin' ? '⭐ Admin' : 'Member'}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, link, trend, subtitle }) => {
  const colorClasses = {
    blue: 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    purple: 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600',
    pink: 'border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 text-pink-600',
    amber: 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600'
  };

  const content = (
    <div className={`rounded-2xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-all duration-300 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'purple' ? 'bg-purple-100' :
          color === 'pink' ? 'bg-pink-100' :
          'bg-amber-100'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-900 mr-2">{value}</p>
        {subtitle && <span className="text-gray-600 text-sm">{subtitle}</span>}
      </div>
      {link && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <span className="hover:text-gray-900 flex items-center">
            View {title.toLowerCase().split(' ')[0]}
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      )}
    </div>
  );

  return link ? (
    <Link to={link} className="block hover:scale-[1.02] transition-transform duration-300">
      {content}
    </Link>
  ) : (
    <div className="hover:scale-[1.02] transition-transform duration-300">
      {content}
    </div>
  );
};

const ProfileCard = ({ user, onEditProfile, onLogout }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <div className="flex justify-between items-start mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <User className="w-6 h-6 mr-3 text-blue-600" />
        Profile Overview
      </h2>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
        {user.role}
      </span>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Full Name
          </label>
          <p className="text-lg font-semibold text-gray-900">{user.username}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email Address
          </label>
          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Account Type
          </label>
          <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {user.phone && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Phone Number
            </label>
            <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Member ID
          </label>
          <p className="text-lg font-semibold text-gray-900 font-mono">
            {user.memberId || `TNT${(user.id || '001').toString().padStart(6, '0')}`}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Member Since
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(user.createdAt).toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 gap-4">
      <button
        onClick={onEditProfile}
        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center"
      >
        Edit Profile
      </button>
      
      <button
        onClick={onLogout}
        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
      >
        <LogOut className="mr-2 w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
);

const RecentActivityCard = ({ activities }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <Clock className="w-6 h-6 mr-3 text-blue-600" />
        Recent Activity
      </h2>
      <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
        View all
      </Link>
    </div>
    
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <span className="text-lg">{activity.icon}</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{activity.message}</p>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
    
    {activities.length === 0 && (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400 mt-1">Your activity will appear here</p>
      </div>
    )}
  </div>
);

const QuickActionsCard = () => {
  const quickActions = [
    { id: 1, title: 'Browse Shop', description: 'Discover crafts', icon: '🛍️', link: '/shop', color: 'blue' },
    { id: 2, title: 'Edit Profile', description: 'Update details', icon: '👤', link: '/profile/edit', color: 'purple' },
    { id: 3, title: 'My Wishlist', description: 'Saved items', icon: '💝', link: '/wishlist', color: 'pink' },
    { id: 4, title: 'Order History', description: 'Past purchases', icon: '📋', link: '/orders', color: 'green' },
    { id: 5, title: 'Address Book', description: 'Manage addresses', icon: '📍', link: '/addresses', color: 'amber' },
    { id: 6, title: 'Contact Us', description: 'Get help', icon: '💬', link: '/contact', color: 'indigo' },
    { id: 7, title: 'Settings', description: 'Preferences', icon: '⚙️', link: '/settings', color: 'gray' },
    { id: 8, title: 'Support Artisans', description: 'Learn more', icon: '👨‍🎨', link: '/artisans', color: 'red' },
  ];

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    pink: 'from-pink-50 to-pink-100 border-pink-200 text-pink-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-600',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-600',
    gray: 'from-gray-50 to-gray-100 border-gray-200 text-gray-600',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            to={action.link}
            className={`bg-gradient-to-br ${colorClasses[action.color] || colorClasses.blue} rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:scale-105 border`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
              colorClasses[action.color].split(' ')[0].replace('from-', 'bg-')
            }`}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const InfoCard = ({ title, value, subtitle, icon: Icon, color, children }) => {
  const colorClasses = {
    green: 'from-green-50 to-emerald-100 border-green-200 text-green-600',
    blue: 'from-blue-50 to-indigo-100 border-blue-200 text-blue-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl shadow-lg p-6 border`}>
      <div className="flex items-center mb-4">
        <Icon className={`w-6 h-6 mr-3 text-${color}-600`} />
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-gray-600 text-sm">{subtitle}</p>
      {children}
    </div>
  );
};

const WelcomeBanner = () => (
  <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div className="flex items-center mb-4">
          <Sparkles className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Welcome to তন্তিকা Family!</h2>
        </div>
        <p className="text-blue-100 mb-4 max-w-2xl">
          We're delighted to have you join our community of Bengali craft lovers. 
          Your journey into authentic handcrafted art begins here. Every purchase 
          supports traditional artisans and helps preserve cultural heritage.
        </p>
      </div>
      <Link
        to="/shop"
        className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
      >
        Start Shopping →
      </Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white/20 p-4 rounded-xl">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🎨</span>
          <h3 className="font-bold">Explore Crafts</h3>
        </div>
        <p className="text-sm text-blue-100">Discover unique handcrafted items from Bengal</p>
      </div>
      <div className="bg-white/20 p-4 rounded-xl">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">💝</span>
          <h3 className="font-bold">Create Wishlist</h3>
        </div>
        <p className="text-sm text-blue-100">Save your favorite items for later</p>
      </div>
      <div className="bg-white/20 p-4 rounded-xl">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🚀</span>
          <h3 className="font-bold">Support Artisans</h3>
        </div>
        <p className="text-sm text-blue-100">Every purchase helps traditional artists</p>
      </div>
    </div>
  </div>
);

const FooterNote = ({ onRefresh }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Secure Connection</span>
        </div>
        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
        <div className="text-sm text-gray-500">
          Your data is securely encrypted. Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh Data
        </button>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
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
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get API base URL from environment variable with fallback
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // API Service
  const apiService = {
    fetchDashboardData: async (token) => {
      console.log('Fetching from:', `${API_BASE_URL}/usernorms/dashboard/summary`);
      
      const response = await fetch(`${API_BASE_URL}/usernorms/dashboard/summary`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized');
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    }
  };

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('API Base URL:', API_BASE_URL);
      console.log('Token present:', !!token);

      const data = await apiService.fetchDashboardData(token);

      if (data.success) {
        setUser(data.data.user);
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity || []);
        
        // Update localStorage with fresh user data
        localStorage.setItem('tantika_user', JSON.stringify(data.data.user));
        console.log('Dashboard data loaded successfully');
      } else {
        throw new Error(data.message || 'Failed to load dashboard');
      }
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      console.error('Error details:', err.message);
      
      if (err.message === 'Unauthorized') {
        localStorage.removeItem('tantika_token');
        localStorage.removeItem('tantika_user');
        navigate('/login');
        return;
      }
      
      setError(err.message || 'Failed to load dashboard data. Please check if backend server is running.');
      
      // Fallback to localStorage data
      const userStr = localStorage.getItem('tantika_user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('Using fallback localStorage data');
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if we have environment variable
    console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
    console.log('Using API_BASE_URL:', API_BASE_URL);
    
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tantika_token');
    localStorage.removeItem('tantika_user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    navigate('/login');
  };

  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  // Loading State
  if (loading) return <LoadingSpinner />;

  // Error State
  if (error && !user) {
    return (
      <ErrorState 
        error={error}
        onLogin={() => navigate('/login')}
        onRetry={handleRefresh}
      />
    );
  }

  // No User State
  if (!user) {
    return (
      <NoUserState onLogin={() => navigate('/login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {refreshing && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Refreshing...
        </div>
      )}
      
      <DashboardHeader user={user} onRefresh={handleRefresh} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection user={user} stats={stats} />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            color="blue"
            link="/orders"
            trend={stats.totalOrders > 0 ? "+12%" : null}
          />
          
          <StatCard
            title="Wishlist Items"
            value={stats.wishlistCount}
            icon={Heart}
            color="purple"
            link="/wishlist"
          />
          
          <StatCard
            title="Cart Items"
            value={stats.cartCount}
            icon={ShoppingCart}
            color="pink"
            link="/cart"
          />
          
          <div className="rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Level {stats.points > 0 ? Math.floor(stats.points / 100) + 1 : 1}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Loyalty Points</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 mr-2">{stats.points}</p>
              <span className="text-gray-600">pts</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stats.points % 100))}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {100 - (stats.points % 100)} points to next level
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-700">
                {error} <button onClick={handleRefresh} className="underline ml-2">Retry</button>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            <ProfileCard 
              user={user}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
            />

            <RecentActivityCard activities={recentActivity} />
          </div>

          {/* Right Column - Quick Actions & Info Cards */}
          <div className="space-y-8">
            <QuickActionsCard />
            
            <InfoCard
              title="Member Since"
              value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric'
              })}
              subtitle={`Thank you for being part of our community for ${
                Math.max(1, Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30)))
              } months!`}
              icon={Clock}
              color="green"
            />

            <InfoCard
              title="Total Support"
              value={`₹${stats.totalSpent.toLocaleString()}`}
              subtitle={`Your purchases have supported ${Math.max(1, Math.floor(stats.totalSpent / 1000))}+ artisans`}
              icon={TrendingUp}
              color="blue"
            >
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Orders</span>
                  <span className="font-semibold text-gray-900">{stats.completedOrders}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Pending Orders</span>
                  <span className="font-semibold text-gray-900">{stats.pendingOrders}</span>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>

        <WelcomeBanner />
      </div>

      <FooterNote onRefresh={handleRefresh} />
    </div>
  );
};

export default Dashboard;