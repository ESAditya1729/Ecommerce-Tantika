// frontend\src\components\ArtisanDashboard\ProductsTab.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Grid,
  List,
  Layers,
  ChevronDown,
  X,
  EyeOff,
  Calendar,
  Tag,
  BarChart3,
  Heart,
  ShoppingCart,
  Percent,
  Award,
  Sparkles,
  Gem,
  Palette,
  Feather,
  Camera
} from "lucide-react";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import ProductCard from "./ProductCard";
import ProductListView from "./ProductListView";

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterApproval, setFilterApproval] = useState("all");
  const [artisan, setArtisan] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // Simple summary object with only primitive values
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = window.innerWidth < 768 ? 4 : 8;

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get auth token from localStorage
  const getToken = () => {
    return localStorage.getItem('tantika_token');
  };

  // Get artisan data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('tantika_user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setArtisan({
          id: parsedData.id,
          artisanId: parsedData.artisanId,
          username: parsedData.username,
          email: parsedData.email,
          phone: parsedData.phone,
          role: parsedData.role,
          isActive: parsedData.isActive,
          createdAt: parsedData.createdAt
        });
      } catch (error) {
        console.error('Error parsing artisan data:', error);
      }
    }
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        const categoryNames = result.data
          .filter(cat => cat.name !== "All")
          .map(cat => cat.name);
        setCategories(['All Categories', ...categoryNames]);
      } else {
        setCategories([
          "All Categories",
          "Home Decor",
          "Clothing",
          "Jewelry",
          "Accessories",
          "Art",
          "Kitchenware",
          "Others"
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        "All Categories",
        "Home Decor",
        "Clothing",
        "Jewelry",
        "Accessories",
        "Art",
        "Kitchenware",
        "Others"
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Call fetchCategories in useEffect
  useEffect(() => {
    if (artisan) {
      fetchProducts();
      fetchCategories();
    }
  }, [artisan]);

  // Fetch products when filters or page change
  useEffect(() => {
    if (artisan) {
      fetchProducts();
    }
  }, [artisan, currentPage, filterStatus, filterApproval, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      // Handle status filtering properly
      if (filterStatus !== 'all') {
        if (filterStatus === 'low_stock') {
          params.append('stockFilter', 'low');
        } else if (filterStatus === 'out_of_stock') {
          params.append('stockFilter', 'out');
        } else {
          params.append('status', filterStatus);
        }
      }

      if (filterApproval !== 'all') params.append('approvalStatus', filterApproval);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`${API_BASE_URL}/artisan/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        let fetchedProducts = result.data.products || [];
        
        // Apply low stock/out of stock filtering on frontend if needed
        if (filterStatus === 'low_stock') {
          fetchedProducts = fetchedProducts.filter(p => p.stock <= 5 && p.stock > 0);
        } else if (filterStatus === 'out_of_stock') {
          fetchedProducts = fetchedProducts.filter(p => p.stock < 5);
        }
        
        setProducts(fetchedProducts);
        
        const apiSummary = result.data.summary || {};
        setSummary({
          totalValue: typeof apiSummary.totalValue === 'number' ? apiSummary.totalValue : 0,
          totalSales: typeof apiSummary.totalSales === 'number' ? apiSummary.totalSales : 0,
          totalRevenue: typeof apiSummary.totalRevenue === 'number' ? apiSummary.totalRevenue : 0,
          lowStockCount: typeof apiSummary.lowStockCount === 'number' ? apiSummary.lowStockCount : 0,
          outOfStockCount: typeof apiSummary.outOfStockCount === 'number' ? apiSummary.outOfStockCount : 0
        });
        
        setTotalProducts(result.data.pagination?.total || 0);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        console.error('Failed to fetch products:', result.message);
        if (result.message === 'Authentication required') {
          console.error('Authentication failed - token might be expired');
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setSummary({
        totalValue: 0,
        totalSales: 0,
        totalRevenue: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      });
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    setActionLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.success) {
        setShowAddModal(false);
        fetchProducts();
        alert('Product submitted for admin approval successfully!');
      } else {
        alert(result.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async (productData) => {
    setActionLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products/${productData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        setEditingProduct(null);
        fetchProducts();
        
        if (productData.approvalStatus === 'pending' && productData.status === 'draft') {
          alert('Product updated successfully! Your changes have been submitted for admin approval.');
        } else {
          alert('Product updated successfully!');
        }
      } else {
        alert(result.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      const token = getToken();
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        fetchProducts();
        alert('Product deleted successfully');
      } else {
        alert(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleQuickStockUpdate = async (productId, newStock) => {
    setActionLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      });

      const result = await response.json();

      if (result.success) {
        fetchProducts();
        alert('Stock updated successfully!');
      } else {
        alert(result.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    if (product.approvalStatus === 'approved') {
      // For approved products, open a quick stock update modal instead
      handleQuickStockEdit(product);
      return;
    }
    
    const productToEdit = {
      ...product,
      _id: product._id || product.id || '',
      name: String(product.name || ''),
      description: String(product.description || ''),
      category: String(product.category || ''),
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      rating: Number(product.rating) || 4.0,
      sales: Number(product.sales) || 0,
      views: Number(product.views) || 0,
      image: String(product.image || ''),
      images: Array.isArray(product.images) ? product.images.map(img => String(img)) : [],
      approvalStatus: String(product.approvalStatus || 'draft'),
      status: String(product.status || 'draft'),
      rejectionReason: String(product.rejectionReason || ''),
      createdAt: product.createdAt || new Date().toISOString()
    };
    
    setEditingProduct(productToEdit);
    setShowEditModal(true);
  };

  const handleQuickStockEdit = (product) => {
    // Create a simplified product object for stock-only updates
    const stockEditProduct = {
      _id: product._id || product.id,
      name: product.name,
      stock: Number(product.stock) || 0,
      approvalStatus: product.approvalStatus
    };
    
    setEditingProduct(stockEditProduct);
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    window.open(`/product/${product._id}`, '_blank');
  };

  const getStatusBadge = (status, approvalStatus, stock) => {
    if (stock <= 5 && stock > 0) {
      return { 
        color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', 
        icon: AlertCircle, 
        label: 'Low Stock',
        bgColor: 'bg-orange-500'
      };
    }
    
    if (stock < 5) {
      return { 
        color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', 
        icon: XCircle, 
        label: 'Out of Stock',
        bgColor: 'bg-purple-500'
      };
    }
    
    if (approvalStatus === 'approved' && status === 'active') {
      return { 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', 
        icon: CheckCircle, 
        label: 'Approved',
        bgColor: 'bg-emerald-500'
      };
    } else if (approvalStatus === 'pending') {
      return { 
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', 
        icon: Clock, 
        label: 'Pending',
        bgColor: 'bg-amber-500'
      };
    } else if (approvalStatus === 'rejected') {
      return { 
        color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800', 
        icon: XCircle, 
        label: 'Rejected',
        bgColor: 'bg-rose-500'
      };
    } else if (status === 'draft') {
      return { 
        color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', 
        icon: AlertCircle, 
        label: 'Draft',
        bgColor: 'bg-gray-500'
      };
    }
    
    return { 
      color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', 
      icon: AlertCircle, 
      label: status || 'Draft',
      bgColor: 'bg-gray-500'
    };
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Jewelry': Gem,
      'Clothing': Feather,
      'Accessories': Sparkles,
      'Home Decor': Palette,
      'Art': Award,
      'Kitchenware': Package,
      'default': Tag
    };
    return icons[category] || icons.default;
  };

  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const stats = useMemo(() => {
    const productList = Array.isArray(products) ? products : [];
    
    return {
      total: totalProducts || 0,
      approved: productList.filter(p => p?.approvalStatus === 'approved').length,
      pending: productList.filter(p => p?.approvalStatus === 'pending').length,
      rejected: productList.filter(p => p?.approvalStatus === 'rejected').length,
      lowStock: productList.filter(p => p?.stock <= 5 && p?.stock > 0).length,
      outOfStock: productList.filter(p => p?.stock < 5).length,
      totalValue: summary.totalValue || 0,
      totalSales: summary.totalSales || 0,
      totalRevenue: summary.totalRevenue || 0,
      totalViews: productList.reduce((sum, p) => sum + (p.views || 0), 0)
    };
  }, [products, totalProducts, summary]);

  const canEditProduct = (product) => {
    return product && product.approvalStatus !== 'approved';
  };

  const canDeleteProduct = (product) => {
    return product && product.approvalStatus !== 'approved';
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterApproval("all");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats - Enhanced Design */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl shadow-xl border border-amber-100 dark:border-gray-700 p-4 sm:p-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">My Artisan Collection</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Handcrafted with love • {stats.total} unique creations</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchProducts}
                className="p-2 sm:p-2.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 hover:shadow-md border border-gray-200 dark:border-gray-600 touch-target group"
                title="Refresh"
              >
                <RefreshCw size={window.innerWidth < 640 ? 18 : 20} className={loading ? 'animate-spin text-amber-500' : 'group-hover:rotate-180 transition-transform duration-500'} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base touch-target group"
              >
                <Plus size={window.innerWidth < 640 ? 18 : 20} className="mr-1 sm:mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden xs:inline">Create New Masterpiece</span>
                <span className="xs:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
            <div className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Products in collection</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.approved}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Approved products</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">Pending</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting review</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">Low Stock</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.lowStock}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Items ≤5 in stock</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">Out of Stock</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.outOfStock}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Items with stock less than 5</p>
            </div>

            <div className="col-span-2 sm:col-span-1 group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-gray-700 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">Value</span>
              </div>
              <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">
                {formatCurrency(stats.totalValue)}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Inventory value</p>
            </div>
          </div>

          {/* Low Stock Alert - Enhanced */}
          {(stats.lowStock > 0 || stats.outOfStock > 0) && (
            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-lg sm:rounded-xl shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 font-medium">
                    <span className="font-bold text-orange-800 dark:text-orange-200">{stats.lowStock}</span> product(s) with low stock (≤5) and{' '}
                    <span className="font-bold text-purple-800 dark:text-purple-200">{stats.outOfStock}</span> out of stock (&lt;5)
                  </p>
                  <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                    Consider restocking soon to maintain availability
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFilterStatus('low_stock');
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  >
                    View Low Stock
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('out_of_stock');
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  >
                    View Out of Stock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar - Enhanced */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-amber-100 dark:border-gray-700 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5"></div>
        
        {/* Mobile Filter Toggle */}
        <div className="relative z-10 flex items-center gap-2 mb-3 sm:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-amber-200 dark:border-gray-600"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter size={16} className="text-amber-500" />
              Filters & Search
            </span>
            <ChevronDown size={16} className={`transform transition-transform text-amber-500 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-amber-200 dark:border-gray-600 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-amber-500'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-amber-500'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden sm:flex items-center gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-md text-amber-600' : 'text-gray-500 hover:text-amber-500'}`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-md text-amber-600' : 'text-gray-500 hover:text-amber-500'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className={`relative z-10 space-y-3 ${showFilters ? 'block' : 'hidden sm:block'}`}>
          {/* Search with Icon */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search your masterpieces..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-700 dark:text-white text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-full p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-700 dark:text-white text-sm flex-1 min-w-[120px]"
            >
              <option value="all">📦 All Status</option>
              <option value="active">✨ Active</option>
              <option value="draft">📝 Draft</option>
              <option value="low_stock">⚠️ Low Stock (≤5)</option>
              <option value="out_of_stock">❌ Out of Stock (&lt;5)</option>
            </select>
            
            <select
              value={filterApproval}
              onChange={(e) => {
                setFilterApproval(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-700 dark:text-white text-sm flex-1 min-w-[120px]"
            >
              <option value="all">🏷️ All Approval</option>
              <option value="approved">✅ Approved</option>
              <option value="pending">⏳ Pending</option>
              <option value="rejected">❌ Rejected</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-700 dark:text-white text-sm flex-1 min-w-[140px]"
            >
              {categories.map(cat => {
                const Icon = getCategoryIcon(cat);
                return (
                  <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>
                    {cat}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Filters with Chips */}
          {(searchTerm || filterStatus !== 'all' || filterApproval !== 'all' || selectedCategory !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs">
                  <Search size={12} />
                  {searchTerm}
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs">
                  <Package size={12} />
                  {filterStatus === 'low_stock' ? 'Low Stock (≤5)' : filterStatus === 'out_of_stock' ? 'Out of Stock (<5)' : filterStatus}
                </span>
              )}
              {filterApproval !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs">
                  <CheckCircle size={12} />
                  {filterApproval}
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs">
                  <Tag size={12} />
                  {selectedCategory}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid/List View */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-amber-100 dark:border-gray-700 p-8 sm:p-16">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500 animate-pulse" />
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-6 font-medium">Curating your masterpieces...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">This may take a moment</p>
          </div>
        </div>
      ) : !Array.isArray(products) || products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-amber-100 dark:border-gray-700 p-8 sm:p-16">
          <div className="text-center max-w-md mx-auto">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-amber-400 dark:text-amber-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Plus size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">No products found</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">
              {searchTerm || filterStatus !== 'all' || filterApproval !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Your creative journey starts here. Add your first masterpiece to showcase your talent to the world.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterApproval === 'all' && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base font-medium group"
              >
                <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Masterpiece
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Grid View with ProductCard subcomponent */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onQuickStockUpdate={handleQuickStockUpdate}
                  getStatusBadge={getStatusBadge}
                  getCategoryIcon={getCategoryIcon}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  canEditProduct={canEditProduct}
                  canDeleteProduct={canDeleteProduct}
                />
              ))}
            </div>
          )}

          {/* List View with ProductListView subcomponent */}
          {viewMode === 'list' && (
            <ProductListView
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onQuickStockUpdate={handleQuickStockUpdate}
              getStatusBadge={getStatusBadge}
              getCategoryIcon={getCategoryIcon}
              formatCurrency={formatCurrency}
              canEditProduct={canEditProduct}
              canDeleteProduct={canDeleteProduct}
            />
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl border border-amber-100 dark:border-gray-700 p-3 sm:p-4 mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  Showing <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {((currentPage - 1) * itemsPerPage) + 1}
                  </span> to{' '}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {Math.min(currentPage * itemsPerPage, totalProducts)}
                  </span> of{' '}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{totalProducts}</span> masterpieces
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 touch-target ${
                      currentPage === 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:shadow-md'
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-target ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-200 touch-target ${
                      currentPage === totalPages
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:shadow-md'
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        actionLoading={actionLoading}
        handleAddProduct={handleAddProduct}
        categories={categories.filter(c => c !== 'All Categories')}
        currentUser={{ 
          role: 'artisan', 
          username: artisan?.username,
          artisanProfile: { 
            _id: artisan?.artisanId, 
            businessName: artisan?.username 
          } 
        }}
      />

      <EditProductModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        categories={categories.filter(c => c !== 'All Categories')}
        actionLoading={actionLoading}
        handleUpdateProduct={handleUpdateProduct}
        stockOnlyMode={editingProduct?.approvalStatus === 'approved'}
      />
    </div>
  );
};

export default ProductsTab;