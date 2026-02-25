// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Package,
  Truck,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  MapPin,
  Calendar,
  User,
  Award,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import OrderModal from "../components/Modals/OrderModal";
import { motion } from "framer-motion";
import BannerAd from "../components/AdScript";

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

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://ecommerce-tantika.onrender.com/api";

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching product from: ${API_URL}/products/${id}`);

      const response = await fetch(`${API_URL}/products/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Product not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const productData = data.data;

        if (!productData) {
          throw new Error("Product data not found in response");
        }

        console.log("Product data received:", productData);
        console.log("Artisan data:", productData.artisan);
        console.log("Business Name:", productData.artisan?.businessName);

        setProduct(productData);
        checkWishlistStatus(productData._id);
      } else {
        throw new Error(data.message || "Failed to load product");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async (productId) => {
    try {
      const token = localStorage.getItem("tantika_token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/usernorms/wishlist/check/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.data?.isInWishlist || false);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
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
      alert("Product link copied to clipboard!");
    }
  };

  const handleWishlist = async () => {
    const token = localStorage.getItem("tantika_token");
    if (!token) {
      navigate("/login", {
        state: {
          from: "product-details",
          productId: product._id,
          productName: product.name,
        },
      });
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        const response = await fetch(
          `${API_URL}/usernorms/wishlist/${product._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          setIsWishlisted(false);
        }
      } else {
        const wishlistData = {
          productId: product._id,
          productName: product.name,
          productImage: product.image || "",
          productPrice: product.price,
          artisan: getArtisanName(),
          category: product.category || "",
        };

        const response = await fetch(`${API_URL}/usernorms/wishlist`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wishlistData),
        });

        if (response.ok) {
          setIsWishlisted(true);
        } else if (response.status === 400) {
          const data = await response.json();
          if (data.message === "Product already in wishlist") {
            setIsWishlisted(true);
          }
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        text: "Out of Stock",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };
    if (stock < 5)
      return {
        text: "Low Stock",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
      };
    return {
      text: "In Stock",
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle,
    };
  };

  const getApprovalStatus = (status) => {
    switch (status) {
      case "approved":
        return {
          text: "Approved",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle,
        };
      case "pending":
        return {
          text: "Pending Approval",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertTriangle,
        };
      case "rejected":
        return {
          text: "Rejected",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          text: status || "Unknown",
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  // SIMPLIFIED: Get artisan name - directly use businessName
  const getArtisanName = () => {
    if (!product?.artisan) {
      return "Tantika Exclusive";
    }

    // Directly return businessName since that's what you want to display
    // From your API: "businessName": "Raina's Artistry"
    if (product.artisan.businessName) {
      return product.artisan.businessName;
    }

    // Fallback to fullName if businessName doesn't exist
    if (product.artisan.fullName) {
      return product.artisan.fullName;
    }

    return "Tantika Exclusive";
  };

  // Get location from address
  const getArtisanLocation = () => {
    if (!product?.artisan?.address) return "India";

    const addr = product.artisan.address;
    if (addr.city && addr.state) {
      return `${addr.city}, ${addr.state}`;
    } else if (addr.city) {
      return addr.city;
    } else if (addr.state) {
      return addr.state;
    }
    return "India";
  };

  // Get specialization
  const getArtisanSpecialization = () => {
    if (product?.artisan?.specialization?.length > 0) {
      return product.artisan.specialization.join(", ");
    }
    return null;
  };

  // Get product images
  const getProductImages = () => {
    const images = [];
    if (product?.image) {
      images.push(product.image);
    }
    if (product?.images?.length > 0) {
      images.push(...product.images);
    }
    if (product?.galleryImages?.length > 0) {
      images.push(...product.galleryImages);
    }
    return images.length > 0 ? images : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error ? "Error Loading Product" : "Product Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/shop")}
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
  const StockIcon = stockStatus.icon;
  const approvalStatus = getApprovalStatus(product.approvalStatus);
  const ApprovalIcon = approvalStatus.icon;
  const images = getProductImages();

  // Get artisan information
  const artisanName = getArtisanName();
  console.log("Artisan name being displayed:", artisanName); // Should log: "Raina's Artistry"

  const artisanLocation = getArtisanLocation();
  const artisanSpecialization = getArtisanSpecialization();

  // Prepare product data for OrderModal
  const productForModal = {
    _id: product._id,
    name: product.name,
    price: product.price,
    images: images,
    image: product.image || images[0] || "",
    artisanId: product.artisan?._id,
    artisan: {
      _id: product.artisan?._id,
      businessName: artisanName,
      name: artisanName,
      phone: product.artisan?.phone,
      email: product.artisan?.email,
      address: product.artisan?.address,
    },
    artisanName: artisanName,
    location: artisanLocation,
    origin: artisanLocation,
    category: product.category,
    description: product.description,
    stock: product.stock,
    sku: product.sku,
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
                    src={images[currentImageIndex] || images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/600x600/f3f4f6/9ca3af?text=Image+Not+Available";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-gray-400" />
                  </div>
                )}

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % images.length,
                        )
                      }
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
                          ? "border-blue-500 shadow-md scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Image";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Category and Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  {product.category || "Uncategorized"}
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${stockStatus.color}`}
                >
                  <StockIcon className="w-4 h-4" />
                  {stockStatus.text}
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${approvalStatus.color}`}
                >
                  <ApprovalIcon className="w-4 h-4" />
                  {approvalStatus.text}
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
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">
                  {product.rating?.toFixed(1) || "0.0"}
                </span>
                {product.reviewCount > 0 && (
                  <span className="text-gray-500 text-sm">
                    ({product.reviewCount} review
                    {product.reviewCount !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500">
                  Inclusive of taxes • Free shipping over ₹999
                </div>
              </div>

              {/* Artisan Info - FIXED SECTION */}
              {product.artisan && (
                <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                          Handcrafted by
                        </span>
                      </div>

                      {/* This will now show "Raina's Artistry" */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {product.artisan.businessName ||
                          product.artisan.fullName ||
                          "Tantika Exclusive"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          {"India"}
                        </span>

                        {product.artisan.yearsOfExperience > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-amber-500" />
                            {product.artisan.yearsOfExperience} years
                          </span>
                        )}

                        {/* <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-amber-500" />
                          Rating: {product.artisan.rating?.toFixed(1) || "4.5"}
                        </span> */}
                      </div>

                      {product.artisan.specialization?.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {product.artisan.specialization.map(
                              (spec, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full"
                                >
                                  {spec}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <BannerAd
                  key="708f1310e8b739077a59073d869d1360"
                  height={90}
                  width={728}
                  className="rounded-lg shadow-md"
                />
              </div>
              <br />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Description
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description ||
                    "No description available for this product."}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Free Shipping
                    </div>
                    <div className="text-xs text-gray-600">Across India</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Secure Payment
                    </div>
                    <div className="text-xs text-gray-600">100% protected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Easy Returns
                    </div>
                    <div className="text-xs text-gray-600">7-day policy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Check className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Quality Checked
                    </div>
                    <div className="text-xs text-gray-600">Handcrafted</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={handleExpressInterest}
                  disabled={
                    product.stock === 0 || product.approvalStatus !== "approved"
                  }
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    product.stock === 0 || product.approvalStatus !== "approved"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:shadow-blue-200/50 active:scale-[0.98]"
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                  {product.stock === 0
                    ? "Out of Stock"
                    : product.approvalStatus !== "approved"
                      ? "Not Available"
                      : "Express Interest"}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isWishlisted
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {wishlistLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                      />
                    )}
                    {wishlistLoading
                      ? "Processing..."
                      : isWishlisted
                        ? "Wishlisted"
                        : "Wishlist"}
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
                  <span>
                    Available:{" "}
                    <span className="font-medium">
                      {product.stock || 0} units
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Added {formatDate(product.createdAt)}
                  </span>
                </div>
                {product.sku && (
                  <div className="mt-2">
                    SKU: <span className="font-mono">{product.sku}</span>
                  </div>
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
