import React, { createContext, useState, useContext, useEffect } from 'react';
import authServices from '../services/authServices';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check if token exists and is valid
      const isAuthenticated = authServices.isAuthenticated();
      
      // ALWAYS ensure user has role before proceeding
      const userWithRole = authServices.ensureUserHasRole();
      
      if (isAuthenticated && userWithRole) {
        // Store the user with role in state
        setUser(userWithRole);
        
        // Optionally verify with backend (but don't overwrite role)
        try {
          const result = await authServices.getCurrentUser();
          
          // Merge fresh data with existing role
          const mergedUser = {
            ...result.user,
            role: result.user.role || userWithRole.role // Preserve role
          };
          
          setUser(mergedUser);
          authServices.updateStoredUser(mergedUser);
        } catch (err) {
          // Use stored user with role
          setUser(userWithRole);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authServices.login(credentials);
      
      // Ensure the user has a role
      const userWithRole = authServices.ensureUserHasRole();
      
      // Set user with role
      setUser(userWithRole || result.user);
      
      return { success: true, user: userWithRole || result.user };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authServices.register(userData);
      
      // Ensure the user has a role
      const userWithRole = authServices.ensureUserHasRole();
      setUser(userWithRole || result.user);
      
      return { success: true, user: userWithRole || result.user };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authServices.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    // Ensure role is preserved
    const userToUpdate = {
      ...updatedUser,
      role: updatedUser.role || user?.role
    };
    
    setUser(userToUpdate);
    authServices.updateStoredUser(userToUpdate);
  };

  // Helper to get user role safely
  const getUserRole = () => {
    if (!user) return null;
    
    // Try different possible role properties
    return user.role || user.userRole || 'user';
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    getUserRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;