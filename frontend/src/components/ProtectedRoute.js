import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      
      // Get token from BOTH localStorage and sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setIsAuthenticated(true);
        
        try {
          const userData = JSON.parse(user);
          // Check if user has admin role
          const hasAdminRole = userData.role === 'admin' || userData.role === 'superadmin';
          setIsAdmin(hasAdminRole);
          
          // Debug logging
          console.log('User data:', {
            userData,
            role: userData.role,
            isAdmin: hasAdminRole,
            requireAdmin,
            location: location.pathname
          });
        } catch (error) {
          console.error('Error parsing user:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [requireAdmin, location.pathname]);

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
    hasUser: !!localStorage.getItem('user')
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
    // Redirect to admin dashboard if admin, else user dashboard
    if (isAdmin) {
      console.log('Redirecting to admin dashboard - already authenticated as admin');
      return <Navigate to="/admin/dashboard" replace />;
    }
    console.log('Redirecting to user dashboard - already authenticated');
    return <Navigate to="/dashboard" replace />;
  }

  // CASE 6: Access granted
  console.log('Access granted');
  return children;
};

export default ProtectedRoute;