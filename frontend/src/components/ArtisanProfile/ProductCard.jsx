import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaStar, FaShoppingBag, FaImage } from 'react-icons/fa';
import OrderModal from '../Modals/OrderModal';

const ProductCard = ({ product }) => {
  const location = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get user info on mount
  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem("tantika_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      return null;
    }
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

  // Get the primary image - FIXED: Handle image from API response
  const getPrimaryImage = () => {
    if (imageError) return null;
    
    // Check for image in various possible locations
    if (product.image && product.image !== null) return product.image;
    if (product.images && product.images.length > 0) {
      return product.images[currentImage] || product.images[0];
    }
    if (product.galleryImages && product.galleryImages.length > 0) {
      const primary = product.galleryImages.find(img => img.isPrimary);
      return primary ? primary.url : product.galleryImages[0].url;
    }
    return null;
  };

  // Get all images for gallery - FIXED: Handle image from API response
  const getAllImages = () => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    if (product.galleryImages && product.galleryImages.length > 0) {
      return product.galleryImages.map(img => img.url);
    }
    if (product.image && product.image !== null) {
      return [product.image];
    }
    return [];
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // UPDATED: Using sessionStorage instead of state
  const handleExpressInterest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Express Interest clicked for:", product.name);
    
    const userInfo = getUserInfo();

    if (userInfo) {
      console.log("Showing order modal...");
      setShowOrderModal(true);
    } else {
      // Store the current path and product info in sessionStorage
      sessionStorage.setItem("redirectAfterLogin", location.pathname);
      
      // Store product interest details for after login
      sessionStorage.setItem("pendingProductInterest", JSON.stringify({
        productId: product.id,
        productName: product.name,
        intent: "express-interest",
        timestamp: Date.now()
      }));
      
      console.log("Saved redirect path to sessionStorage:", location.pathname);
      console.log("Saved product interest:", product.name);
      
      // Navigate to login
      navigate("/login");
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice || 0);
  };

  const images = getAllImages();
  const primaryImage = getPrimaryImage();
  const hasMultipleImages = images.length > 1;

  // Calculate discount percentage
  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Format rating
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  // Check if in stock - FIXED: Handle stock from API response
  const inStock = product.stock > 0 && product.status === 'active';

  // Prepare product data for OrderModal - Now all helper functions are defined above
  const productForModal = {
    _id: product.id,  // MongoDB ID (using product.id as fallback)
    id: product.id,    // For compatibility
    name: product.name || product.title,
    price: product.price || 0,
    images: getAllImages(),
    image: getPrimaryImage() || '',
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

  // Check after component mount if we should show the modal (user just logged in)
  useEffect(() => {
    // Check if there's pending product interest in sessionStorage
    const pendingInterest = sessionStorage.getItem("pendingProductInterest");
    
    if (pendingInterest && user) {
      try {
        const interest = JSON.parse(pendingInterest);
        // Check if this product matches the pending interest
        if (interest.productId === product.id && interest.intent === "express-interest") {
          console.log("Found pending interest for this product, showing modal");
          setShowOrderModal(true);
          // Clear the pending interest
          sessionStorage.removeItem("pendingProductInterest");
        }
      } catch (err) {
        console.error("Error parsing pending interest:", err);
        sessionStorage.removeItem("pendingProductInterest");
      }
    }
  }, [user, product.id]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCurrentImage(0);
        }}
      >
        <Link to={`/product/${product.id}`} className="block">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {primaryImage && !imageError ? (
              <motion.img
                key={currentImage}
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <FaImage className="text-4xl mb-2" />
                <span className="text-sm">No image</span>
              </div>
            )}

            {/* Image Gallery Dots - Only show if multiple images exist and no error */}
            {hasMultipleImages && !imageError && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      index === currentImage 
                        ? 'bg-orange-500 w-3' 
                        : 'bg-white/80 hover:bg-white'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImage(index);
                      setImageError(false); // Reset error when changing image
                    }}
                    whileHover={{ scale: 1.2 }}
                    animate={index === currentImage ? { scale: [1, 1.2, 1] } : {}}
                  />
                ))}
              </div>
            )}

            {/* Wishlist Button */}
            <motion.button
              onClick={handleWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10"
            >
              <AnimatePresence mode="wait">
                {isWishlisted ? (
                  <motion.div
                    key="heart-filled"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <FaHeart className="text-red-500 text-lg" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="heart-outline"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <FaRegHeart className="text-gray-600 text-lg hover:text-red-500 transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Discount Badge */}
            {product.originalPrice && discountPercentage > 0 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10"
              >
                {discountPercentage}% OFF
              </motion.div>
            )}

            {/* Out of Stock Overlay */}
            {!inStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
              >
                <span className="text-white font-semibold px-4 py-2 bg-red-500 rounded-lg shadow-lg">
                  Out of Stock
                </span>
              </motion.div>
            )}

            {/* Quick View Tag on Hover */}
            <AnimatePresence>
              {isHovered && inStock && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4"
                >
                  <span className="text-white text-sm font-medium">Quick View →</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="text-gray-800 font-medium mb-2 line-clamp-2 hover:text-orange-500 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        className="cursor-default"
                      >
                        <FaStar
                          className={`text-sm ${
                            starValue <= Math.floor(rating)
                              ? 'text-yellow-400'
                              : starValue <= Math.ceil(rating) && rating % 1 >= 0.5
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.div>
                    );
                  })}
                </div>
                <span className="text-sm text-gray-500">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-gray-800">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && discountPercentage > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              {inStock ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {product.stock < 5 ? `Only ${product.stock} left` : 'In Stock'}
                </span>
              ) : (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Category Tag */}
            {product.category && (
              <div className="mb-3">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                >
                  {product.category}
                </motion.span>
              </div>
            )}

            {/* Express Interest Button */}
            <motion.button
              whileHover={inStock ? { scale: 1.02 } : {}}
              whileTap={inStock ? { scale: 0.98 } : {}}
              onClick={handleExpressInterest}
              className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                inStock
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!inStock}
            >
              <FaShoppingBag className={inStock ? 'animate-bounce' : ''} />
              {inStock ? 'Express Interest' : 'Out of Stock'}
            </motion.button>
          </div>
        </Link>
      </motion.div>

      {/* Order Modal */}
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

export default ProductCard;