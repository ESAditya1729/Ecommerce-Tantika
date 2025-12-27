import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if using HTTP-only cookies
});

// Add token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tantika_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
API.interceptors.response.use(
  (response) => {
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('tantika_token');
      localStorage.removeItem('tantika_user');
      
      // Only redirect if not on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // Return a consistent error format
    if (error.response?.data) {
      return Promise.reject({
        success: false,
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        status: error.response.status
      });
    }
    
    return Promise.reject({
      success: false,
      message: 'Network error. Please check your connection.',
      status: 0
    });
  }
);

const authServices = {
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

  // Login user (can use email or username)
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

  // Refresh token (optional - for implementing token refresh later)
  refreshToken: async () => {
    try {
      const response = await API.post('/auth/refresh-token');
      return {
        success: true,
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default authServices;