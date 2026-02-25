// frontend\src\components\ArtisanDashboard\ProductsTab.jsx
import React, { useState, useEffect } from "react";
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
  DollarSign
} from "lucide-react";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";

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
  
  // Simple summary object with only primitive values - NO categoryBreakdown
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
  const itemsPerPage = 8;

  // API Base URL - adjust based on your environment
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
        // Extract just the category names from the objects
        const categoryNames = result.data
          .filter(cat => cat.name !== "All") // Filter out "All" if needed
          .map(cat => cat.name); // Extract only the name property
          
        setCategories(categoryNames);
        console.log('Extracted category names:', categoryNames);
      } else {
        // Fallback to hardcoded categories if API fails
        setCategories([
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
      // Fallback to hardcoded categories
      setCategories([
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
  }, [artisan, currentPage, filterStatus, filterApproval, searchTerm]);

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

      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterApproval !== 'all') params.append('approvalStatus', filterApproval);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/artisan/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('API Response:', result); // Log to see the full response

      if (result.success) {
        setProducts(result.data.products || []);
        
        // Extract ONLY primitive values from summary, ignore any nested objects
        const apiSummary = result.data.summary || {};
        setSummary({
          totalValue: typeof apiSummary.totalValue === 'number' ? apiSummary.totalValue : 0,
          totalSales: typeof apiSummary.totalSales === 'number' ? apiSummary.totalSales : 0,
          totalRevenue: typeof apiSummary.totalRevenue === 'number' ? apiSummary.totalRevenue : 0,
          lowStockCount: typeof apiSummary.lowStockCount === 'number' ? apiSummary.lowStockCount : 0,
          outOfStockCount: typeof apiSummary.outOfStockCount === 'number' ? apiSummary.outOfStockCount : 0
        });
        
        // IMPORTANT: Do NOT store categoryBreakdown in state to avoid rendering objects
        // If you need to display category breakdown, create a separate state for it
        // and ensure you're mapping over it correctly
        
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
      // Set empty states on error
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

      const response = await fetch(`${API_BASE_URL}/artisan/products`, {
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

      const response = await fetch(`${API_BASE_URL}/artisan/products/${productData._id}`, {
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
        
        // Show appropriate success message based on approval status change
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

      const response = await fetch(`${API_BASE_URL}/artisan/products/${productId}`, {
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

  const handleEditProduct = (product) => {
    // Only allow editing for draft or rejected products
    if (product.approvalStatus === 'approved') {
      alert('Approved products cannot be edited directly. Please contact admin for changes.');
      return;
    }
    
    // Ensure all required fields are present and are primitive values
    const productToEdit = {
      ...product,
      // Ensure all fields are primitive values
      _id: product._id || product.id || '',
      name: String(product.name || ''),
      description: String(product.description || ''),
      category: String(product.category || ''),
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      rating: Number(product.rating) || 4.0,
      sales: Number(product.sales) || 0,
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

  const handleViewProduct = (product) => {
    window.open(`/product/${product._id}`, '_blank');
  };

  const getStatusBadge = (status, approvalStatus) => {
    const badges = {
      approved: { 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        icon: CheckCircle, 
        label: 'Approved',
        bgColor: 'bg-emerald-500'
      },
      pending: { 
        color: 'bg-amber-50 text-amber-700 border-amber-200', 
        icon: Clock, 
        label: 'Pending',
        bgColor: 'bg-amber-500'
      },
      rejected: { 
        color: 'bg-rose-50 text-rose-700 border-rose-200', 
        icon: XCircle, 
        label: 'Rejected',
        bgColor: 'bg-rose-500'
      },
      draft: { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        icon: AlertCircle, 
        label: 'Draft',
        bgColor: 'bg-gray-500'
      },
      outOfStock: {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: AlertCircle,
        label: 'Out of Stock',
        bgColor: 'bg-purple-500'
      }
    };

    if (approvalStatus === 'approved' && status === 'active') {
      return badges.approved;
    } else if (approvalStatus === 'pending') {
      return badges.pending;
    } else if (approvalStatus === 'rejected') {
      return badges.rejected;
    } else if (status === 'out_of_stock') {
      return badges.outOfStock;
    } else {
      return badges.draft;
    }
  };

  const formatCurrency = (amount) => {
    // Ensure amount is a number
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  // Calculate stats safely using only primitive values
  const stats = {
    total: totalProducts || 0,
    approved: Array.isArray(products) ? products.filter(p => p?.approvalStatus === 'approved').length : 0,
    pending: Array.isArray(products) ? products.filter(p => p?.approvalStatus === 'pending').length : 0,
    rejected: Array.isArray(products) ? products.filter(p => p?.approvalStatus === 'rejected').length : 0,
    lowStock: summary.lowStockCount || 0,
    outOfStock: summary.outOfStockCount || 0,
    totalValue: summary.totalValue || 0,
    totalSales: summary.totalSales || 0,
    totalRevenue: summary.totalRevenue || 0
  };

  // Check if product can be edited
  const canEditProduct = (product) => {
    return product && product.approvalStatus !== 'approved';
  };

  // Check if product can be deleted
  const canDeleteProduct = (product) => {
    return product && product.approvalStatus !== 'approved';
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Package size={16} className="text-amber-500" />
              Manage your handmade creations • {stats.total} total products
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="p-2.5 text-gray-600 hover:bg-amber-50 rounded-xl transition-all duration-200 hover:shadow-md"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="mr-2" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Stats Cards - Using only primitive values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
              <Package size={14} /> Total Products
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-200">
            <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle size={14} /> Approved
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-amber-200">
            <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
              <Clock size={14} /> Pending
            </p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-rose-200">
            <p className="text-sm text-rose-600 font-medium flex items-center gap-1">
              <XCircle size={14} /> Rejected
            </p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-200">
            <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
              <TrendingUp size={14} /> Inventory Value
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-orange-700">
                <span className="font-semibold">{stats.lowStock}</span> product(s) have low stock (≤5 items). 
                {stats.outOfStock > 0 && (
                  <span className="ml-1">
                    <span className="font-semibold">{stats.outOfStock}</span> product(s) are out of stock.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">Filter:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select
              value={filterApproval}
              onChange={(e) => {
                setFilterApproval(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white text-sm"
            >
              <option value="all">All Approval</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-16">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading your products...</p>
          </div>
        </div>
      ) : !Array.isArray(products) || products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-16">
          <div className="text-center">
            <div className="relative inline-block">
              <Package className="h-20 w-20 text-amber-300 mx-auto" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' || filterApproval !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Start your journey by adding your first handmade product to showcase your talent.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterApproval === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Product
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => {
              // Skip if product is null or undefined
              if (!product) return null;
              
              const statusBadge = getStatusBadge(product.status, product.approvalStatus);
              const StatusIcon = statusBadge.icon;
              const canEdit = canEditProduct(product);
              const canDelete = canDeleteProduct(product);
              
              return (
                <div
                  key={product._id || product.id || Math.random()}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-100 overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Product Image Container */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                      }}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusBadge.color} backdrop-blur-sm bg-opacity-90 shadow-sm`}>
                        <StatusIcon size={10} className="mr-1" />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Stock Indicator */}
                    {product.stock !== undefined && product.stock <= 5 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium text-center ${
                          product.stock === 0 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-amber-500 text-white'
                        } shadow-lg backdrop-blur-sm bg-opacity-90`}>
                          {product.stock === 0 ? 'Out of Stock' : `Only ${product.stock} left`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 flex-1">
                        {product.name || 'Unnamed Product'}
                      </h3>
                      <div className="flex items-center ml-2 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-700 ml-0.5">
                          {(product.rating || 4.0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 h-8">
                      {product.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        {product.category || 'Uncategorized'}
                      </span>
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <TrendingUp size={12} className="text-emerald-500" />
                        Sold: {product.sales || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">Price</span>
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="View Product"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                            canEdit
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={canEdit ? 'Edit Product' : 'Cannot edit approved products'}
                          disabled={!canEdit}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id || product.id)}
                          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                            canDelete
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={canDelete ? 'Delete Product' : 'Cannot delete approved products'}
                          disabled={!canDelete}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {product.approvalStatus === 'rejected' && product.rejectionReason && (
                      <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-200">
                        <p className="text-xs text-rose-600">
                          <span className="font-medium">Reason: </span>
                          {product.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Submission Date */}
                    {product.createdAt && (
                      <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(product.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-amber-600">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-semibold text-amber-600">{Math.min(currentPage * itemsPerPage, totalProducts)}</span> of{' '}
                  <span className="font-semibold text-amber-600">{totalProducts}</span> products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600 hover:shadow-md'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items gap-1">
                    {[...Array(Math.max(1, totalPages))].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === i + 1
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                            : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600 hover:shadow-md'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600 hover:shadow-md'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        actionLoading={actionLoading}
        handleAddProduct={handleAddProduct}
        categories={categories}
        currentUser={{ 
          role: 'artisan', 
          username: artisan?.username,
          artisanProfile: { 
            _id: artisan?.artisanId, 
            businessName: artisan?.username 
          } 
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        categories={categories}
        actionLoading={actionLoading}
        handleUpdateProduct={handleUpdateProduct}
      />
    </div>
  );
};

export default ProductsTab;