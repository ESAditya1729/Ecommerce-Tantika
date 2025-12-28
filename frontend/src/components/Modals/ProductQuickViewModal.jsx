// src/components/Product/ProductQuickViewModal.jsx
import React from 'react';
import { X, Star, ShoppingBag, Heart, Share2, Package, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductQuickViewModal = ({ product, isOpen, onClose, onExpressInterest }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  
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
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-full border ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  } hover:scale-105 transition-all`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="p-3 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:scale-105 transition-all"
                  title="Share Product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Express Interest Button */}
              <button
                onClick={() => {
                  onExpressInterest(product);
                  onClose();
                }}
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
                onClick={() => {
                  onClose();
                  // You can navigate to product details page here
                  window.location.href = `/product/${product._id}`;
                }}
                className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                View full product details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;