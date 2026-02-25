// src/components/Product/ProductCard.jsx
import {
  ShoppingBag,
  Star,
  MapPin,
  Eye,
  Share2,
  Info,
  Tag,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderModal from "../Modals/OrderModal";

const ProductCard = ({ product, onOrderClick, onShare }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get user info on mount
  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem("tantika_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      return null;
    }
  };

  // Handle express interest
  const handleExpressInterest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    console.log("Express Interest clicked for:", product.name);
    console.log("Product data:", product);
    
    const userInfo = getUserInfo();

    if (userInfo) {
      console.log("Showing modal...");
      setShowOrderModal(true);
    } else {
      navigate("/login", {
        state: {
          from: "express-interest",
          productId: product._id,
          productName: product.name,
        },
      });
    }
  };

  // Handle share
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    if (onShare) {
      onShare(product);
    } else {
      if (navigator.share) {
        navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/product/${product._id}`,
        });
      } else {
        navigator.clipboard.writeText(
          `${window.location.origin}/product/${product._id}`,
        );
        alert("Product link copied to clipboard!");
      }
    }
  };

  // Quick view
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    navigate(`/product/${product._id}`);
  };

  // Image dot click
  const handleImageDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setCurrentImageIndex(index);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        text: "Out of Stock",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: "❌",
      };
    if (stock < 5)
      return {
        text: "Low Stock",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "⚡",
      };
    return {
      text: "In Stock",
      color: "bg-green-50 text-green-700 border-green-200",
      icon: "✅",
    };
  };

  const productImage = product.images?.[currentImageIndex] || product.image || null;
  const stockStatus = getStockStatus(product.stock || 0);

  // Product rating stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rating || 0)) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />,
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-gray-300 text-gray-300" />,
        );
      }
    }
    return stars;
  };

  // Helper function to get artisan ID properly
  const getArtisanId = () => {
    if (!product) return null;
    
    // Try to get artisan ID from various possible locations
    if (product.artisan) {
      if (typeof product.artisan === 'object' && product.artisan !== null) {
        return product.artisan._id || product.artisan.id;
      }
      return product.artisan; // If it's a string ID
    }
    if (product.artisanId) {
      return product.artisanId;
    }
    if (product.artisan_id) {
      return product.artisan_id;
    }
    if (product.createdBy) {
      if (typeof product.createdBy === 'object' && product.createdBy._id) {
        return product.createdBy._id;
      }
      return product.createdBy;
    }
    return null;
  };

  // Helper function to get artisan display name
  const getArtisanDisplayName = () => {
    if (!product) return "Tantika Artisan";
    
    if (product.artisanName && typeof product.artisanName === 'string') {
      return product.artisanName;
    }
    if (product.artisan) {
      if (typeof product.artisan === 'object' && product.artisan !== null) {
        return product.artisan.businessName || product.artisan.name || product.artisan.fullName || "Artisan";
      }
      return String(product.artisan);
    }
    return "Tantika Artisan";
  };

  // Helper function to get artisan location
  const getArtisanLocation = () => {
    if (!product) return "India";
    
    if (product.location) return product.location;
    if (product.origin) return product.origin;
    if (product.artisanLocation) return product.artisanLocation;
    
    // If artisan is an object with address
    if (product.artisan && typeof product.artisan === 'object' && product.artisan.address) {
      const addr = product.artisan.address;
      if (addr.city && addr.state) {
        return `${addr.city}, ${addr.state}`;
      } else if (addr.city) {
        return addr.city;
      } else if (addr.state) {
        return addr.state;
      }
    }
    
    return "India";
  };

  // Prepare product data for OrderModal - FIXED STRUCTURE
  const productForModal = {
    _id: product._id,  // MongoDB ID
    id: product._id,    // For compatibility
    name: product.name || product.title,
    price: product.price || 0,
    images: (product.images && product.images.length > 0) ? product.images : 
            (product.image ? [product.image] : []),
    image: product.image || (product.images?.[0] || ''),
    artisanId: getArtisanId(),
    artisan: {
      _id: getArtisanId(),
      businessName: getArtisanDisplayName(),
      name: getArtisanDisplayName()
    },
    artisanName: getArtisanDisplayName(),
    location: getArtisanLocation(),
    origin: getArtisanLocation(),
    category: product.category || 'Uncategorized',
    description: product.description || '',
    stock: product.stock || 0,
    sku: product.sku || ''
  };

  // Navigate to product details
  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <>
      {/* MAIN CARD CONTAINER */}
      <div
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - Make clickable for product details */}
        <div 
          className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer"
          onClick={handleProductClick}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No image</p>
              </div>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isFeatured && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>Featured</span>
              </div>
            )}

            {product.isNewArrival && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                <Zap className="w-3 h-3" />
                <span>New</span>
              </div>
            )}
          </div>

          {/* Stock Status Badge */}
          <div
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold border ${stockStatus.color} shadow-sm`}
          >
            <span className="mr-1">{stockStatus.icon}</span>
            {stockStatus.text}
          </div>

          {/* Quick Action Buttons */}
          <div
            className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={handleQuickView}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
              aria-label="View details"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={handleShare}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
              aria-label="Share product"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Image Dots */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden group-hover:flex space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleImageDotClick(e, index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          {/* Category and Location */}
          <div className="flex items-center justify-between mb-3">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-blue-700"
              onClick={handleProductClick}
            >
              <Tag className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 hover:underline">
                {product.category || 'Uncategorized'}
              </span>
            </div>

            {product.location && (
              <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                <MapPin className="w-3 h-3 mr-1" />
                {product.location.split(",")[0]}
              </div>
            )}
          </div>

          {/* Product Name - Clickable */}
          <h3 
            className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={handleProductClick}
          >
            {product.name}
          </h3>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
            {product.description ||
              "A beautiful handcrafted piece made with care and tradition."}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(product.rating || 0)}</div>
              <span className="text-sm text-gray-700 font-medium">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
            </div>
            {product.reviewCount > 0 && (
              <span className="text-xs text-gray-500">
                {product.reviewCount} review
                {product.reviewCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Artisan Info - Small */}
          <div className="mb-3 flex items-center gap-1 text-xs text-gray-600">
            <span>By</span>
            <span className="font-medium text-blue-600 truncate max-w-[120px]">
              {getArtisanDisplayName()}
            </span>
          </div>

          {/* Price */}
          <div className="mb-5">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-gray-500">
              Free shipping • 14-day returns
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExpressInterest}
              disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center transition-all ${
                product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
              }`}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Express Interest"}
            </button>

            <button
              onClick={handleProductClick}
              className="px-5 py-3 rounded-xl font-semibold flex items-center justify-center border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Modal - Pass the properly formatted product */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => {
          console.log("Closing order modal from card");
          setShowOrderModal(false);
        }}
        product={productForModal}
        userId={user?._id}
      />
    </>
  );
};

ProductCard.defaultProps = {
  onOrderClick: null,
  onShare: null,
};

export default ProductCard;