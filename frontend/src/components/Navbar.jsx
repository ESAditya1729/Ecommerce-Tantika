import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Home, Info, Phone, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold text-blue-600" onClick={closeMobileMenu}>
            তন্তিকা
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-10">
            <Link 
              to="/" 
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
            <Link 
              to="/products" 
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop
            </Link>
            <Link 
              to="/about" 
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
            >
              <Info className="w-5 h-5 mr-2" />
              About
            </Link>
            <Link 
              to="/contact" 
              className="flex items-center text-gray-800 hover:text-blue-600 font-semibold text-lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact
            </Link>
          </div>

          {/* Right Side - Authentication Buttons */}
          <div className="flex items-center space-x-6">
            {/* Cart Icon (optional) */}
            <Link to="/cart" className="relative hidden md:block">
              <ShoppingBag className="w-7 h-7 text-gray-700 hover:text-blue-600" />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Desktop Authentication Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
              >
                <User className="w-5 h-5 mr-2" />
                Enter Shop
              </Link>
              
              <Link 
                to="/register" 
                className="border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center"
              >
                Join Us
              </Link>
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
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
              <Link 
                to="/products" 
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg"
                onClick={closeMobileMenu}
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Shop
              </Link>
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
              
              {/* Cart in Mobile Menu */}
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
              
              {/* Mobile Authentication Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold text-center hover:from-blue-600 hover:to-purple-600 flex items-center justify-center"
                    onClick={closeMobileMenu}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Go to Shop
                  </Link>
                  <Link 
                    to="/register" 
                    className="border-2 border-blue-500 text-blue-500 px-4 py-3 rounded-lg font-semibold text-center hover:bg-blue-50 flex items-center justify-center"
                    onClick={closeMobileMenu}
                  >
                    Join Us
                  </Link>
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