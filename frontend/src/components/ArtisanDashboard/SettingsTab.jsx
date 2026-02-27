// frontend\src\components\ArtisanDashboard\SettingsTab.jsx

import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Award,
  Briefcase,
  Palette,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  CreditCard,
  Landmark,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
  ShoppingBag,
  Star,
  Heart,
  Share2,
  ChevronRight,
  Camera,
  Upload,
  Trash2,
  Edit2,
  Loader2
} from 'lucide-react';

const SettingsTab = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showBankAccount, setShowBankAccount] = useState(false);
  const [showIfsc, setShowIfsc] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    fullName: '',
    phone: '',
    description: '',
    yearsOfExperience: '',
    specialization: [],
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    portfolioLink: '',
    website: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      youtube: '',
      twitter: ''
    },
    settings: {
      autoApproveProducts: false,
      lowStockNotification: true,
      newOrderNotification: true,
      payoutMethod: 'bank_transfer',
      payoutSchedule: 'monthly'
    }
  });

  const [bankForm, setBankForm] = useState({
    accountName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    bankName: '',
    ifscCode: '',
    accountType: 'savings'
  });

  const [notificationForm, setNotificationForm] = useState({
    lowStockNotification: true,
    newOrderNotification: true
  });

  const [payoutForm, setPayoutForm] = useState({
    payoutMethod: 'bank_transfer',
    payoutSchedule: 'monthly'
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [idProof, setIdProof] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api'; //process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get auth token
  const getToken = () => localStorage.getItem('tantika_token');

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profileForm.fullName) {
      return profileForm.fullName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'A';
  };

  // Fetch all data
  useEffect(() => {
    fetchProfile();
    fetchIdProof();
    fetchMetrics();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        const { artisan, user } = result.data;
        setProfile(artisan);
        setUser(user);

        setProfileForm({
          businessName: artisan.businessName || '',
          fullName: artisan.fullName || '',
          phone: artisan.phone || '',
          description: artisan.description || '',
          yearsOfExperience: artisan.yearsOfExperience || '',
          specialization: artisan.specialization || [],
          address: artisan.address || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India'
          },
          portfolioLink: artisan.portfolioLink || '',
          website: artisan.website || '',
          socialLinks: artisan.socialLinks || {
            instagram: '',
            facebook: '',
            youtube: '',
            twitter: ''
          },
          settings: artisan.settings || {
            autoApproveProducts: false,
            lowStockNotification: true,
            newOrderNotification: true,
            payoutMethod: 'bank_transfer',
            payoutSchedule: 'monthly'
          }
        });

        // Set notification and payout forms
        setNotificationForm({
          lowStockNotification: artisan.settings?.lowStockNotification ?? true,
          newOrderNotification: artisan.settings?.newOrderNotification ?? true
        });

        setPayoutForm({
          payoutMethod: artisan.settings?.payoutMethod || 'bank_transfer',
          payoutSchedule: artisan.settings?.payoutSchedule || 'monthly'
        });

        // Set bank form if exists
        if (artisan.bankDetails) {
          setBankForm({
            accountName: artisan.bankDetails.accountName || '',
            accountNumber: artisan.bankDetails.accountNumber || '',
            confirmAccountNumber: artisan.bankDetails.accountNumber || '',
            bankName: artisan.bankDetails.bankName || '',
            ifscCode: artisan.bankDetails.ifscCode || '',
            accountType: artisan.bankDetails.accountType || 'savings'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchIdProof = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/id-proof`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setIdProof(result.data);
      }
    } catch (error) {
      console.error('Error fetching ID proof:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Profile updated successfully');
        fetchProfile();
      } else {
        showError(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    
    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      showError('Account numbers do not match');
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/bank-details`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountName: bankForm.accountName,
          accountNumber: bankForm.accountNumber,
          bankName: bankForm.bankName,
          ifscCode: bankForm.ifscCode,
          accountType: bankForm.accountType
        })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Bank details updated successfully');
        fetchProfile();
      } else {
        showError(result.message || 'Failed to update bank details');
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
      showError('Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/notification-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationForm)
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Notification settings updated');
        fetchProfile();
      } else {
        showError(result.message || 'Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showError('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePayoutUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/artisan/payout-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payoutForm)
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Payout settings updated');
        fetchProfile();
      } else {
        showError(result.message || 'Failed to update payout settings');
      }
    } catch (error) {
      console.error('Error updating payout settings:', error);
      showError('Failed to update payout settings');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialization = () => {
    if (specializationInput.trim() && !profileForm.specialization.includes(specializationInput.trim())) {
      setProfileForm({
        ...profileForm,
        specialization: [...profileForm.specialization, specializationInput.trim()]
      });
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (item) => {
    setProfileForm({
      ...profileForm,
      specialization: profileForm.specialization.filter(s => s !== item)
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal and business information' },
    { id: 'banking', label: 'Bank Details', icon: Landmark, description: 'Update your payment and banking information' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure your notification preferences' },
    { id: 'payouts', label: 'Payout Settings', icon: DollarSign, description: 'Manage your payout schedule and methods' },
    { id: 'verification', label: 'Verification', icon: Shield, description: 'View your verification status and ID proof' },
    { id: 'metrics', label: 'Performance', icon: TrendingUp, description: 'Track your shop performance metrics' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-amber-500" />
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile, preferences, and business information
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-slideDown">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-slideDown">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-100 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-80 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b lg:border-b-0 lg:border-r border-amber-100 dark:border-gray-700">
              {/* Profile Summary Card */}
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-amber-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {getUserInitials()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{profileForm.fullName || 'Artisan'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profileForm.businessName || 'Business Name'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${profile?.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile?.status || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isActive ? 'text-white' : 'text-amber-500'} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{tab.label}</p>
                          <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {tab.description}
                          </p>
                        </div>
                        {isActive && <ChevronRight size={16} className="text-white/80" />}
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Shop Stats */}
              {metrics && (
                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-amber-100 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Package size={16} className="text-amber-500" />
                    Shop Stats
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Products</span>
                      <span className="font-medium text-gray-900 dark:text-white">{metrics.totalProducts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Orders</span>
                      <span className="font-medium text-gray-900 dark:text-white">{metrics.totalOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Sales</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{metrics.totalSales?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Rating</span>
                      <span className="font-medium text-yellow-500">★ {metrics.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Building2 size={16} className="inline mr-2 text-amber-500" />
                          Business Name *
                        </label>
                        <input
                          type="text"
                          value={profileForm.businessName}
                          onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <User size={16} className="inline mr-2 text-amber-500" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Mail size={16} className="inline mr-2 text-amber-500" />
                          Email (Read Only)
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Phone size={16} className="inline mr-2 text-amber-500" />
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Briefcase size={16} className="inline mr-2 text-amber-500" />
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={profileForm.yearsOfExperience}
                          onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: e.target.value })}
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Palette size={16} className="inline mr-2 text-amber-500" />
                          Specializations
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={specializationInput}
                            onChange={(e) => setSpecializationInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                            placeholder="Add specialization"
                          />
                          <button
                            type="button"
                            onClick={addSpecialization}
                            className="px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileForm.specialization.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => removeSpecialization(item)}
                                className="ml-1 text-amber-500 hover:text-amber-700"
                              >
                                <XCircle size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Globe size={16} className="inline mr-2 text-amber-500" />
                          Website
                        </label>
                        <input
                          type="url"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Link2 size={16} className="inline mr-2 text-amber-500" />
                          Portfolio Link
                        </label>
                        <input
                          type="url"
                          value={profileForm.portfolioLink}
                          onChange={(e) => setProfileForm({ ...profileForm, portfolioLink: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      About / Description
                    </label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="Tell us about your craft and journey..."
                    />
                  </div>

                  {/* Address Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-amber-500" />
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={profileForm.address.street}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, street: e.target.value }
                          })}
                          placeholder="Street Address"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={profileForm.address.city}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, city: e.target.value }
                          })}
                          placeholder="City"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={profileForm.address.state}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, state: e.target.value }
                          })}
                          placeholder="State"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={profileForm.address.postalCode}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, postalCode: e.target.value }
                          })}
                          placeholder="Postal Code"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={profileForm.address.country}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, country: e.target.value }
                          })}
                          placeholder="Country"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Share2 size={20} className="text-amber-500" />
                      Social Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Instagram size={20} className="text-pink-500" />
                        <input
                          type="url"
                          value={profileForm.socialLinks.instagram}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, instagram: e.target.value }
                          })}
                          placeholder="Instagram URL"
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook size={20} className="text-blue-600" />
                        <input
                          type="url"
                          value={profileForm.socialLinks.facebook}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, facebook: e.target.value }
                          })}
                          placeholder="Facebook URL"
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Youtube size={20} className="text-red-600" />
                        <input
                          type="url"
                          value={profileForm.socialLinks.youtube}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, youtube: e.target.value }
                          })}
                          placeholder="YouTube URL"
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Twitter size={20} className="text-blue-400" />
                        <input
                          type="url"
                          value={profileForm.socialLinks.twitter}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, twitter: e.target.value }
                          })}
                          placeholder="Twitter URL"
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Banking Tab */}
              {activeTab === 'banking' && (
                <form onSubmit={handleBankUpdate} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Details</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Your banking information is encrypted and secure
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Update Bank Details
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-600/50 p-6 rounded-xl border border-amber-100 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          value={bankForm.accountName}
                          onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Type
                        </label>
                        <select
                          value={bankForm.accountType}
                          onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="savings">Savings Account</option>
                          <option value="current">Current Account</option>
                          <option value="salary">Salary Account</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Number *
                        </label>
                        <div className="relative">
                          <input
                            type={showBankAccount ? 'text' : 'password'}
                            value={bankForm.accountNumber}
                            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowBankAccount(!showBankAccount)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-500"
                          >
                            {showBankAccount ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm Account Number *
                        </label>
                        <input
                          type="password"
                          value={bankForm.confirmAccountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          IFSC Code *
                        </label>
                        <div className="relative">
                          <input
                            type={showIfsc ? 'text' : 'password'}
                            value={bankForm.ifscCode}
                            onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white pr-10"
                            placeholder="e.g., SBIN0123456"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowIfsc(!showIfsc)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-500"
                          >
                            {showIfsc ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Format: 4 letters + 0 + 6 alphanumeric</p>
                      </div>
                    </div>

                    {profile?.bankDetails?.verified && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-300">Your bank details are verified</span>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleNotificationUpdate} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Choose what updates you want to receive
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Bell size={20} className="text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Low Stock Alerts</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your products are running low</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationForm.lowStockNotification}
                          onChange={(e) => setNotificationForm({ ...notificationForm, lowStockNotification: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ShoppingBag size={20} className="text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">New Order Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive new orders</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationForm.newOrderNotification}
                          onChange={(e) => setNotificationForm({ ...notificationForm, newOrderNotification: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>
                </form>
              )}

              {/* Payouts Tab */}
              {activeTab === 'payouts' && (
                <form onSubmit={handlePayoutUpdate} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payout Settings</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure how and when you receive payments
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payout Method
                      </label>
                      <select
                        value={payoutForm.payoutMethod}
                        onChange={(e) => setPayoutForm({ ...payoutForm, payoutMethod: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payout Schedule
                      </label>
                      <select
                        value={payoutForm.payoutSchedule}
                        onChange={(e) => setPayoutForm({ ...payoutForm, payoutSchedule: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Note on Payouts</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Payouts are processed based on your schedule. Minimum payout amount is ₹1000. 
                          Bank transfers typically take 2-3 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Verification Tab */}
              {activeTab === 'verification' && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verification</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Your verification status and ID proof information
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-600/50 p-6 rounded-xl border border-amber-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Shield size={24} className="text-amber-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">ID Proof</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Your submitted identification document</p>
                        </div>
                      </div>
                      {idProof?.verified ? (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                          <CheckCircle size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium flex items-center gap-1">
                          <Clock size={14} />
                          Pending Verification
                        </span>
                      )}
                    </div>

                    {idProof && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">ID Type</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{idProof.type}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{idProof.number}</p>
                        </div>
                        {/* {idProof.verifiedAt && (
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verified On</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                              {new Date(idProof.verifiedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )} */}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Verification Status: {profile?.status}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {profile?.status === 'approved' 
                            ? 'Your account is fully verified. You can now list products and receive orders.'
                            : profile?.status === 'pending'
                            ? 'Your verification is in progress. This usually takes 2-3 business days.'
                            : 'Your verification is pending. Please check your email for updates.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Tab */}
              {activeTab === 'metrics' && metrics && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Metrics</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Track your shop's performance and growth
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                      <Package size={24} className="text-blue-500 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalProducts}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                      <ShoppingBag size={24} className="text-green-500 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalOrders}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                      <DollarSign size={24} className="text-purple-500 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{metrics.totalSales?.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
                      <TrendingUp size={24} className="text-orange-500 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{metrics.totalRevenue?.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800">
                      <Eye size={24} className="text-yellow-500 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalViews?.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
                      <Star size={24} className="text-red-500 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.rating?.toFixed(1)} ★</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Completion Rate</p>
                        <p className="text-3xl font-bold">{metrics.completionRate}%</p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Award size={32} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;