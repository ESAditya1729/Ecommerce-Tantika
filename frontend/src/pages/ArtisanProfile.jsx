import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTwitter,
  FaGlobe,
  FaLink,
  FaPhone,
  FaEnvelope,
  FaShoppingBag,
  FaAward,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaImage,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ArtisanProfile/ProductCard";
import ArtisanStats from "../components/ArtisanProfile/ArtisanStats";
import ProductGrid from "../components/ArtisanProfile/ProductGrid";
import { LoadingSpinner } from "../components/LoadingSpinner";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white`}
    >
      {type === "success" ? <FaCheck /> : <FaExclamationCircle />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:text-gray-200">
        <FaTimes />
      </button>
    </motion.div>
  );
};

// Error Message Component
const ErrorMessage = ({ message }) => (
  <motion.div
    {...fadeInUp}
    className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto"
  >
    <div className="flex items-center gap-3">
      <FaExclamationCircle className="text-red-500 text-2xl" />
      <p className="text-red-700 text-lg">{message}</p>
    </div>
  </motion.div>
);

// Image with fallback component
const ImageWithFallback = ({ src, alt, className, fallback }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  if (error || !imgSrc) {
    return fallback;
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        setError(true);
        setImgSrc(null);
      }}
      loading="lazy"
    />
  );
};

// Filter and Sort Bar Component
const FilterSortBar = ({
  onSort,
  onCategoryChange,
  categories,
  selectedCategory,
  selectedSort,
  productCount,
  totalProductCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Top Rated" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
            >
              <FaFilter className="text-gray-500" />
              <span>{selectedCategory || "All Categories"}</span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onCategoryChange("");
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors ${
                        !selectedCategory
                          ? "text-orange-500 bg-orange-50"
                          : "text-gray-700"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          onCategoryChange(category);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors ${
                          selectedCategory === category
                            ? "text-orange-500 bg-orange-50"
                            : "text-gray-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSort(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500">
          Showing {productCount} of {totalProductCount} products
        </div>
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;

    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;

    return currentPage - 2 + i;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 mt-8"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="p-2 rounded-lg border border-gray-300 hover:bg-orange-50 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <FaChevronLeft className="text-gray-600" />
      </motion.button>

      {pages.map((page) => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`w-10 h-10 rounded-lg font-medium transition-all ${
            currentPage === page
              ? "bg-orange-500 text-white shadow-md"
              : "border border-gray-300 hover:bg-orange-50 hover:border-orange-500"
          }`}
        >
          {page}
        </motion.button>
      ))}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="p-2 rounded-lg border border-gray-300 hover:bg-orange-50 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <FaChevronRight className="text-gray-600" />
      </motion.button>
    </motion.div>
  );
};

const ArtisanProfile = () => {
  const { artisanId, userId, slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Show toast function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  // Extract categories from stats
  useEffect(() => {
    if (stats?.categoryBreakdown) {
      const cats = stats.categoryBreakdown.map((item) => item.category);
      setCategories(cats);
    }
  }, [stats]);

  useEffect(() => {
    if (!artisanId && !userId && !slug) {
      console.log("No identifier provided in URL params");
      setError("No artisan identifier provided");
      setLoading(false);
      return;
    }

    fetchArtisanProfile();
  }, [artisanId, userId, slug]);

  // Fetch products when page, category, or sort changes
  useEffect(() => {
    if (profileData) {
      const artisanIdentifier =
        artisanId || profileData?.artisan?.id || profileData?.id;
      if (artisanIdentifier) {
        fetchArtisanProducts(
          artisanIdentifier,
          currentPage,
          selectedCategory,
          selectedSort,
        );
      }
    }
  }, [profileData, currentPage, selectedCategory, selectedSort]);

  // Fetch stats after profile is loaded
  useEffect(() => {
    if (profileData) {
      const artisanIdentifier =
        artisanId || profileData?.artisan?.id || profileData?.id;
      if (artisanIdentifier) {
        fetchArtisanStats(artisanIdentifier);
      }
    }
  }, [profileData]);

  const fetchArtisanProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/artisan-profiles`;

      if (artisanId) {
        url += `/artisan/${artisanId}`;
      } else if (userId) {
        url += `/user/${userId}`;
      } else if (slug) {
        url += `/slug/${slug}`;
      }

      // Add pagination params to get first page of products
      url += `?page=1&limit=12&sort=${selectedSort}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const token = localStorage.getItem("tantika_token");

      const response = await axios.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.data.success && response.data.data) {
        setProfileData(response.data.data);
        setProducts(response.data.data.products || []);
        setTotalProducts(response.data.data.stats?.totalProducts || 0);
        setTotalPages(response.data.data.pagination?.pages || 1);
        setCurrentPage(response.data.data.pagination?.page || 1);
      } else if (response.data) {
        setProfileData(response.data);
        setProducts(response.data.products || []);
        setTotalProducts(response.data.stats?.totalProducts || 0);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtisanProducts = async (
    artisanIdentifier,
    page,
    category,
    sort,
  ) => {
    try {
      setLoadingMore(true);

      let url = `${API_BASE_URL}/artisan-profiles/artisan/${artisanIdentifier}/products`;
      url += `?page=${page}&limit=12&sort=${sort}`;
      if (category) {
        url += `&category=${category}`;
      }

      const token = localStorage.getItem("tantika_token");

      const response = await axios.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.data.success && response.data.data) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalProducts(response.data.pagination?.total || 0);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data.products) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchArtisanStats = async (artisanIdentifier) => {
    try {
      const url = `${API_BASE_URL}/artisan-profiles/artisan/${artisanIdentifier}/stats`;
      const token = localStorage.getItem("tantika_token");

      const response = await axios.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleError = (err) => {
    if (err.response) {
      setError(
        err.response.data?.message || `Server error: ${err.response.status}`,
      );
    } else if (err.request) {
      setError("No response from server. Please check if backend is running.");
    } else {
      setError(err.message || "Error loading artisan profile");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  const renderRatingStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  // Function to copy profile link
  const copyProfileLink = () => {
    const profileUrl = window.location.href;
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        showToast("Profile link copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        showToast("Failed to copy link", "error");
      });
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading artisan profile..." />;
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error || "Artisan not found"} />
      </div>
    );
  }

  const artisan = profileData.artisan || profileData;
  const productsList = products;
  const statsData = stats || profileData.stats || {};

  const safeArtisan = {
    id: artisan.id || artisan._id,
    displayName: artisan.displayName || artisan.businessName || "Artisan",
    displayInitials: (() => {
      // Try to get initials from fullName first
      if (artisan.fullName) {
        const nameParts = artisan.fullName.trim().split(" ");
        if (nameParts.length >= 2) {
          // Get first letter of first name and first letter of last name
          const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
          const lastNameInitial = nameParts[nameParts.length - 1]
            .charAt(0)
            .toUpperCase();
          return firstNameInitial + lastNameInitial;
        } else if (nameParts.length === 1) {
          // Single name - just return first letter
          return nameParts[0].charAt(0).toUpperCase();
        }
      }

      // Fallback to businessName if fullName not available
      if (artisan.businessName) {
        return artisan.businessName.charAt(0).toUpperCase();
      }

      // Ultimate fallback
      return "A";
    })(),
    profilePicture: artisan.profilePicture,
    isVerified: artisan.isVerified || false,
    businessName: artisan.businessName,
    rating: artisan.rating || 0,
    location: artisan.location || {},
    joinedAt: artisan.joinedAt || artisan.createdAt,
    website: artisan.website,
    portfolioLink: artisan.portfolioLink,
    socialLinks: artisan.socialLinks || {},
    description: artisan.description || artisan.bio,
    specialization: artisan.specialization || artisan.specialties || [],
    email: artisan.email,
    phone: artisan.phone,
    fullName: artisan.fullName || artisan.name || "Artisan",
    yearsOfExperience: artisan.yearsOfExperience || 0,
  };

  const safeStats = {
    totalProducts: statsData.totalProducts || totalProducts || 0,
    totalSales: statsData.totalSales || 0,
    totalViews: statsData?.overview?.totalViews || 0,
    yearsOfExperience:
      statsData.yearsOfExperience || safeArtisan.yearsOfExperience,
    reviewCount: statsData.reviewCount || 10,
    averageRating: statsData.averageRating || safeArtisan.rating,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>

      {/* Artisan Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Artisan DP with animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              {safeArtisan.profilePicture ? (
                <ImageWithFallback
                  src={safeArtisan.profilePicture}
                  alt={safeArtisan.displayName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  fallback={
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-4xl md:text-5xl font-bold text-white">
                        {safeArtisan.displayInitials}
                      </span>
                    </div>
                  }
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {safeArtisan.displayInitials}
                  </span>
                </div>
              )}
              {safeArtisan.isVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white"
                >
                  <FaCheckCircle className="text-white text-xl" />
                </motion.div>
              )}
            </motion.div>

            {/* Artisan Info with staggered animation */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex-1 text-center md:text-left"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
              >
                {safeArtisan.displayName}
              </motion.h1>

              {safeArtisan.businessName &&
                safeArtisan.businessName !== safeArtisan.displayName && (
                  <motion.p
                    variants={fadeInUp}
                    className="text-xl text-gray-600 mb-2"
                  >
                    {safeArtisan.businessName}
                  </motion.p>
                )}

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderRatingStars(safeArtisan.rating)}
                  </div>
                  <span className="text-gray-600">
                    ({safeStats.reviewCount} reviews)
                  </span>
                </div>

                {safeArtisan.location?.city && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span>
                      {safeArtisan.location.city}
                      {safeArtisan.location.state &&
                        `, ${safeArtisan.location.state}`}
                    </span>
                  </div>
                )}

                {safeArtisan.joinedAt && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>
                      Member since{" "}
                      {new Date(safeArtisan.joinedAt).getFullYear()}
                    </span>
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center md:justify-start gap-6 mb-4"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {safeStats.totalProducts}
                  </div>
                  <div className="text-sm text-gray-500">Products</div>
                </div>
                {/* <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{safeStats.totalSales}</div>
                  <div className="text-sm text-gray-500">Sales</div>
                </div> */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {safeStats.yearsOfExperience}+
                  </div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center md:justify-start gap-3"
              >
                {safeArtisan.website && (
                  <motion.a
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    href={safeArtisan.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FaGlobe className="text-gray-600 text-xl" />
                  </motion.a>
                )}
                {safeArtisan.portfolioLink && (
                  <motion.a
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    href={safeArtisan.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FaLink className="text-gray-600 text-xl" />
                  </motion.a>
                )}
                {safeArtisan.socialLinks?.instagram && (
                  <motion.a
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    href={safeArtisan.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FaInstagram className="text-pink-600 text-xl" />
                  </motion.a>
                )}
                {safeArtisan.socialLinks?.facebook && (
                  <motion.a
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    href={safeArtisan.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FaFacebook className="text-blue-600 text-xl" />
                  </motion.a>
                )}
                {safeArtisan.socialLinks?.youtube && (
                  <motion.a
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    href={safeArtisan.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FaYoutube className="text-red-600 text-xl" />
                  </motion.a>
                )}
                {safeArtisan.socialLinks?.twitter && (
                  <motion.a
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    href={safeArtisan.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FaTwitter className="text-blue-400 text-xl" />
                  </motion.a>
                )}
              </motion.div>
            </motion.div>

            {/* Share Profile Button with animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:self-center"
            >
              <button
                onClick={copyProfileLink}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FaLink className="text-lg" />
                Share Profile
              </button>
            </motion.div>
          </div>

          {/* Artisan Description with animation */}
          {safeArtisan.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-gray-700 leading-relaxed">
                {safeArtisan.description}
              </p>
            </motion.div>
          )}

          {/* Specializations with animation */}
          {safeArtisan.specialization.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {safeArtisan.specialization.map((spec, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {spec}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Tabs Navigation with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 py-6"
      >
        <div className="flex border-b border-gray-200">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className={`px-6 py-3 font-medium text-lg transition relative ${
              activeTab === "products"
                ? "text-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("products")}
          >
            <FaShoppingBag className="inline mr-2" />
            Products ({safeStats.totalProducts})
            {activeTab === "products" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className={`px-6 py-3 font-medium text-lg transition relative ${
              activeTab === "about"
                ? "text-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("about")}
          >
            <FaAward className="inline mr-2" />
            About Artisan
            {activeTab === "about" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filter and Sort Bar */}
              {categories.length > 0 && (
                <FilterSortBar
                  onSort={handleSortChange}
                  onCategoryChange={handleCategoryChange}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  selectedSort={selectedSort}
                  productCount={productsList.length}
                  totalProductCount={totalProducts}
                />
              )}

              {/* Products Grid - Using the new ProductGrid component */}
              <ProductGrid
                products={productsList}
                loading={loadingMore}
                emptyMessage="No products available in this category."
                gridCols={{
                  default: 1,
                  sm: 2,
                  lg: 3,
                  xl: 4,
                }}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={loadingMore}
                />
              )}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* About Content */}
              <div className="lg:col-span-2">
                <ArtisanStats stats={safeStats} artisan={safeArtisan} />

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm p-6 mt-6"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {safeArtisan.email && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <FaEnvelope className="text-gray-400" />
                        <a
                          href={`mailto:${safeArtisan.email}`}
                          className="hover:text-orange-500 transition"
                        >
                          {safeArtisan.email}
                        </a>
                      </motion.div>
                    )}
                    {/* {safeArtisan.phone && (
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <FaPhone className="text-gray-400" />
                        <span>{safeArtisan.phone}</span>
                      </motion.div>
                    )} */}
                  </div>
                </motion.div>

                {/* Social Links Section */}
                {Object.values(safeArtisan.socialLinks).some(link => link) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow-sm p-6 mt-6"
                  >
                    <h3 className="text-xl font-semibold mb-4">
                      Connect on Social Media
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {safeArtisan.socialLinks?.instagram && (
                        <motion.a
                          whileHover={{ scale: 1.05, y: -2 }}
                          href={safeArtisan.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <FaInstagram className="text-xl" />
                          <span className="font-medium">Instagram</span>
                        </motion.a>
                      )}
                      
                      {safeArtisan.socialLinks?.facebook && (
                        <motion.a
                          whileHover={{ scale: 1.05, y: -2 }}
                          href={safeArtisan.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <FaFacebook className="text-xl" />
                          <span className="font-medium">Facebook</span>
                        </motion.a>
                      )}
                      
                      {safeArtisan.socialLinks?.youtube && (
                        <motion.a
                          whileHover={{ scale: 1.05, y: -2 }}
                          href={safeArtisan.socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-red-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <FaYoutube className="text-xl" />
                          <span className="font-medium">YouTube</span>
                        </motion.a>
                      )}
                      
                      {safeArtisan.socialLinks?.twitter && (
                        <motion.a
                          whileHover={{ scale: 1.05, y: -2 }}
                          href={safeArtisan.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-blue-400 text-white rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <FaTwitter className="text-xl" />
                          <span className="font-medium">Twitter</span>
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-6 sticky top-24"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    Artisan Details
                  </h3>
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="border-b border-gray-100 pb-2"
                    >
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{safeArtisan.fullName}</p>
                    </motion.div>
                    {safeArtisan.yearsOfExperience > 0 && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="border-b border-gray-100 pb-2"
                      >
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">
                          {safeArtisan.yearsOfExperience} years
                        </p>
                      </motion.div>
                    )}
                    {safeArtisan.location?.city && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="border-b border-gray-100 pb-2"
                      >
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">
                          {safeArtisan.location.city}
                          {safeArtisan.location.state &&
                            `, ${safeArtisan.location.state}`}
                          {safeArtisan.location.country &&
                            `, ${safeArtisan.location.country}`}
                        </p>
                      </motion.div>
                    )}
                    {safeArtisan.joinedAt && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="border-b border-gray-100 pb-2"
                      >
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">
                          {new Date(safeArtisan.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ArtisanProfile;