// ProductManagement.jsx (FIXED LOW STOCK FILTER)
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  AlertCircle,
  Package,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import AddProductModal from "../Modals/AddProductModal";
import EditProductModal from "../Modals/EditProductModal";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import ViewProductModal from "../Modals/ViewProductModal";
import ProductCard from "./Product-Management/ProductCard.jsx";
import ProductFilters from "./Product-Management/ProductFilters.jsx";
import SummaryCards from "./Product-Management/SummaryCards";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers using logged-in user's credentials
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("tantika_token") || sessionStorage.getItem("token");

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
  };
};

// Helper function to get current user from localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("tantika_user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error parsing user:", error);
  }
  return null;
};

const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState(["all"]);
  
  // Updated summary stats structure to match API
  const [summaryStats, setSummaryStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    avgRating: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    pendingApprovalProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    totalStock: 0,
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0
  });

  // NEW STATES for artisans and current user
  const [currentUser, setCurrentUser] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [loadingArtisans, setLoadingArtisans] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states - UPDATED to match API response
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    count: 0,
    total: 0
  });

  // Filter states - ADDED lowStock filter
  const [filters, setFilters] = useState({
    status: "all",
    approvalStatus: "all",
    minPrice: "",
    maxPrice: "",
    inStock: "all",
    lowStock: false, // NEW: Separate low stock filter
  });

  // ==================== UTILITY FUNCTIONS ====================

  // Clear all filters
  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setFilters({
      status: "all",
      approvalStatus: "all",
      minPrice: "",
      maxPrice: "",
      inStock: "all",
      lowStock: false,
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Export products to CSV
  const handleExportProducts = async () => {
    try {
      setActionLoading(true);

      // Build export URL with current filters
      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      
      // CRITICAL FIX: Only add admin-only filters for admin users
      if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
        if (filters.status && filters.status !== 'all') {
          params.append('status', filters.status);
        }
        
        if (filters.approvalStatus && filters.approvalStatus !== 'all') {
          params.append('approvalStatus', filters.approvalStatus);
        }
      } else {
        // For non-admin users, only show approved products
        params.append('approvalStatus', 'approved');
      }
      
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.inStock !== "all")
        params.append("inStock", filters.inStock === "true");
      if (filters.lowStock)
        params.append("maxStock", 5); // NEW: Add low stock filter
      params.append("format", "csv");

      console.log("Exporting products with params:", params.toString());

      const response = await axios.get(
        `${API_BASE_URL}/products/export?${params}`,
        {
          headers: getAuthHeaders(),
          responseType: "blob", // Important for file downloads
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `products_export_${timestamp}.csv`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(url);

      alert("Products exported successfully!");
    } catch (err) {
      console.error("Error exporting products:", err);

      // If export endpoint doesn't exist, fallback to client-side export
      if (err.response?.status === 404) {
        exportProductsClientSide();
      } else {
        alert(
          err.response?.data?.message ||
            "Failed to export products. Please try again.",
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Client-side export fallback
  const exportProductsClientSide = () => {
    try {
      // Prepare CSV data
      const headers = [
        "Name",
        "Category",
        "Price",
        "Stock",
        "Status",
        "Approval Status",
        "SKU",
        "Rating",
        "Sales",
      ];
      const csvData = products.map((product) => [
        `"${product.name || ""}"`,
        product.category || "",
        product.price || 0,
        product.stock || 0,
        product.status || "",
        product.approvalStatus || "",
        product.sku || "",
        product.rating || 0,
        product.sales || 0,
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
      ].join("\n");

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `products_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Products exported successfully using client-side export!");
    } catch (err) {
      console.error("Client-side export error:", err);
      alert("Failed to export products. Please check console for details.");
    }
  };

  // Quick status filter handlers - FIXED low stock logic
  const handleQuickFilter = (filterType) => {
    const newFilters = { ...filters };
    
    switch (filterType) {
      case "active":
        newFilters.status = "active";
        newFilters.approvalStatus = "approved";
        newFilters.lowStock = false; // Reset low stock
        break;
      case "pending":
        newFilters.status = "all"; // Reset status for pending approval
        newFilters.approvalStatus = "pending";
        newFilters.lowStock = false; // Reset low stock
        break;
      case "outOfStock":
        newFilters.inStock = "false";
        newFilters.lowStock = false; // Reset low stock
        break;
      case "lowStock":
        // CRITICAL FIX: Use lowStock boolean instead of status
        newFilters.lowStock = true;
        newFilters.status = "all"; // Reset status filter
        // For artisans, ensure they can see their own pending products
        if (currentUser?.role === 'artisan') {
          newFilters.approvalStatus = 'all';
        }
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // ==================== DATA FETCHING ====================

  // Fetch current user on component mount
  useEffect(() => {
    const user = getCurrentUser();
    console.log("Current user loaded:", user);
    setCurrentUser(user);
  }, []);

  // Fetch artisans when Add Modal is about to open (for admin users only)
  useEffect(() => {
    const fetchArtisansIfNeeded = async () => {
      if (
        showAddModal &&
        (currentUser?.role === "admin" || currentUser?.role === "superadmin")
      ) {
        console.log("Fetching artisans for admin user...");
        await fetchArtisans();
      }
    };

    fetchArtisansIfNeeded();
  }, [showAddModal, currentUser]);

  useEffect(() => {
    const fetchArtisansForEditIfNeeded = async () => {
      if (
        showEditModal &&
        (currentUser?.role === "admin" || currentUser?.role === "superadmin")
      ) {
        console.log("Fetching artisans for edit modal...");
        await fetchArtisans();
      }
    };

    fetchArtisansForEditIfNeeded();
  }, [showEditModal, currentUser]);
  // Fetch artisans function
// Fetch artisans function - UPDATED to handle nested structure
const fetchArtisans = async () => {
  try {
    setLoadingArtisans(true);
    console.log("Making API call to fetch artisans...");

    // Use the correct admin API endpoint
    const response = await axios.get(
      `${API_BASE_URL}/admin/artisans?status=approved`,
      { headers: getAuthHeaders() },
    );

    console.log("Artisans API response:", response.data);

    if (response.data.success) {
      // The artisans are nested under data.artisans
      let artisansData = [];
      
      if (response.data.data && response.data.data.artisans) {
        // Structure: { success: true, data: { artisans: [...] } }
        artisansData = response.data.data.artisans;
      } else if (response.data.artisans) {
        // Structure: { success: true, artisans: [...] }
        artisansData = response.data.artisans;
      } else if (Array.isArray(response.data.data)) {
        // Structure: { success: true, data: [...] }
        artisansData = response.data.data;
      }
      
      console.log("Extracted artisans data:", artisansData);
      console.log("Number of artisans found:", artisansData.length);

      // Filter for approved artisans if needed
      const approvedArtisans = artisansData.filter(artisan => 
        artisan && artisan.status === 'approved'
      );
      
      console.log("Approved artisans:", approvedArtisans);
      console.log("Approved artisans count:", approvedArtisans.length);
      
      setArtisans(approvedArtisans);
      
      // If no approved artisans, add the default one
      if (approvedArtisans.length === 0) {
        console.log("No approved artisans found, adding default");
        setArtisans([{
          _id: "6980ec0e019484c9645856c4",
          businessName: "Default Artisan",
          fullName: "Default Artisan",
          name: "Default Artisan",
          status: "approved"
        }]);
      }
    } else {
      console.error("API success false:", response.data);
      // Add default artisan if API fails
      setArtisans([{
        _id: "6980ec0e019484c9645856c4",
        businessName: "Default Artisan",
        fullName: "Default Artisan",
        name: "Default Artisan",
        status: "approved"
      }]);
    }
  } catch (err) {
    console.error("Error fetching artisans:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    
    // Add default artisan on error
    setArtisans([{
      _id: "6980ec0e019484c9645856c4",
      businessName: "Default Artisan",
      fullName: "Default Artisan",
      name: "Default Artisan",
      status: "approved"
    }]);
  } finally {
    setLoadingArtisans(false);
  }
};

  // Fetch products from API - FIXED LOW STOCK FILTER
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.itemsPerPage);
      
      // Add search filter
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Add category filter
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      // CRITICAL FIX: Role-based filtering logic
      const userRole = currentUser?.role;
      
      // Admin/SuperAdmin can see everything
      if (userRole === 'admin' || userRole === 'superadmin') {
        // Apply all filters as-is
        if (filters.status && filters.status !== 'all') {
          params.append('status', filters.status);
        }
        
        if (filters.approvalStatus && filters.approvalStatus !== 'all') {
          params.append('approvalStatus', filters.approvalStatus);
        }
      } 
      // Artisan can see their own products with any approval status
      else if (userRole === 'artisan') {
        // Artisans should see their own products regardless of approval status
        // Don't add approvalStatus filter unless specifically set
        if (filters.approvalStatus && filters.approvalStatus !== 'all') {
          params.append('approvalStatus', filters.approvalStatus);
        }
        // Always filter by artisanId for artisans
        if (currentUser?._id) {
          params.append('artisanId', currentUser._id);
        }
      } 
      // Regular users (non-logged in or customers) should only see approved products
      else {
        params.append('approvalStatus', 'approved');
        params.append('status', 'active'); // Only show active products for customers
      }
      
      // Apply status filter for all users (if set and not 'all')
      if (filters.status && filters.status !== 'all' && 
          (userRole === 'admin' || userRole === 'superadmin' || userRole === 'artisan')) {
        params.append('status', filters.status);
      }
      
      // Add price range filters
      if (filters.minPrice) {
        params.append('minPrice', parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        params.append('maxPrice', parseFloat(filters.maxPrice));
      }
      
      // Add stock filter
      if (filters.inStock !== 'all') {
        // Convert to boolean string that backend expects
        const inStockBool = filters.inStock === 'true';
        params.append('inStock', inStockBool.toString());
      }
      
      // CRITICAL FIX: Add low stock filter
      if (filters.lowStock) {
        // Filter for products with stock > 0 AND stock < 5
        params.append('minStock', 1); // At least 1 in stock
        params.append('maxStock', 5); // Less than 5 in stock
      }
      
      // Debug logging
      console.log('📡 SENDING REQUEST WITH PARAMS:', {
        url: `${API_BASE_URL}/products?${params.toString()}`,
        category: selectedCategory,
        status: filters.status,
        approvalStatus: filters.approvalStatus,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        lowStock: filters.lowStock,
        userRole: userRole,
        userId: currentUser?._id
      });
      
      const response = await axios.get(
        `${API_BASE_URL}/products?${params}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('✅ BACKEND RESPONSE:', {
        success: response.data.success,
        count: response.data.count,
        total: response.data.total,
        currentPage: response.data.currentPage,
        dataLength: response.data.data?.length || 0,
        filtersApplied: params.toString()
      });
      
      if (response.data.success) {
        const productsData = response.data.data || [];
        const apiStats = response.data.stats || {};
        
        console.log(`📦 Received ${productsData.length} products out of ${response.data.total} total`);
        
        // CLIENT-SIDE FILTER FALLBACK: If backend doesn't support lowStock filter
        let filteredProducts = productsData;
        if (filters.lowStock && filteredProducts.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            const stock = product.stock || 0;
            return stock > 0 && stock < 5;
          });
          console.log(`🔍 Client-side low stock filter: ${filteredProducts.length} products`);
        }
        
        // Update products state
        setProducts(Array.isArray(filteredProducts) ? filteredProducts : []);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.total || 0,
          count: filteredProducts.length,
          itemsPerPage: response.data.itemsPerPage || pagination.itemsPerPage
        }));
        
        // Calculate stats from current page data
        let totalSales = 0;
        let totalRating = 0;
        let activeProducts = 0;
        let outOfStockProducts = 0;
        let lowStockProducts = 0;
        let pendingApprovalProducts = 0;
        
        if (Array.isArray(filteredProducts) && filteredProducts.length > 0) {
          filteredProducts.forEach(product => {
            totalSales += product.sales || 0;
            totalRating += product.rating || 0;
            
            // Active products: approved AND active status
            if (product.approvalStatus === 'approved' && product.status === 'active') {
              activeProducts++;
            }
            
            // Out of stock: stock === 0
            if ((product.stock || 0) === 0) {
              outOfStockProducts++;
            }
            
            // Low stock: stock > 0 AND stock < 5
            const stock = product.stock || 0;
            if (stock > 0 && stock < 5) {
              lowStockProducts++;
            }
            
            // Pending approval
            if (product.approvalStatus === 'pending') {
              pendingApprovalProducts++;
            }
          });
        }
        
        const avgRating = filteredProducts.length > 0 ? totalRating / filteredProducts.length : 0;
        
        // Update summary stats
        const newSummaryStats = {
          totalProducts: response.data.total || 0,
          totalSales: totalSales,
          avgRating: parseFloat(avgRating.toFixed(1)),
          activeProducts: activeProducts,
          outOfStockProducts: outOfStockProducts,
          pendingApprovalProducts: pendingApprovalProducts,
          lowStockProducts: lowStockProducts,
          totalValue: apiStats.totalValue || 0,
          totalStock: apiStats.totalStock || 0,
          avgPrice: apiStats.avgPrice || 0,
          minPrice: apiStats.minPrice || 0,
          maxPrice: apiStats.maxPrice || 0
        };
        
        console.log('📊 Summary stats:', newSummaryStats);
        setSummaryStats(newSummaryStats);
        
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config?.url
      });
      
      let errorMessage = 'Failed to load products. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setProducts([]);
      setSummaryStats({
        totalProducts: 0,
        totalSales: 0,
        avgRating: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        pendingApprovalProducts: 0,
        lowStockProducts: 0,
        totalValue: 0,
        totalStock: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, selectedCategory, filters, currentUser]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        headers: getAuthHeaders(),
      });
      console.log("Categories API response:", response.data);

      if (response.data.success) {
        const categoriesData =
          response.data.data || response.data.categories || [];
        // Remove duplicates and ensure we have 'all' option
        const uniqueCategories = [...new Set(categoriesData.map((cat) =>
          typeof cat === "string" ? cat : cat.name || "Unknown"
        ))];
        setCategories(["all", ...uniqueCategories]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories(["all"]); // Set default on error
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, filters, pagination.currentPage, fetchProducts]);

  // ==================== FILTER & PAGINATION HANDLERS ====================

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

// ==================== PRODUCT CRUD OPERATIONS ====================

// Handle adding new product
const handleAddProduct = async (productDataFromModal) => {
  try {
    setActionLoading(true);

    // Validate required fields
    if (
      !productDataFromModal?.name ||
      !productDataFromModal?.category ||
      !productDataFromModal?.price
    ) {
      alert("Please fill in all required fields (*)");
      return;
    }

    // Prepare product data based on user role
    const productData = {
      name: productDataFromModal.name.trim(),
      description: productDataFromModal.description?.trim() || "",
      category: productDataFromModal.category,
      price: parseFloat(productDataFromModal.price),
      stock: parseInt(productDataFromModal.stock) || 0,
      image: productDataFromModal.image || "",
      images: productDataFromModal.images || [],
      // FIXED: Include rating field from modal
      rating: productDataFromModal.rating !== undefined 
        ? parseFloat(productDataFromModal.rating) 
        : 4.0, // Default rating if not provided
      status:
        productDataFromModal.status ||
        (currentUser?.role === "artisan" ? "draft" : "active"),
      artisan:
        productDataFromModal.artisan ||
        currentUser?.artisanId ||
        currentUser?._id,
      approvalStatus:
        productDataFromModal.approvalStatus ||
        (currentUser?.role === "artisan" ? "pending" : "approved"),
      specifications: productDataFromModal.specifications || [],
      variants: productDataFromModal.variants || [],
      tags: productDataFromModal.tags || [],
      materials: productDataFromModal.materials || [],
      colors: productDataFromModal.colors || [],
      sizes: productDataFromModal.sizes || [],
    };

    // Ensure rating is a valid number between 0-5
    if (productData.rating !== undefined) {
      productData.rating = Math.min(5, Math.max(0, Number(productData.rating)));
      // Round to 1 decimal place for consistency
      productData.rating = Math.round(productData.rating * 10) / 10;
    }

    console.log("Sending product data with rating:", {
      ...productData,
      rating: productData.rating,
      ratingType: typeof productData.rating
    });

    const response = await axios.post(
      `${API_BASE_URL}/products`,
      productData,
      { headers: getAuthHeaders() },
    );

    if (response.data.success) {
      fetchProducts();
      setShowAddModal(false);
      alert(response.data.message || "Product added successfully!");
    }
  } catch (err) {
    console.error("Error adding product:", err);
    alert(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to add product",
    );
  } finally {
    setActionLoading(false);
  }
};

// Handle updating product
const handleUpdateProduct = async (productData) => {
  try {
    setActionLoading(true);

    if (!editingProduct?._id) {
      alert("No product selected for update");
      return;
    }

    // FIXED: Include rating in update as well
    const updateData = {
      ...productData,
      // Ensure rating is properly formatted for update
      rating: productData.rating !== undefined 
        ? Math.min(5, Math.max(0, parseFloat(productData.rating) || 4.0))
        : editingProduct.rating || 4.0
    };

    console.log("Updating product with rating:", {
      id: editingProduct._id,
      rating: updateData.rating
    });

    const response = await axios.put(
      `${API_BASE_URL}/products/${editingProduct._id}`,
      updateData,
      { headers: getAuthHeaders() },
    );

    if (response.data.success) {
      fetchProducts();
      setEditingProduct(null);
      setShowEditModal(false);
      alert(response.data.message || "Product updated successfully!");
    }
  } catch (err) {
    console.error("Error updating product:", err);
    alert(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update product",
    );
  } finally {
    setActionLoading(false);
  }
};

// Handle deleting product (no changes needed here)
const handleDeleteProduct = async () => {
  try {
    setActionLoading(true);

    if (!selectedProduct?._id) {
      alert("No product selected for deletion");
      return;
    }

    const response = await axios.delete(
      `${API_BASE_URL}/products/${selectedProduct._id}`,
      { headers: getAuthHeaders() },
    );

    if (response.data.success) {
      fetchProducts();
      setSelectedProduct(null);
      setShowDeleteModal(false);
      alert(response.data.message || "Product deleted successfully!");
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    alert(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete product",
    );
  } finally {
    setActionLoading(false);
  }
};

  // ==================== MODAL HANDLERS ====================

  // Handle opening edit modal
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle opening delete modal
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Handle opening view modal
  const handleViewClick = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchProducts();
    fetchCategories();
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Product Management
            </h1>
            <button
              onClick={handleRefresh}
              disabled={loading || actionLoading}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Manage your products, inventory, and listings
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Showing {pagination.count} of {pagination.totalItems} products
            </span>
            {pagination.totalPages > 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* User role badge */}
          {currentUser && (
            <div
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                currentUser.role === "admin" ||
                currentUser.role === "superadmin"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {currentUser.role === "admin" || currentUser.role === "superadmin"
                ? "Admin"
                : "Artisan"}
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            disabled={actionLoading}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCards 
          totalProducts={summaryStats.totalProducts || 0}
          totalSales={summaryStats.totalSales || 0}
          avgRating={summaryStats.avgRating || 0}
          activeProducts={summaryStats.activeProducts || 0}
          outOfStockProducts={summaryStats.outOfStockProducts || 0}
          pendingApprovalProducts={summaryStats.pendingApprovalProducts || 0}
          lowStockProducts={summaryStats.lowStockProducts || 0}
          totalValue={summaryStats.totalValue || 0}
          totalStock={summaryStats.totalStock || 0}
          avgPrice={summaryStats.avgPrice || 0}
          minPrice={summaryStats.minPrice || 0}
          maxPrice={summaryStats.maxPrice || 0}
        />
      </div>

      {/* Quick Filter Buttons - Hide for non-admin users */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'artisan') && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFilter("active")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filters.status === 'active' && filters.approvalStatus === 'approved' && !filters.lowStock
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Active Products
          </button>
          <button
            onClick={() => handleQuickFilter("pending")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filters.approvalStatus === 'pending' && !filters.lowStock
                ? "bg-yellow-600 text-white"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => handleQuickFilter("outOfStock")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filters.inStock === 'false'
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            Out of Stock
          </button>
          <button
            onClick={() => handleQuickFilter("lowStock")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filters.lowStock
                ? "bg-orange-600 text-white"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
          >
            Low Stock
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-8">
        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          filteredProductsCount={products.length}
          loading={loading}
          currentUser={currentUser}
          onResetFilters={handleClearAll}
          onExport={handleExportProducts}
        />
      </div>

      {/* Products Grid with Pagination */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm ||
            selectedCategory !== "all" ||
            Object.values(filters).some((f) => f !== "all" && f !== "")
              ? "No products match your current filters. Try adjusting your search criteria."
              : currentUser?.role === 'artisan' 
                ? "You haven't added any products yet. Start by adding your first product!"
                : "No products available at the moment."}
          </p>
          {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'artisan') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Active Filters Display */}
          {(filters.lowStock || filters.inStock === 'false' || filters.status !== 'all' || filters.approvalStatus !== 'all') && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.lowStock && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Low Stock
                  </span>
                )}
                {filters.inStock === 'false' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Out of Stock
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Status: {filters.status}
                  </span>
                )}
                {filters.approvalStatus !== 'all' && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Approval: {filters.approvalStatus}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={() => handleEditClick(product)}
                onDelete={() => handleDeleteClick(product)}
                onView={() => handleViewClick(product)}
                currentUser={currentUser}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center flex-wrap gap-2">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.totalPages - 2
                    ) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          pagination.currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <span className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddProductModal
  showAddModal={showAddModal}
  setShowAddModal={setShowAddModal}
  categories={categories}
  actionLoading={actionLoading}
  handleAddProduct={handleAddProduct}
  currentUser={currentUser}
  artisans={artisans}
  loadingArtisans={loadingArtisans}
/>

      <EditProductModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        categories={categories}
        actionLoading={actionLoading}
        handleUpdateProduct={handleUpdateProduct}
        artisans={artisans}
        currentUser={currentUser}
      />

      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedProduct={selectedProduct}
        actionLoading={actionLoading}
        handleDeleteProduct={handleDeleteProduct}
      />

      <ViewProductModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedProduct={selectedProduct}
      />
    </div>
  );
};

export default ProductManagement;