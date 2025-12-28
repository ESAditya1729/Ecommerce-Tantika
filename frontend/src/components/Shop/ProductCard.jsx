// src/components/Product/ProductCard.jsx
import { ShoppingBag, Star, MapPin, Eye, Heart, Share2, Info } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderModal from '../Modals/OrderModal'; // Adjust path as needed

const ProductCard = ({ product, onOrderClick, onShare, onAddToWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const navigate = useNavigate();

  // Get product image
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[currentImageIndex] || product.images[0];
    }
    return product.image || null;
  };

  // Handle share button click
  const handleShare = (e) => {
    e.stopPropagation();
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
        navigator.clipboard.writeText(`${window.location.origin}/product/${product._id}`);
        alert('Product link copied to clipboard!');
      }
    }
  };

  // Handle wishlist button click
  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product, !isWishlisted);
    }
  };

  // Handle express interest
  const handleExpressInterest = (e) => {
    e.stopPropagation();
    if (onOrderClick) {
      onOrderClick(product);
    } else {
      // Default: Open OrderModal
      setShowOrderModal(true);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 5) return { text: 'Low Stock', color: 'bg-amber-100 text-amber-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const productImage = getProductImage();
  const stockStatus = getStockStatus(product.stock || 0);

  // Prepare product data for OrderModal
  const productForModal = {
    id: product._id,
    name: product.name,
    price: product.price,
    images: product.images && product.images.length > 0 ? product.images : [product.image],
    artisan: product.artisan || 'Handcrafted by Artisans',
    location: product.location || 'Across India',
    category: product.category,
    description: product.description
  };

  // Handle quick view (eye button)
  const handleQuickView = (e) => {
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Product Images */}
        <div 
          className="relative h-64 bg-gray-100 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Image Navigation */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Quick Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Eye Button - Navigate to Product Details */}
            <button
              onClick={handleQuickView}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
              aria-label="Quick view"
              title="Quick View"
            >
              <Eye className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
              aria-label="Share product"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Featured Badge */}
            {product.isFeatured && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                Featured
              </div>
            )}
            
            {/* New Arrival Badge */}
            {product.isNewArrival && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                New Arrival
              </div>
            )}
            
            {/* Best Seller Badge */}
            {product.isBestSeller && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                Best Seller
              </div>
            )}
          </div>

          {/* Stock Status Badge */}
          <div className="absolute bottom-3 left-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Category and Location */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {product.category}
            </span>
            {product.location && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {product.location.split(',')[0]}
              </div>
            )}
          </div>

          {/* Product Name - Clickable */}
          <h3 
            className="font-bold text-lg mb-2 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating?.toFixed(1) || '0.0'} 
              {product.reviewCount > 0 && ` (${product.reviewCount})`}
            </span>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
            {product.description || 'No description available'}
          </p>

          {/* Price */}
          <div className="mb-6">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-gray-500">
              + Taxes & Shipping
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Express Interest Button */}
            <button
              onClick={handleExpressInterest}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center transition-all ${
                product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg active:scale-95'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Express Interest'}
            </button>

            {/* View Details Button */}
            <button
              onClick={() => navigate(`/product/${product._id}`)}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
            >
              <Info className="w-5 h-5 mr-2" />
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        product={productForModal}
      />
    </>
  );
};

ProductCard.defaultProps = {
  onOrderClick: null,
  onShare: null,
  onAddToWishlist: null,
};

export default ProductCard;