// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Heart, Share2, Star, 
  Package, Truck, Shield, Check, ChevronLeft, 
  ChevronRight, Loader2, Tag, MapPin, Calendar
} from 'lucide-react';
import OrderModal from '../components/Modals/OrderModal'; // Adjust path as needed

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Get API URLs from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const PRODUCTS_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${PRODUCTS_API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
        // Check wishlist status after product is loaded
        checkWishlistStatus(data.product._id);
      } else {
        setError(data.message || 'Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Check wishlist status
  const checkWishlistStatus = async (productId) => {
    try {
      const token = localStorage.getItem('tantika_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/usernorms/wishlist/check/${productId}`, {
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

  const handleExpressInterest = () => {
    setShowOrderModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Product link copied to clipboard!', 'info');
    }
  };

  // Handle wishlist with API
  const handleWishlist = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('tantika_token');
    if (!token) {
      // Redirect to login
      navigate('/login', { 
        state: { 
          from: 'product-details', 
          productId: product._id,
          productName: product.name
        } 
      });
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (stock < 5) return { text: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-lg font-medium mb-3">{error}</div>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">Product not found</div>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock || 0);

  // Prepare product data for OrderModal
  const productForModal = {
    id: product._id,
    name: product.name,
    price: product.price,
    images: product.images && product.images.length > 0 ? product.images : [product.image],
    artisan: product.artisan || 'Unknown Artisan',
    location: product.location || 'Location not specified',
    category: product.category,
    description: product.description
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Shop
        </button>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-4 border border-gray-200">
                {product.images?.[currentImageIndex] || product.image ? (
                  <img
                    src={product.images?.[currentImageIndex] || product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                
                {/* Navigation arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        (prev + 1) % product.images.length
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx 
                          ? 'border-blue-500 shadow-md scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category and Status */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center">
                  <Tag className="w-3 h-3 mr-1.5" />
                  {product.category}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center ${stockStatus.color}`}>
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${
                    stockStatus.color.includes('red') ? 'bg-red-500' : 
                    stockStatus.color.includes('amber') ? 'bg-amber-500' : 
                    'bg-green-500'
                  }`} />
                  {stockStatus.text}
                </span>
                {product.isNewArrival && (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                    New Arrival
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>
              
              {/* Rating and Reviews */}
              <div className="flex items-center">
                <div className="flex mr-3">
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
                <span className="text-gray-600 mr-4">
                  <span className="font-medium">{product.rating?.toFixed(1) || '0.0'}</span>/5.0
                </span>
                {product.reviewCount > 0 && (
                  <span className="text-gray-500">
                    ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500">+ Taxes & Shipping</div>
              </div>

              {/* Stock Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-700">Available Stock</div>
                    <div className="text-sm text-gray-500">{product.stock || 0} units</div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Added {formatDate(product.createdAt)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Additional Info */}
              {product.sku && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Product SKU</div>
                  <div className="font-mono text-gray-700 bg-gray-50 p-2 rounded-lg">
                    {product.sku}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Free Shipping</div>
                    <div className="text-xs text-gray-600">Across India</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Secure Payment</div>
                    <div className="text-xs text-gray-600">100% Secure</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Easy Returns</div>
                    <div className="text-xs text-gray-600">7 Day Return Policy</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                  <Check className="w-5 h-5 text-amber-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Quality Guarantee</div>
                    <div className="text-xs text-gray-600">Handcrafted Excellence</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                {/* Express Interest Button */}
                <button
                  onClick={handleExpressInterest}
                  disabled={product.stock === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6 mr-3" />
                  {product.stock === 0 ? 'Out of Stock' : 'Express Interest'}
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    className={`py-3 rounded-lg font-medium flex items-center justify-center transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {wishlistLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                    )}
                    {wishlistLoading ? 'Processing...' : (isWishlisted ? 'Wishlisted' : 'Wishlist')}
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-3 rounded-lg font-medium flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        product={productForModal}
      />
    </div>
  );
};

export default ProductDetails;