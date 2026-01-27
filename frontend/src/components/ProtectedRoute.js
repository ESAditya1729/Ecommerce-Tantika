import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = [] }) => {
  const location = useLocation();
  
  // Synchronous check - no useEffect, no loading state
  const token = localStorage.getItem("tantika_token");
  const userStr = localStorage.getItem("tantika_user");

  // If no token or user data, redirect to login with return URL
  if (!token || !userStr) {
    console.log("❌ No auth data, redirecting to /login");
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const userRole = user.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    // ⚠️ CRITICAL FIX: Check for pending_artisan role first!
    if (userRole === "pending_artisan") {
      // Only allow access to pending approval page
      if (location.pathname !== "/artisan/pending-approval") {
        console.log("❌ Pending artisan accessing restricted route, redirecting to pending-approval");
        return <Navigate to="/artisan/pending-approval" replace />;
      }
    }

    // If admin access is required but user is not admin
    if (requireAdmin && !isAdmin) {
      console.log("❌ Not admin, redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;
    }

    // ✅ Optional: Role-based access control with allowedRoles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log(`❌ Role ${userRole} not in allowed roles: ${allowedRoles}`);
      
      // Redirect based on role
      if (userRole === "pending_artisan") {
        return <Navigate to="/artisan/pending-approval" replace />;
      } else if (isAdmin) {
        return <Navigate to="/admin/Addashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }

    // If everything is good, render the children
    console.log("✅ Access granted for role:", userRole);
    return children;

  } catch (error) {
    console.error("❌ Error parsing user data:", error);
    // Clear invalid data
    localStorage.removeItem("tantika_token");
    localStorage.removeItem("tantika_user");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;