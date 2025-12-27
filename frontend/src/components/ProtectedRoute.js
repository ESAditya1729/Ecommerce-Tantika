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
      
      if (requireAdmin) {
        // Check admin authentication
        const adminToken = localStorage.getItem('admin_token');
        const adminUser = localStorage.getItem('admin_user');
        const isAdminAuthenticated = !!(adminToken && adminUser);
        
        setIsAuthenticated(isAdminAuthenticated);
        
        if (isAdminAuthenticated && adminUser) {
          try {
            const userData = JSON.parse(adminUser);
            // Check if user has admin role
            setIsAdmin(userData.role?.toLowerCase().includes('admin') || 
                      userData.role?.toLowerCase().includes('super'));
          } catch (error) {
            console.error('Error parsing admin user:', error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } else {
        // Check regular user authentication
        const userToken = localStorage.getItem('tantika_token');
        const userData = localStorage.getItem('tantika_user');
        setIsAuthenticated(!!(userToken && userData));
        setIsAdmin(false); // Not checking for admin here
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [requireAdmin, location.pathname]); // Added location.pathname to re-check on route change

  if (loading) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Debug logging (remove in production)
  console.log('ProtectedRoute debug:', {
    requireAuth,
    requireAdmin,
    isAuthenticated,
    isAdmin,
    path: location.pathname
  });

  // If admin route but not admin authenticated
  if (requireAdmin && !isAuthenticated) {
    console.log('Redirecting to admin login - not authenticated');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If admin route, authenticated but not admin
  if (requireAdmin && isAuthenticated && !isAdmin) {
    console.log('Redirecting to dashboard - not admin');
    return <Navigate to="/dashboard" replace />;
  }

  // If admin route and properly authenticated as admin
  if (requireAdmin && isAuthenticated && isAdmin) {
    console.log('Admin access granted');
    return children;
  }

  // Regular user routes
  if (requireAuth && !isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    console.log('Redirecting to dashboard - already authenticated');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Regular access granted');
  return children;
};

export default ProtectedRoute;