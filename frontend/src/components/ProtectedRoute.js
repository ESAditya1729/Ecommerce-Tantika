import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
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
    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // If admin access is required but user is not admin
    if (requireAdmin && !isAdmin) {
      console.log("❌ Not admin, redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;
    }

    // If everything is good, render the children
    console.log("✅ Access granted!");
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