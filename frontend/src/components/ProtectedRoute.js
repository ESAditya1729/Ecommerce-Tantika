import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isAdmin: false,
    loading: true
  });

  useEffect(() => {
    const checkAuth = () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Check both storage locations
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      console.log('Auth check:', { tokenExists: !!token, userExists: !!userStr });

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          const hasAdminRole = userData.role === 'admin' || userData.role === 'superadmin';
          
          console.log('User authenticated:', { 
            role: userData.role, 
            isAdmin: hasAdminRole,
            path: location.pathname 
          });
          
          setAuthState({
            isAuthenticated: true,
            isAdmin: hasAdminRole,
            loading: false
          });
        } catch (error) {
          console.error('Error parsing user:', error);
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            loading: false
          });
        }
      } else {
        console.log('No token or user found');
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          loading: false
        });
      }
    };

    checkAuth();
    
    // Optional: Add event listener to handle storage changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]); // Only depend on pathname

  const { loading, isAuthenticated, isAdmin } = authState;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('ProtectedRoute state:', {
    requireAuth,
    requireAdmin,
    isAuthenticated,
    isAdmin,
    path: location.pathname,
    hasToken: !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
    hasUser: !!(localStorage.getItem('user') || sessionStorage.getItem('user'))
  });

  // CASE 1: Admin route but not authenticated
  if (requireAdmin && !isAuthenticated) {
    console.log('Redirecting to admin login - not authenticated');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // CASE 2: Admin route, authenticated but not admin
  if (requireAdmin && isAuthenticated && !isAdmin) {
    console.log('Redirecting to dashboard - authenticated but not admin');
    return <Navigate to="/dashboard" replace />;
  }

  // CASE 3: Admin route and properly authenticated as admin
  if (requireAdmin && isAuthenticated && isAdmin) {
    console.log('Admin access granted');
    return children;
  }

  // CASE 4: Regular protected route but not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CASE 5: Login/Register page but already authenticated
  if (!requireAuth && isAuthenticated) {
    // IMPORTANT FIX: Check if we're already on the destination path to prevent loops
    const currentPath = location.pathname;
    const targetPath = isAdmin ? "/admin/dashboard" : "/dashboard";
    
    if (currentPath !== targetPath) {
      console.log(`Redirecting to ${targetPath} - already authenticated as ${isAdmin ? 'admin' : 'user'}`);
      return <Navigate to={targetPath} replace />;
    }
    
    // If already on the target path, render children to prevent infinite redirect
    return children;
  }

  // CASE 6: Access granted
  console.log('Access granted');
  return children;
};

export default ProtectedRoute;