// frontend/src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import authServices from '../services/authServices';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check localStorage directly
      const token = localStorage.getItem('tantika_token');
      const userStr = localStorage.getItem('tantika_user');
      
      console.log("🔍 useAuth checking:", {
        tokenExists: !!token,
        userStrExists: !!userStr
      });
      
      if (token && userStr) {
        // Check if token is valid
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isTokenValid = payload.exp * 1000 > Date.now();
          
          if (isTokenValid) {
            setUser(JSON.parse(userStr));
            console.log("✅ User authenticated");
          } else {
            console.log("❌ Token expired");
            localStorage.removeItem('tantika_token');
            localStorage.removeItem('tantika_user');
            setUser(null);
          }
        } catch (err) {
          console.error("Token error:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const result = await authServices.login(credentials);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authServices.register(userData);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authServices.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };
};

export default useAuth;