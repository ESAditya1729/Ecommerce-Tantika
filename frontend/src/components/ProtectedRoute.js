import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  allowedRoles = [], 
  requireArtisanApproval = false 
}) => {
  const location = useLocation();
  
  const token = localStorage.getItem("tantika_token");
  const userStr = localStorage.getItem("tantika_user");

  // ==============================================
  // CHECK FOR REDIRECT AFTER LOGIN
  // ==============================================
  // Check if there's a saved redirect path in sessionStorage (for shared links)
  const savedRedirectPath = sessionStorage.getItem("redirectAfterLogin");
  
  // If we're on the login page and there's a saved redirect, we don't want to process it here
  // This check is for protected routes

  // Check if user is authenticated
  if (!token || !userStr) {
    // Store the current path they tried to access
    // Use sessionStorage so it persists through the login/register flow
    // but gets cleared when the tab is closed
    sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
    
    console.log('Protected route accessed, saving redirect path:', location.pathname + location.search);
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // SIMPLE ROLE DETERMINATION
    let userRole = user.role;
    
    // If no role property, determine it
    if (!userRole) {
      // Artisan users typically have artisan in username/email
      const username = user.username || '';
      const email = user.email || '';
      
      if (username.toLowerCase().includes('artisan') || email.toLowerCase().includes('artisan')) {
        userRole = 'artisan';
      } else {
        userRole = 'user';
      }
      
      // Update localStorage with determined role
      user.role = userRole;
      localStorage.setItem('tantika_user', JSON.stringify(user));
    }
    
    // ==============================================
    // CHECK FOR PENDING REDIRECT AFTER LOGIN/REGISTER
    // ==============================================
    // After successful authentication, check if there's a saved redirect path
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    
    // Clear it immediately to prevent infinite loops
    sessionStorage.removeItem("redirectAfterLogin");
    
    // If there's a saved redirect path and we're not already on that path,
    // redirect the user to their intended destination
    if (redirectPath && redirectPath !== location.pathname) {
      console.log('Redirecting to saved path:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
    
    // ==============================================
    // RESTRICT ARTISANS FROM SHOP/STORE PAGES
    // ==============================================
    const shopRoutes = ['/shop', '/products', '/store', '/catalog'];
    const isShopRoute = shopRoutes.some(route => location.pathname.startsWith(route));
    
    if ((userRole === 'artisan' || userRole === 'pending_artisan') && isShopRoute) {
      // Artisans should not access the main shop - redirect to artisan dashboard
      console.log('Artisan attempting to access shop, redirecting to artisan dashboard');
      return <Navigate to="/artisan/dashboard" replace />;
    }
    
    // ==============================================
    // SPECIAL CASE: ARTISAN ACCESSING /dashboard
    // ==============================================
    if ((userRole === 'artisan' || userRole === 'pending_artisan') && location.pathname === '/dashboard') {
      return <Navigate to="/artisan/dashboard" replace />;
    }
    
    // ==============================================
    // SPECIAL CASE: REGULAR USER ACCESSING ARTISAN ROUTES
    // ==============================================
    const artisanRoutes = ['/artisan/', '/inventory', '/my-products', '/seller'];
    const isArtisanRoute = artisanRoutes.some(route => location.pathname.startsWith(route));
    
    if (userRole === 'user' && isArtisanRoute) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // ==============================================
    // ROLE-BASED ACCESS FOR /artisan/dashboard
    // ==============================================
    if (location.pathname === '/artisan/dashboard' || isArtisanRoute) {
      // Allow only artisans and pending_artisans
      if (userRole === 'artisan' || userRole === 'pending_artisan') {
        return children;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    
    // ==============================================
    // ALLOWED ROLES CHECK
    // ==============================================
    if (allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect based on role
        if (userRole === 'artisan' || userRole === 'pending_artisan') {
          return <Navigate to="/artisan/dashboard" replace />;
        } else {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
    
    // ==============================================
    // REQUIRE ADMIN CHECK
    // ==============================================
    if (requireAdmin && userRole !== 'admin' && userRole !== 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
    
    // ==============================================
    // ALLOW ACCESS
    // ==============================================
    return children;

  } catch (error) {
    console.error('ProtectedRoute error:', error);
    localStorage.removeItem("tantika_token");
    localStorage.removeItem("tantika_user");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;