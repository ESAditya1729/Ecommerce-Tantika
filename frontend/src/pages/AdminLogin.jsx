import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: formData.email,
      password: formData.password,
    });

    if (!response.data.success) {
      setError(response.data.message || "Login failed");
      setLoading(false);
      return;
    }

    const { token, user } = response.data;

    if (user.role !== "admin" && user.role !== "superadmin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    // Store auth
    if (formData.rememberMe) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }

    localStorage.setItem("user", JSON.stringify(user));

    // ✅ IMMEDIATE redirect (no alert, no timeout)
    navigate("/admin/dashboard", { replace: true });
    return;

  } catch (err) {
    setError(
      err.response?.data?.message || "Login failed. Please try again."
    );
    setLoading(false);
  }
};


  // Handle demo admin login (optional - remove in production)
  const handleDemoLogin = async () => {
    setFormData({
      email: 'admin@tantika.com',
      password: 'admin123',
      rememberMe: true
    });
    
    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">তন্তিকা Admin</h1>
          <p className="text-gray-400">Sign in to your admin panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@tantika.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  className="rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <button 
                type="button" 
                className="text-sm text-blue-400 hover:text-blue-300"
                onClick={() => alert('Contact super admin to reset your password')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          {/* Demo Login Button (Remove in production) */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all duration-300 text-sm"
            >
              Try Demo Admin Login
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              (Uses default admin credentials)
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Need admin access?
              </p>
              <button 
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                onClick={() => alert('Contact: superadmin@tantika.com\nPhone: +91-XXXXXXXXXX')}
              >
                Contact Super Admin
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-400">
            <Shield className="w-4 h-4 mr-2" />
            <span>Protected by advanced security</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Unauthorized access is strictly prohibited
          </p>
        </div>

        {/* Back to main site */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to main website
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;