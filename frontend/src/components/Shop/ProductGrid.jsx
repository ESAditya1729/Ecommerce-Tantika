// components/Shop/ProductGrid.jsx
import { Star, ShoppingBag, Eye, Heart, Share2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const ProductGrid = ({ products, isLoading, onExpressInterest, onShare, onAddToWishlist }) => {
  const [wishlistedProducts, setWishlistedProducts] = useState({});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No products available</div>
        <div className="text-gray-500 text-sm">Check back later for new arrivals</div>
      </div>
    );
  }

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

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return null;
  };

  // Handle express interest
  const handleExpressInterest = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Express Interest clicked for:', product.name);
    
    if (onExpressInterest) {
      onExpressInterest(product);
    } else {
      // Fallback: alert or navigate
      alert(`Express interest for: ${product.name}. This would open the order modal.`);
    }
  };

  // Handle wishlist
  const handleWishlist = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isCurrentlyWishlisted = wishlistedProducts[product._id];
    setWishlistedProducts(prev => ({
      ...prev,
      [product._id]: !isCurrentlyWishlisted
    }));
    
    if (onAddToWishlist) {
      onAddToWishlist(product, !isCurrentlyWishlisted);
    }
  };

  // Handle share
  const handleShare = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock || 0);
        const productImage = getProductImage(product);
        const isWishlisted = wishlistedProducts[product._id] || false;
        
        return (
          <div
            key={product._id}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 text-center">No image available</p>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {/* New Arrival Badge */}
                {product.isNewArrival && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                    New Arrival
                  </div>
                )}
                
                {/* Featured Badge */}
                {product.isFeatured && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 shadow-sm">
                    Featured
                  </div>
                )}
                
                {/* Best Seller Badge */}
                {product.isBestSeller && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shadow-sm">
                    Best Seller
                  </div>
                )}
              </div>
              
              {/* Stock Badge */}
              <div className={`absolute ${product.isNewArrival || product.isFeatured || product.isBestSeller ? 'top-16' : 'top-3'} left-3 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
              
              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => handleWishlist(e, product)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <Link 
                  to={`/product/${product._id}`}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="Quick View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </Link>
                <button 
                  onClick={(e) => handleShare(e, product)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
              
              <Link 
                to={`/product/${product._id}`}
                className="block hover:text-blue-600 transition-colors"
              >
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">
                {product.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">+Tax</span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex">
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
                  <span className="text-sm text-gray-500 ml-2">
                    {product.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={(e) => handleExpressInterest(e, product)}
                  disabled={product.stock === 0}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-md'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Express Interest'}
                </button>
                <Link 
                  to={`/product/${product._id}`}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
                >
                  <Info className="w-4 h-4 mr-1.5" />
                  Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Default props
ProductGrid.defaultProps = {
  onExpressInterest: null,
  onShare: null,
  onAddToWishlist: null,
};

export default ProductGrid;