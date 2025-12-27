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
           'https://your-backend-production-url.herokuapp.com/api'; // CHANGE THIS!
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
// Response Interceptor
// ========================
API.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    
    // If the response contains a token, store it
    if (response.data?.token) {
      localStorage.setItem('tantika_token', response.data.token);
    }
    
    // If the response contains user data, store it
    if (response.data?.user) {
      localStorage.setItem('tantika_user', JSON.stringify(response.data.user));
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

  // Register new user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      // Re-throw the error for the component to handle
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
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

  // Get stored user data
  getStoredUser: () => {
    const userStr = localStorage.getItem('tantika_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update stored user data
  updateStoredUser: (userData) => {
    const currentUser = authServices.getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('tantika_user', JSON.stringify(updatedUser));
    }
  },

  // Get API configuration (for debugging)
  getConfig: () => {
    return {
      baseURL: API.defaults.baseURL,
      isProduction: window.location.hostname !== 'localhost',
      frontendUrl: window.location.origin,
      backendUrl: API.defaults.baseURL
    };
  }
};

export default authServices;