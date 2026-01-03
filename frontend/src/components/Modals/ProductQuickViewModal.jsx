import React, { useState, useEffect } from 'react';
import { 
  X, Star, ShoppingBag, Heart, Share2, Package, 
  ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';

const ProductQuickViewModal = ({ product, isOpen, onClose, onExpressInterest }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Get API base URL from environment
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // Check wishlist status when modal opens
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isOpen || !product) return;

      try {
        const token = localStorage.getItem('tantika_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/usernorms/wishlist/check/${product._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsWishlisted(data.data.isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[currentImageIndex] || product.images[0];
    }
    return product.image || null;
  };

  const nextImage = () => {
    const totalImages = product.images?.length || (product.image ? 1 : 0);
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    const totalImages = product.images?.length || (product.image ? 1 : 0);
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Handle wishlist with API
  const handleWishlistToggle = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('tantika_token');
    if (!token) {
      // Redirect to login
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&productId=${product._id}`;
      return;
    }

    setWishlistLoading(true);
    
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`${API_BASE_URL}/api/usernorms/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsWishlisted(false);
          showNotification('Removed from wishlist', 'info');
        }
      } else {
        // Add to wishlist
        const wishlistData = {
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || product.image || '',
          productPrice: product.price,
          artisan: product.artisan || 'Unknown Artisan',
          category: product.category || ''
        };

        const response = await fetch(`${API_BASE_URL}/api/usernorms/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wishlistData)
        });

        if (response.ok) {
          setIsWishlisted(true);
          showNotification('Added to wishlist', 'success');
        } else if (response.status === 400) {
          const data = await response.json();
          if (data.message === 'Product already in wishlist') {
            setIsWishlisted(true);
            showNotification('Already in wishlist', 'info');
          }
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showNotification('Failed to update wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    // Replace with your toast/notification system
    if (type === 'success') {
      alert(`✅ ${message}`);
    } else if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `${window.location.origin}/product/${product._id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product._id}`);
      showNotification('Product link copied to clipboard!', 'info');
    }
  };

  // Handle express interest
  const handleExpressInterest = () => {
    if (onExpressInterest) {
      onExpressInterest(product);
      onClose();
    } else {
      // Default action
      onClose();
      window.location.href = `/product/${product._id}`;
    }
  };

  // Navigate to product details
  const handleViewDetails = () => {
    onClose();
    window.location.href = `/product/${product._id}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Product Images */}
          <div className="lg:w-1/2 bg-gray-100">
            <div className="relative h-64 lg:h-full">
              {getProductImage() ? (
                <>
                  <img
                    src={getProductImage()}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Navigation arrows */}
                  {(product.images?.length > 1 || product.image) && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto max-h-[60vh] lg:max-h-[90vh]">
            <div className="space-y-6">
              {/* Category */}
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block">
                {product.category}
              </div>
              
              {/* Product Name */}
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h2>
              
              {/* Rating */}
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating?.toFixed(1) || '0.0'} 
                  {product.reviewCount > 0 && ` (${product.reviewCount} reviews)`}
                </span>
              </div>
              
              {/* Price */}
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500">+ Taxes & Shipping</div>
              </div>
              
              {/* Stock Status */}
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                product.stock === 0 
                  ? 'bg-red-100 text-red-800' 
                  : product.stock < 5 
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  product.stock === 0 
                    ? 'bg-red-500' 
                    : product.stock < 5 
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                }`} />
                {product.stock === 0 
                  ? 'Out of Stock' 
                  : product.stock < 5 
                    ? `Only ${product.stock} left in stock`
                    : 'In Stock'}
              </div>
              
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`p-3 rounded-full border hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  {wishlistLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:scale-105 transition-all"
                  title="Share Product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Express Interest Button */}
              <button
                onClick={handleExpressInterest}
                disabled={product.stock === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                  product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl active:scale-95'
                }`}
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                {product.stock === 0 ? 'Out of Stock' : 'Express Interest'}
              </button>
              
              {/* View Full Details */}
              <button
                onClick={handleViewDetails}
                className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
              >
                View full product details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;