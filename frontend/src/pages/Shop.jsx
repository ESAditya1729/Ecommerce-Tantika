import { useState, useEffect, useCallback } from "react";
import ShopHero from "../components/Shop/ShopHero";
import ProductFilters from "../components/Shop/ProductFilters";
import ProductGrid from "../components/Shop/ProductGrid";
import Pagination from "../components/Shop/Pagination";
import AdvancedSearch from "../components/Shop/AdvancedSearch";
import {
  Loader2,
  AlertCircle,
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  Search,
  X,
  Sparkles,
  Heart,
  Star,
  Zap,
  Package,
  ShieldCheck,
  Truck,
  ChevronDown,
  Check,
  DollarSign,
  Package2,
  BarChart3,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("product");
  const [viewMode, setViewMode] = useState("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [userRole, setUserRole] = useState("user");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const PRODUCTS_PER_PAGE = 12;

  // Sample tags for filtering
  const productTags = [
    "Handmade",
    "Eco-Friendly",
    "Limited Edition",
    "Best Seller",
    "New Arrival",
    "Local Artisan",
    "Premium",
    "Giftable",
    "Jewelry",
    "Home Decor",
    "Accessories",
  ];

  // Sort options with icons
  const sortOptions = [
    { value: "featured", label: "Featured", icon: Sparkles },
    { value: "newest", label: "Newest", icon: Zap },
    { value: "price-low", label: "Price: Low to High", icon: TrendingUp },
    { value: "price-high", label: "Price: High to Low", icon: TrendingUp },
    { value: "popular", label: "Most Popular", icon: Heart },
    { value: "rating", label: "Highest Rated", icon: Star },
  ];

  // Trust badges
  const trustBadges = [
    { icon: ShieldCheck, text: "Secure Payment" },
    { icon: Package, text: "Quality Checked" },
    { icon: Truck, text: "Free Shipping" },
    { icon: Sparkles, text: "Handcrafted" },
  ];

  // Get user role from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("tantika_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || "user");
      } catch (err) {
        console.error("Error parsing user data:", err);
        setUserRole("user");
      }
    }
  }, []);

  // Check if user is admin/superadmin
  const isAdminUser = userRole === "admin" || userRole === "superadmin";

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
        params.append("searchType", searchType);
        console.log("🔍 Sending search:", {
          search: searchQuery.trim(),
          searchType: searchType,
        });
      }

      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }

      if (priceRange.min > 0) {
        params.append("minPrice", priceRange.min.toString());
      }
      if (priceRange.max < 5000) {
        params.append("maxPrice", priceRange.max.toString());
      }

      // Add tags to query
      if (selectedTags.length > 0) {
        params.append("tags", selectedTags.join(","));
      }

      // Sorting logic - Map frontend sort options to backend fields
      const sortMap = {
        featured: { sort: "createdAt", order: "desc" },
        "price-low": { sort: "price", order: "asc" },
        "price-high": { sort: "price", order: "desc" },
        newest: { sort: "createdAt", order: "desc" },
        popular: { sort: "sales", order: "desc" }, // Using 'sales' as shown in response
        rating: { sort: "rating", order: "desc" },
      };

      const sortConfig = sortMap[sortBy] || sortMap.featured;
      params.append("sort", sortConfig.sort);
      params.append("order", sortConfig.order);

      // Fetch products
      const url = `${API_URL}/products?${params.toString()}`;
      console.log("📡 API Call URL:", url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to load products (${res.status})`);
      }

      const data = await res.json();

      console.log("📊 API Response:", {
        success: data.success,
        count: data.count,
        total: data.total,
        productsFound: data.data?.length,
        dataStructure: Object.keys(data),
      });

      if (data.success) {
        // FIXED: Using data.data instead of data.products
        setProducts(data.data || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
        // Only set stats if user is admin
        if (isAdminUser) {
          setStats(data.stats || null);
        }

        // Reset to page 1 if no products found on current page
        if (data.data?.length === 0 && currentPage > 1 && data.total > 0) {
          console.log("No data on current page, redirecting to page 1...");
          setCurrentPage(1);
        }
      } else {
        throw new Error(data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [
    API_URL,
    currentPage,
    selectedCategory,
    sortBy,
    priceRange,
    searchQuery,
    searchType,
    selectedTags,
    isAdminUser,
  ]);

  // Handle express interest
  const handleExpressInterest = useCallback((product) => {
    console.log("Express interest for:", product);
  }, []);

  // Handle share
  const handleShare = useCallback((product) => {
    console.log("Share product:", product);
  }, []);

  // Handle advanced search change
  const handleAdvancedSearch = useCallback((query, type = "product") => {
    setSearchQuery(query);
    setSearchType(type);
    setCurrentPage(1);
  }, []);

  // Handle search type change
  const handleSearchTypeChange = useCallback(
    (type) => {
      setSearchType(type);
      if (searchQuery.trim()) {
        setCurrentPage(1);
      }
    },
    [searchQuery],
  );

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setSearchType("product");
    setCurrentPage(1);
  }, []);

  // Handle tag toggle
  const handleTagToggle = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
    setCurrentPage(1);
  }, []);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSortBy("featured");
    setPriceRange({ min: 0, max: 5000 });
    setSearchQuery("");
    setSearchType("product");
    setSelectedTags([]);
    setCurrentPage(1);
    setIsFiltersOpen(false);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Initial load and when dependencies change
  useEffect(() => {
    if (isInitialLoad) {
      fetchData();
    } else {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    fetchData,
    isInitialLoad,
    currentPage,
    selectedCategory,
    sortBy,
    priceRange.min,
    priceRange.max,
    searchQuery,
    searchType,
    selectedTags,
  ]);

  // Fetch categories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch(`${API_URL}/products/categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success) {
            const categoryNames = catData.data.map((cat) => cat.name);
            setCategories(["All", ...categoryNames]);
          }
        }
      } catch (catErr) {
        console.warn("Failed to fetch categories", catErr);
      }
    };

    if (categories.length <= 1) {
      fetchCategories();
    }
  }, [API_URL, categories.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50"
    >
      <ShopHero />

      {/* Trust Badges Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 py-4">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-gray-700 group"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <badge.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {badge.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* AdvancedSearch Component */}
        <div className="mb-8">
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={handleAdvancedSearch}
            searchType={searchType}
            onSearchTypeChange={handleSearchTypeChange}
            onClear={handleSearchClear}
          />
        </div>

        {/* Stats Display - ONLY FOR ADMINS */}
        {isAdminUser && stats && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">
                Shop Analytics
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Admin View
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">
                    Avg. Price
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  ₹{Math.round(stats.avgPrice || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Package2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">
                    Total Stock
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {stats.totalStock || 0}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-purple-600 font-medium">
                    Price Range
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  ₹{stats.minPrice || 0} - ₹{stats.maxPrice || 0}
                </p>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-600 font-medium">
                    Total Value
                  </p>
                </div>
                <p className="text-2xl font-bold text-amber-800">
                  ₹{stats.totalValue || 0}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              These statistics are only visible to administrators
            </p>
          </motion.div>
        )}

        {/* Tags Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Tag className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              Filter by Tags:
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {productTags.map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedTags.includes(tag)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {selectedTags.includes(tag) && <Check className="w-3 h-3" />}
                {tag}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border border-red-200 rounded-2xl shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-bold text-lg">
                    Oops! Something went wrong
                  </p>
                  <p className="text-red-600 mt-1">{error}</p>
                  <div className="flex gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchData}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetFilters}
                      className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                    >
                      Reset Filters
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filters Overlay */}
          <AnimatePresence>
            {isFiltersOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setIsFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl lg:hidden overflow-y-auto"
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        Filters
                      </h3>
                      <motion.button
                        whileHover={{ rotate: 90 }}
                        onClick={() => setIsFiltersOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-xl"
                      >
                        <X className="w-6 h-6" />
                      </motion.button>
                    </div>
                    <div className="flex-1">
                      <ProductFilters
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        isMobileFiltersOpen={isFiltersOpen}
                        onMobileFiltersToggle={() =>
                          setIsFiltersOpen(!isFiltersOpen)
                        }
                      />
                    </div>
                    <div className="mt-6 space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResetFilters}
                        className="w-full py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-shadow font-medium"
                      >
                        Reset All Filters
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsFiltersOpen(false)}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                      >
                        Apply Filters
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleResetFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </motion.button>
                </div>
                <ProductFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  isMobileFiltersOpen={isFiltersOpen}
                  onMobileFiltersToggle={() => setIsFiltersOpen(!isFiltersOpen)}
                />
              </div>

              {/* Additional Features */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Why Choose Handcrafted?
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Unique, one-of-a-kind pieces
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    Made with love and care
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Directly supporting artisans
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Sustainable & eco-friendly
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {searchQuery.trim() ? (
                      <>
                        Results for "
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {searchQuery}
                        </span>
                        "
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (by{" "}
                          {searchType === "product"
                            ? "Product"
                            : searchType === "artisan"
                              ? "Artisan"
                              : "Description"}
                          )
                        </span>
                      </>
                    ) : selectedCategory === "All" ? (
                      "Discover Handcrafted Treasures"
                    ) : (
                      selectedCategory
                    )}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {searchQuery.trim()
                          ? "Searching..."
                          : "Loading beautiful creations..."}
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-blue-600">
                          {products.length}
                        </span>{" "}
                        amazing items
                        {selectedCategory !== "All" &&
                          ` in ${selectedCategory}`}
                        {searchQuery.trim() && ` matching "${searchQuery}"`}
                        {totalPages > 1 && (
                          <span className="ml-4 text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-md" : "hover:bg-gray-200"}`}
                      title="Grid view"
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-md" : "hover:bg-gray-200"}`}
                      title="List view"
                    >
                      <List className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <span className="font-medium text-gray-700">
                        {sortOptions.find((opt) => opt.value === sortBy)
                          ?.label || "Sort"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {sortDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
                        >
                          {sortOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <motion.button
                                key={option.value}
                                whileHover={{
                                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                                }}
                                onClick={() => {
                                  setSortBy(option.value);
                                  setSortDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  sortBy === option.value
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="font-medium">
                                  {option.label}
                                </span>
                                {sortBy === option.value && (
                                  <Check className="w-4 h-4 ml-auto text-blue-600" />
                                )}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile Filters Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6"
                >
                  <Loader2 className="w-12 h-12 text-blue-600" />
                </motion.div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  Discovering Beautiful Handcrafts
                </p>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're gathering the finest handmade products from talented
                  artisans around the world
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-150" />
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-300" />
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${viewMode}-${currentPage}-${searchQuery}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductGrid
                      products={products}
                      viewMode={viewMode}
                      isLoading={isLoading}
                      onExpressInterest={handleExpressInterest}
                      onShare={handleShare}
                    />
                  </motion.div>
                </AnimatePresence>

                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12"
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Search className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    {searchQuery.trim()
                      ? "No matching creations found"
                      : "No products available"}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {searchQuery.trim()
                      ? `We couldn't find any "${searchQuery}" products`
                      : "Try adjusting your filters or check back later for new arrivals"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetFilters}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-shadow font-medium"
                    >
                      Reset All Filters
                    </motion.button>
                    {searchQuery.trim() && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearchClear}
                        className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all font-medium"
                      >
                        Clear Search
                      </motion.button>
                    )}
                  </div>
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-gray-500 mb-4">
                      Need help finding something?
                    </p>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Contact our artisan support team →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA - Only show for regular users, not for admins */}
      {!isAdminUser && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-2xl mx-auto">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Join Our Community of Artisans
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Are you an artisan creating beautiful handmade products? Join
                our platform and showcase your work to thousands of appreciative
                customers.
              </p>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-shadow font-medium"
                >
                  Become an Artisan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:shadow-lg hover:border-blue-400 transition-all font-medium"
                >
                  Learn More
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Products;
