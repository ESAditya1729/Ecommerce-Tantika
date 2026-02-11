// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Heart, Share2, Star, 
  Package, Truck, Shield, Check, ChevronLeft, 
  ChevronRight, Loader2, Tag, MapPin, Calendar,
  User, Award, Clock, Sparkles, AlertCircle
} from 'lucide-react';
import OrderModal from '../components/Modals/OrderModal';
import { motion } from 'framer-motion';

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
  const [artisanDetails, setArtisanDetails] = useState(null);
  const [loadingArtisan, setLoadingArtisan] = useState(false);

  // FIXED: Use consistent API URL with /api prefix
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product?.artisan) {
      fetchArtisanDetails(product.artisan);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching product from: ${API_URL}/products/${id}`);
      
      const response = await fetch(`${API_URL}/products/${id}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Product API response:', data);
      
      if (data.success) {
        // Try multiple possible response structures
        const productData = data.product || data.data || null;
        
        if (!productData) {
          throw new Error('Product data not found in response');
        }
        
        console.log('Setting product data:', productData);
        setProduct(productData);
        checkWishlistStatus(productData._id);
      } else {
        throw new Error(data.message || 'Failed to load product');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch artisan details
  const fetchArtisanDetails = async (artisanId) => {
    try {
      setLoadingArtisan(true);
      const token = localStorage.getItem('tantika_token');
      
      console.log(`Fetching artisan: ${API_URL}/artisans/${artisanId}`);
      
      const response = await fetch(`${API_URL}/artisans/${artisanId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArtisanDetails(data.artisan || data.data);
        }
      } else {
        console.log('Artisan not found or unauthorized');
      }
    } catch (error) {
      console.error('Error fetching artisan details:', error);
    } finally {
      setLoadingArtisan(false);
    }
  };

  // Check wishlist status
  const checkWishlistStatus = async (productId) => {
    try {
      const token = localStorage.getItem('tantika_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/usernorms/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.data?.isInWishlist || false);
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
        text: product.description?.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  // Handle wishlist with API
  const handleWishlist = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('tantika_token');
    if (!token) {
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
        const response = await fetch(`${API_URL}/usernorms/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsWishlisted(false);
          alert('Removed from wishlist');
        }
      } else {
        // Add to wishlist
        const wishlistData = {
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || product.image || '',
          productPrice: product.price,
          artisan: artisanDetails?.businessName || artisanDetails?.fullName || 'Tantika Exclusive',
          category: product.category || ''
        };

        const response = await fetch(`${API_URL}/usernorms/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wishlistData)
        });

        if (response.ok) {
          setIsWishlisted(true);
          alert('Added to wishlist');
        } else if (response.status === 400) {
          const data = await response.json();
          if (data.message === 'Product already in wishlist') {
            setIsWishlisted(true);
            alert('Already in wishlist');
          }
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' };
    if (stock < 5) return { text: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'In Stock', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  // Function to get artisan display name
  const getArtisanDisplayName = () => {
    if (artisanDetails) {
      return artisanDetails.businessName || artisanDetails.fullName || 'Tantika Artisan';
    }
    return product.artisanName || 'Tantika Exclusive';
  };

  // Function to get artisan location
  const getArtisanLocation = () => {
    if (artisanDetails?.address) {
      const addr = artisanDetails.address;
      if (addr.city && addr.state) {
        return `${addr.city}, ${addr.state}`;
      } else if (addr.city) {
        return addr.city;
      } else if (addr.state) {
        return addr.state;
      }
    }
    return 'India';
  };

  // Function to get artisan specialization
  const getArtisanSpecialization = () => {
    if (artisanDetails?.specialization && artisanDetails.specialization.length > 0) {
      return artisanDetails.specialization.join(', ');
    }
    return 'Handcrafted Excellence';
  };

  const getProductImages = () => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : [];
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-600">Loading product details...</p>
        <p className="text-sm text-gray-400 mt-2">Product ID: {id}</p>
      </motion.div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error ? 'Error Loading Product' : 'Product Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock || 0);
  const images = getProductImages();

  // Prepare product data for OrderModal
  const productForModal = {
    id: product._id,
    name: product.name,
    price: product.price,
    images: images,
    artisan: getArtisanDisplayName(),
    artisanDetails: artisanDetails,
    location: getArtisanLocation(),
    category: product.category,
    description: product.description,
    stock: product.stock
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x600/f3f4f6/9ca3af?text=Image+Not+Available';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                
                {/* Navigation arrows - only show if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => 
                          prev === 0 ? images.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}
                
                {/* Top badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      Featured
                    </div>
                  )}
                  {product.isNewArrival && (
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      New Arrival
                    </div>
                  )}
                  {product.isBestSeller && (
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      Best Seller
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx 
                          ? 'border-blue-500 shadow-md scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Category and Stock Status */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  {product.category || 'Uncategorized'}
                </span>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${stockStatus.color}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    stockStatus.text.includes('Out') ? 'bg-red-500' : 
                    stockStatus.text.includes('Low') ? 'bg-amber-500' : 
                    'bg-green-500'
                  }`} />
                  {stockStatus.text}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex">
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
                <span className="text-gray-700 font-medium">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
                {product.reviewCount > 0 && (
                  <span className="text-gray-500 text-sm">
                    ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500">Inclusive of taxes • Free shipping over ₹999</div>
              </div>

              {/* Artisan Info */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {loadingArtisan ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">Handcrafted by</span>
                      {artisanDetails?.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {getArtisanDisplayName()}
                    </h3>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getArtisanLocation()}
                      </span>
                      
                      {artisanDetails?.yearsOfExperience > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {artisanDetails.yearsOfExperience} years
                        </span>
                      )}
                    </div>
                    
                    {artisanDetails?.specialization && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">Specializes in</div>
                        <div className="text-sm text-gray-700">{getArtisanSpecialization()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description available for this product.'}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Free Shipping</div>
                    <div className="text-xs text-gray-600">Across India</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Secure Payment</div>
                    <div className="text-xs text-gray-600">100% protected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Easy Returns</div>
                    <div className="text-xs text-gray-600">7-day policy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Check className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="font-medium text-gray-900">Quality Checked</div>
                    <div className="text-xs text-gray-600">Handcrafted</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                {/* Main Action Button */}
                <button
                  onClick={handleExpressInterest}
                  disabled={product.stock === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:shadow-blue-200/50 active:scale-[0.98]'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                  {product.stock === 0 ? 'Out of Stock' : 'Express Interest'}
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {wishlistLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    )}
                    {wishlistLoading ? 'Processing...' : (isWishlisted ? 'Wishlisted' : 'Wishlist')}
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-3 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Stock and Date Info */}
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Available: <span className="font-medium">{product.stock || 0} units</span></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Added {formatDate(product.createdAt)}
                  </span>
                </div>
                {product.sku && (
                  <div className="mt-2">SKU: <span className="font-mono">{product.sku}</span></div>
                )}
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
    </motion.div>
  );
};

export default ProductDetails;