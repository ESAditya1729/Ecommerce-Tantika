import axios from 'axios';

// ========================
// Configuration
// ========================

// Determine base URL based on environment
const getBaseURL = () => {
  // Check if we're in production (deployed on Vercel)
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // In production, use relative path or your deployed backend URL
    // Option 1: If backend is on same domain (API routes in same Vercel project)
    // return '/api';
    
    // Option 2: If backend is deployed separately (on Railway, Render, Heroku, etc.)
    return process.env.REACT_APP_API_URL || 
           'http://localhost:5000/api'; // CHANGE THIS!
  } else {
    // In development, use localhost
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }
};

// Create axios instance with dynamic base URL
const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Change this - see explanation below
  timeout: 15000, // Add timeout
});

// ========================
// Request Interceptor
// ========================
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('tantika_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ========================
// Response Interceptor - FIXED VERSION
// ========================
API.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      console.log('Response data structure:', response.data);
    }
    
    // If the response contains a token, store it
    if (response.data?.token) {
      localStorage.setItem('tantika_token', response.data.token);
      
      // DECODE TOKEN TO GET ROLE (if not in user object)
      try {
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length === 3) {
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', tokenPayload);
          
          // If user object exists but has no role, add role from token
          if (response.data.user && !response.data.user.role && tokenPayload.role) {
            response.data.user.role = tokenPayload.role;
            console.log('Added role from token to user:', tokenPayload.role);
          }
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    
    // If the response contains user data, store it - FIXED VERSION
    if (response.data?.user) {
      console.log('Storing user from response:', response.data.user);
      
      // Handle different user object structures
      const userToStore = response.data.user.user || response.data.user;
      
      // DEBUG: Check if role exists
      console.log('User to store has role?', userToStore.role);
      
      // If user doesn't have a role, determine it
      if (!userToStore.role) {
        console.warn('User object missing role, attempting to determine...');
        
        // Check various ways to determine role
        if (userToStore.artisanProfile) {
          // User has artisanProfile - check status
          userToStore.role = userToStore.artisanProfile.status === 'approved' 
            ? 'artisan' 
            : 'pending_artisan';
          console.log('Determined role from artisanProfile:', userToStore.role);
        } 
        else if (response.config.url?.includes('/artisan/')) {
          userToStore.role = 'artisan';
          console.log('Determined role from URL (artisan route):', userToStore.role);
        }
        else if (response.config.url?.includes('/admin/')) {
          userToStore.role = 'admin';
          console.log('Determined role from URL (admin route):', userToStore.role);
        }
        else if (userToStore.username && userToStore.username.toLowerCase().includes('artisan')) {
          userToStore.role = 'artisan';
          console.log('Determined role from username:', userToStore.role);
        }
        else if (userToStore.email && userToStore.email.toLowerCase().includes('artisan')) {
          userToStore.role = 'artisan';
          console.log('Determined role from email:', userToStore.role);
        }
        else {
          userToStore.role = 'user';
          console.log('Defaulting to user role');
        }
      }
      
      // Ensure role is saved
      console.log('Final user to store:', userToStore);
      console.log('User role to store:', userToStore.role);
      
      localStorage.setItem('tantika_user', JSON.stringify(userToStore));
    }
    
    return response;
  },
  (error) => {
    // Log error
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Handle CORS errors specifically
    if (error.message === 'Network Error' || !error.response) {
      console.error('🚨 Network/CORS Error - Possible issues:');
      console.error('1. Backend server is not running');
      console.error('2. CORS not properly configured');
      console.error('3. Wrong API URL configured');
      console.error(`Current API URL: ${error.config?.baseURL}`);
      console.error(`Frontend URL: ${window.location.origin}`);
      
      return Promise.reject({
        success: false,
        message: `Cannot connect to server. Please check if backend is running and CORS is configured.`,
        isNetworkError: true,
        frontendUrl: window.location.origin,
        backendUrl: error.config?.baseURL
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('tantika_token');
      localStorage.removeItem('tantika_user');
      
      // Only redirect if not on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        // Use setTimeout to avoid React state update issues
        setTimeout(() => {
          window.location.href = '/login?session=expired';
        }, 100);
      }
      
      return Promise.reject({
        success: false,
        message: 'Session expired. Please login again.',
        status: 401
      });
    }
    
    // Handle 403 Forbidden (CORS error from backend)
    if (error.response?.status === 403 && 
        error.response.data?.message?.includes('CORS')) {
      return Promise.reject({
        success: false,
        message: 'CORS Error: Your frontend origin is not allowed by the server.',
        isCorsError: true,
        frontendOrigin: window.location.origin,
        suggestedFix: 'Add your Vercel URL to backend CORS allowed origins'
      });
    }
    
    // Return a consistent error format
    if (error.response?.data) {
      return Promise.reject({
        success: false,
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Default error
    return Promise.reject({
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      status: error.response?.status || 0
    });
  }
);

// ========================
// Auth Service Functions
// ========================
const authServices = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await API.get('/health');
      return {
        success: true,
        message: 'API connection successful',
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  },

  // Register new user (updated for artisan support)
  register: async (userData) => {
    try {
      // Prepare the data based on user role
      const registrationData = {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role || 'user' // Default to 'user' if not specified
      };

      // Add artisan-specific data if registering as artisan
      if (userData.role === 'pending_artisan' || userData.role === 'artisan') {
        registrationData.artisanProfile = {
          ...userData.artisanProfile,
          status: 'pending', // Default status for new artisans
          submittedAt: new Date().toISOString()
        };
      }

      const response = await API.post('/auth/register', registrationData);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message || 
          (userData.role === 'pending_artisan' 
            ? 'Artisan application submitted successfully!' 
            : 'Registration successful!')
      };
    } catch (error) {
      // Re-throw the error for the component to handle
      throw error.response?.data || error;
    }
  },

  // Register as artisan (convenience function)
  registerArtisan: async (userData) => {
    try {
      console.log('Registering artisan:', userData);
      const response = await API.post('/auth/register/artisan', userData);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        artisan: response.data.artisan,
        message: response.data.message
      };
    } catch (error) {
      console.error('Artisan registration error:', error);
      throw error.response?.data || error;
    }
  },

  // Login user (updated for role-based redirection) - FIXED VERSION
  login: async (credentials) => {
    try {
      console.log('Login attempt with:', credentials.email);
      const response = await API.post('/auth/login', credentials);
      
      console.log('Login response:', response.data);
      
      // The interceptor will handle storing user with role
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message || 'Login successful!'
      };
    } catch (error) {
      console.error('Login error details:', error);
      throw error.response?.data || error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await API.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('tantika_token');
      localStorage.removeItem('tantika_user');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await API.get('/auth/me');
      
      // Ensure role is set
      if (response.data.user) {
        response.data.user.role = response.data.user.role || 'user';
      }
      
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      // If unauthorized, clear storage
      if (error.response?.status === 401) {
        localStorage.removeItem('tantika_token');
        localStorage.removeItem('tantika_user');
      }
      throw error.response?.data || error;
    }
  },

  // Get artisan profile (if user is artisan)
  getArtisanProfile: async (userId) => {
    try {
      const response = await API.get(`/artisan/profile/${userId || ''}`);
      return {
        success: true,
        profile: response.data.profile,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update artisan profile
  updateArtisanProfile: async (userId, profileData) => {
    try {
      const response = await API.put(`/artisan/profile/${userId}`, profileData);
      return {
        success: true,
        profile: response.data.profile,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check artisan approval status
  checkArtisanApprovalStatus: async (userId) => {
    try {
      const response = await API.get(`/artisan/status/${userId}`);
      return {
        success: true,
        status: response.data.status,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get pending artisans
  getPendingArtisans: async () => {
    try {
      const response = await API.get('/admin/artisans/pending');
      return {
        success: true,
        artisans: response.data.artisans,
        total: response.data.total
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Approve artisan
  approveArtisan: async (artisanId, adminData) => {
    try {
      const response = await API.post(`/admin/artisans/${artisanId}/approve`, adminData);
      return {
        success: true,
        message: response.data.message,
        artisan: response.data.artisan
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Reject artisan
  rejectArtisan: async (artisanId, rejectionData) => {
    try {
      const response = await API.post(`/admin/artisans/${artisanId}/reject`, rejectionData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await API.post('/auth/forgotpassword', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset password
  resetPassword: async (token, passwords) => {
    try {
      const response = await API.put(`/auth/resetpassword/${token}`, passwords);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('tantika_token');
    if (!token) return false;

    try {
      // Check if token is valid (not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  // NEW: Ensure user has role in localStorage
  ensureUserHasRole: () => {
    const userStr = localStorage.getItem('tantika_user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // If user already has role, return
      if (user.role) return user;
      
      console.log('User missing role, attempting to determine...');
      
      // Try to get role from various sources
      if (user.artisanProfile) {
        user.role = user.artisanProfile.status === 'approved' ? 'artisan' : 'pending_artisan';
      }
      else if (user.username && user.username.toLowerCase().includes('artisan')) {
        user.role = 'artisan';
      }
      else if (user.email && user.email.toLowerCase().includes('artisan')) {
        user.role = 'artisan';
      }
      else {
        user.role = 'user';
      }
      
      console.log('Determined role:', user.role);
      localStorage.setItem('tantika_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error ensuring user has role:', error);
      return null;
    }
  },

  // Check if user is approved artisan
  isApprovedArtisan: () => {
    const user = authServices.getStoredUser();
    return user && user.role === 'artisan' && 
           user.artisanProfile?.status === 'approved';
  },

  // Check if user is pending artisan
  isPendingArtisan: () => {
    const user = authServices.getStoredUser();
    return user && user.role === 'pending_artisan';
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authServices.getStoredUser();
    return user && user.role === 'admin';
  },

  // Get stored user data - FIXED VERSION
  getStoredUser: () => {
    const userStr = localStorage.getItem('tantika_user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // DEBUG
      console.log('Getting stored user:', user);
      console.log('Stored user role:', user.role);
      
      // If no role, try to ensure it
      if (!user.role) {
        return authServices.ensureUserHasRole();
      }
      
      return user;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Update stored user data
  updateStoredUser: (userData) => {
    const currentUser = authServices.getStoredUser();
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        ...userData,
        // Preserve role if not provided in update
        role: userData.role || currentUser.role
      };
      localStorage.setItem('tantika_user', JSON.stringify(updatedUser));
    }
  },

  // Helper: Get redirect path based on user role
  getRedirectPath: () => {
    const user = authServices.getStoredUser();
    
    if (!user) return '/login';
    
    // Ensure user has role
    const userWithRole = user.role ? user : authServices.ensureUserHasRole();
    
    switch (userWithRole.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'artisan':
        if (userWithRole.artisanProfile?.status === 'approved') {
          return '/artisan/dashboard';
        } else {
          return '/artisan/pending-approval';
        }
      case 'pending_artisan':
        return '/artisan/pending-approval';
      default:
        return '/dashboard';
    }
  },

  // Helper: Check if user can access artisan dashboard
  canAccessArtisanDashboard: () => {
    const user = authServices.getStoredUser();
    return user && user.role === 'artisan' && 
           user.artisanProfile?.status === 'approved';
  },

  // Helper: Check if user can access admin dashboard
  canAccessAdminDashboard: () => {
    const user = authServices.getStoredUser();
    return user && user.role === 'admin';
  },

  // Get API configuration (for debugging)
  getConfig: () => {
    return {
      baseURL: API.defaults.baseURL,
      isProduction: window.location.hostname !== 'localhost',
      frontendUrl: window.location.origin,
      backendUrl: API.defaults.baseURL
    };
  },

  // Get artisan dashboard data
  getArtisanDashboard: async () => {
    try {
      const response = await API.get('/artisan/dashboard');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get pending artisan status
  getPendingArtisanStatus: async () => {
    try {
      const response = await API.get('/artisan/pending-status');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get artisan profile
  getArtisanProfile: async () => {
    try {
      const response = await API.get('/artisan/profile');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update artisan profile
  updateArtisanProfile: async (profileData) => {
    try {
      const response = await API.put('/artisan/profile', profileData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get pending artisans
  getPendingArtisans: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await API.get(`/admin/artisans/pending?page=${page}&limit=${limit}&search=${search}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Approve artisan
  approveArtisan: async (artisanId, adminNotes = '') => {
    try {
      const response = await API.put(`/admin/artisans/${artisanId}/approve`, { adminNotes });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Reject artisan
  rejectArtisan: async (artisanId, rejectionReason) => {
    try {
      const response = await API.put(`/admin/artisans/${artisanId}/reject`, { rejectionReason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ========================
  // DEBUG FUNCTIONS
  // ========================
  
  // Debug stored user
  debugStoredUser: () => {
    const userStr = localStorage.getItem('tantika_user');
    const token = localStorage.getItem('tantika_token');
    
    console.log('=== DEBUG STORED USER ===');
    console.log('Token exists:', !!token);
    console.log('User string:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Parsed user:', user);
        console.log('User role:', user.role);
        console.log('User keys:', Object.keys(user));
        
        // Decode token to check payload
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload:', payload);
              console.log('Token role:', payload.role);
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        
        return user;
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    return null;
  },

  // ========================
  // Role-Based Access Control
  // ========================

  // Middleware-like functions for route protection
  requireAuth: (requiredRole = null) => {
    if (!authServices.isAuthenticated()) {
      return {
        allowed: false,
        redirect: '/login',
        message: 'Please login to access this page'
      };
    }

    const user = authServices.getStoredUser();
    
    if (requiredRole) {
      if (user.role !== requiredRole) {
        // Special case: pending artisans trying to access regular artisan dashboard
        if (requiredRole === 'artisan' && user.role === 'pending_artisan') {
          return {
            allowed: false,
            redirect: '/artisan/pending-approval',
            message: 'Your artisan application is under review'
          };
        }
        
        // Deny access for other role mismatches
        return {
          allowed: false,
          redirect: '/dashboard',
          message: 'You do not have permission to access this page'
        };
      }
      
      // Additional checks for specific roles
      if (requiredRole === 'artisan') {
        if (user.artisanProfile?.status !== 'approved') {
          return {
            allowed: false,
            redirect: '/artisan/pending-approval',
            message: 'Your artisan application is not yet approved'
          };
        }
      }
    }

    return { allowed: true, user };
  }
};

export default authServices;