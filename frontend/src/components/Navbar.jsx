import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Home, Info, Phone, X, LogOut, Shield } from "lucide-react";
import logo from "../Assets/TantikaLogo.png";
import useAuth from '../Hooks/useAuth';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Helper function to get correct dashboard path based on user role
// In Navbar.jsx, update getDashboardPath function:
const getDashboardPath = () => {
  // First try to get from AuthContext
  if (user?.role) {
    switch(user.role) {
      case 'artisan':
      case 'pending_artisan':
        return "/artisan/dashboard";
      case 'admin':
      case 'superadmin':
        return "/admin/Addashboard";
      default:
        return "/dashboard";
    }
  }
  
  // If no role in context, check localStorage directly
  try {
    const userStr = localStorage.getItem('tantika_user');
    if (userStr) {
      const storedUser = JSON.parse(userStr);
      
      // Determine role from stored user
      let userRole = storedUser.role;
      
      // If no role, check for artisan indicators
      if (!userRole) {
        const username = storedUser.username || '';
        const email = storedUser.email || '';
        
        if (username.toLowerCase().includes('artisan') || email.toLowerCase().includes('artisan')) {
          userRole = 'artisan';
        } else {
          userRole = 'user';
        }
      }
      
      switch(userRole) {
        case 'artisan':
        case 'pending_artisan':
          return "/artisan/dashboard";
        case 'admin':
        case 'superadmin':
          return "/admin/Addashboard";
        default:
          return "/dashboard";
      }
    }
  } catch (error) {
    console.error('Error determining dashboard path:', error);
  }
  
  // Default fallback
  return "/dashboard";
};

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Handler for Shop navigation
  const handleShopClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    
    if (isAuthenticated) {
      navigate("/shop");
    } else {
      navigate("/login", { state: { from: "/shop" } });
    }
  };

  // Handler for Enter Shop/Go to Shop navigation
  const handleEnterShopClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    
    if (isAuthenticated) {
      navigate(getDashboardPath());
    } else {
      navigate("/login", { state: { from: getDashboardPath() } });
    }
  };

  // Handler for Join Us navigation
  const handleJoinUsClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    
    if (isAuthenticated) {
      navigate(getDashboardPath());
    } else {
      navigate("/register");
    }
  };

  // Handler for Admin Panel navigation
  const handleAdminPanelClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    navigate("/admin/Addashboard");
  };

  // Handler for Logout
  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Image */}
          <Link
            to="/"
            className="flex items-center space-x-3"
            onClick={closeMobileMenu}
          >
            <img
              src={logo}
              alt="তন্তিকা Logo"
              className="h-16 w-16 md:h-20 md:w-20 object-contain"
            />
            <span className="text-3xl font-bold text-blue-600">তন্তিকা</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
              onClick={closeMobileMenu}
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
            
            {/* Shop Link - Conditionally navigate based on auth */}
            <button
              onClick={handleShopClick}
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg bg-transparent border-none cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop
            </button>
            
            <Link
              to="/about"
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
              onClick={closeMobileMenu}
            >
              <Info className="w-5 h-5 mr-2" />
              About
            </Link>
            <Link
              to="/contact"
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
              onClick={closeMobileMenu}
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact
            </Link>
          </div>

          {/* Right Side - Authentication Buttons */}
          <div className="flex items-center space-x-6">
            {/* Cart Icon - Only show if authenticated
            {isAuthenticated && (
              <Link to="/cart" className="relative hidden md:block">
                <ShoppingBag className="w-7 h-7 text-gray-700 hover:text-blue-600" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  0
                </span>
              </Link>
            )} */}

            {/* Desktop Authentication Buttons - Conditional */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* User Profile/Dashboard */}
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                    onClick={closeMobileMenu}
                  >
                    <User className="w-5 h-5 mr-2" />
                    {user?.name || "Dashboard"}
                  </Link>
                  
                  {/* ADMIN ONLY: Admin Panel Button */}
                  {isAdmin && (
                    <button
                      onClick={handleAdminPanelClick}
                      className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Admin Panel
                    </button>
                  )}
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center border-2 border-red-500 text-red-500 px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Enter Shop Button */}
                  <button
                    onClick={handleEnterShopClick}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Enter Shop
                  </button>

                  {/* Join Us Button */}
                  <button
                    onClick={handleJoinUsClick}
                    className="border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                  >
                    Join Us
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden ml-4"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-8 h-8 text-gray-700" />
              ) : (
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-2 pt-4 pb-6 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg"
                onClick={closeMobileMenu}
              >
                <Home className="w-5 h-5 mr-3" />
                Home
              </Link>
              
              {/* Shop in Mobile Menu */}
              <button
                onClick={handleShopClick}
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-left w-full"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Shop
              </button>
              
              <Link
                to="/about"
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg"
                onClick={closeMobileMenu}
              >
                <Info className="w-5 h-5 mr-3" />
                About
              </Link>
              <Link
                to="/contact"
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg"
                onClick={closeMobileMenu}
              >
                <Phone className="w-5 h-5 mr-3" />
                Contact
              </Link>

              {/* Cart in Mobile Menu - Only if authenticated */}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg"
                  onClick={closeMobileMenu}
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  Cart
                  <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    0
                  </span>
                </Link>
              )}

              {/* Mobile Authentication Buttons - Conditional */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col space-y-3">
                  {isAuthenticated ? (
                    <>
                      {/* Dashboard Link */}
                      <Link
                        to={getDashboardPath()}
                        className="flex items-center justify-center bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-semibold"
                        onClick={closeMobileMenu}
                      >
                        <User className="w-5 h-5 mr-2" />
                        Dashboard
                      </Link>
                      
                      {/* ADMIN ONLY: Admin Panel Button (Mobile) */}
                      {isAdmin && (
                        <button
                          onClick={handleAdminPanelClick}
                          className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
                        >
                          <Shield className="w-5 h-5 mr-2" />
                          Admin Panel
                        </button>
                      )}
                      
                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg font-semibold hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Go to Shop Button */}
                      <button
                        onClick={handleEnterShopClick}
                        className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Go to Shop
                      </button>
                      
                      {/* Join Us Button */}
                      <button
                        onClick={handleJoinUsClick}
                        className="flex items-center justify-center border-2 border-blue-500 text-blue-500 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50"
                      >
                        Join Us
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add fade-in animation to CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;