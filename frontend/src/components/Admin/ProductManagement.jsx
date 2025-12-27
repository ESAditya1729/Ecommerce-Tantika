// ProductManagement.jsx (Updated with EditProductModal)
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Package } from 'lucide-react';
import axios from 'axios';
import AddProductModal from '../Modals/AddProductModal';
import EditProductModal from '../Modals/EditProductModal';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';
import ViewProductModal from '../Modals/ViewProductModal';
import ProductCard from './Product-Management/ProductCard.jsx';
import ProductFilters from './Product-Management/ProductFilters.jsx';
import SummaryCards from './Product-Management/SummaryCards';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers using logged-in user's credentials
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || 
                sessionStorage.getItem('token');
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Content-Type': 'application/json'
  };
};

const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [summaryStats, setSummaryStats] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    images: [],
    image: '',
    status: 'active',
    rating: '',
    sales: ''
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(
        `${API_BASE_URL}/products?${params}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        setProducts(response.data.products);
        setSummaryStats(response.data.summary);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/categories`,
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
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
      if (searchTerm !== '' || selectedCategory !== 'all') {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  // Handle adding new product
  const handleAddProduct = async () => {
    try {
      setActionLoading(true);
      
      // Validate required fields
      if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.image) {
        alert('Please fill in all required fields (*)');
        return;
      }

      // Prepare product data with images
      const productData = {
        name: newProduct.name,
        description: newProduct.description || '',
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
        images: newProduct.images || [],
        image: newProduct.image || (newProduct.images && newProduct.images[0]) || '',
        status: newProduct.status,
        rating: parseFloat(newProduct.rating) || 0,
        sales: parseInt(newProduct.sales) || 0
      };

      const response = await axios.post(
        `${API_BASE_URL}/products`, 
        productData, 
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh products list
        fetchProducts();
        // Reset form and close modal
        setNewProduct({
          name: '',
          description: '',
          category: '',
          price: '',
          stock: '',
          images: [],
          image: '',
          status: 'active',
          rating: '',
          sales: ''
        });
        setShowAddModal(false);
        alert('Product added successfully!');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert(err.response?.data?.message || 'Failed to add product');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update product
  const handleUpdateProduct = async () => {
    try {
      setActionLoading(true);
      
      // Validate required fields
      if (!editingProduct.name || !editingProduct.category || !editingProduct.price || !editingProduct.image) {
        alert('Please fill in all required fields (*)');
        return;
      }

      // Prepare product data with images
      const productData = {
        name: editingProduct.name,
        description: editingProduct.description || '',
        category: editingProduct.category,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock) || 0,
        images: editingProduct.images || [],
        image: editingProduct.image || (editingProduct.images && editingProduct.images[0]) || '',
        status: editingProduct.status,
        rating: parseFloat(editingProduct.rating) || 0,
        sales: parseInt(editingProduct.sales) || 0
      };

      const response = await axios.put(
        `${API_BASE_URL}/products/${editingProduct._id}`, 
        productData, 
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh products list
        fetchProducts();
        // Close modal
        setShowEditModal(false);
        setEditingProduct(null);
        alert('Product updated successfully!');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert(err.response?.data?.message || 'Failed to update product');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete product with Cloudinary cleanup
  const handleDeleteProduct = async () => {
    try {
      setActionLoading(true);
      
      const response = await axios.delete(
        `${API_BASE_URL}/products/${selectedProduct._id}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        // Refresh products list
        fetchProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
        alert('Product deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update stock
  const handleUpdateStock = async (productId, newStock) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${productId}/stock`,
        { stock: newStock },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        fetchProducts();
        alert('Stock updated successfully!');
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      alert(err.response?.data?.message || 'Failed to update stock');
    }
  };

  // Handle export products
  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/export`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        // Convert to CSV and download
        const csvData = response.data.data;
        const csvHeaders = Object.keys(csvData[0] || {});
        const csvRows = csvData.map(row => 
          csvHeaders.map(header => JSON.stringify(row[header] || '')).join(',')
        );
        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting products:', err);
      alert('Failed to export products');
    }
  };

  // Handle bulk update prices
  const handleBulkUpdatePrices = async () => {
    try {
      const percentage = prompt('Enter percentage increase/decrease (e.g., 10 for +10%, -5 for -5%):');
      if (percentage === null || percentage.trim() === '') return;

      const percent = parseFloat(percentage);
      if (isNaN(percent)) {
        alert('Please enter a valid number');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/products/bulk/update`,
        {
          ids: products.map(p => p._id),
          updateData: {
            price: { $mul: 1 + (percent / 100) }
          }
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        fetchProducts();
        alert(`${response.data.modifiedCount} products updated successfully!`);
      }
    } catch (err) {
      console.error('Error in bulk update:', err);
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  // Helper functions
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    fetchProducts();
  };

  // Filter products locally
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Event handlers for summary cards
  const handleLowStockAlert = () => {
    const lowStockProducts = products.filter(p => p.stock < 5 && p.stock > 0);
    alert(`${lowStockProducts.length} products have low stock`);
  };

  const handleOutOfStockAlert = () => {
    const outOfStockProducts = products.filter(p => p.stock === 0);
    alert(`${outOfStockProducts.length} products are out of stock`);
  };

  // Product card event handlers
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      images: product.images || [product.image].filter(Boolean)
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleManageStock = (product) => {
    const newStock = prompt(`Enter new stock quantity for ${product.name}:`, product.stock);
    if (newStock !== null && !isNaN(newStock)) {
      handleUpdateStock(product._id, parseInt(newStock));
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your products, inventory, and listings</p>
          {summaryStats && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Total: {summaryStats.totalProducts} products</span>
              <span>•</span>
              <span>Total Sales: {summaryStats.totalSales || 0}</span>
              <span>•</span>
              <span>Avg Rating: {summaryStats.avgRating ? summaryStats.avgRating.toFixed(1) : '0.0'}/5.0</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={actionLoading}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onResetFilters={resetFilters}
        onExport={handleExport}
        filteredProductsCount={filteredProducts.length}
        loading={loading}
      />

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first product</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              onManageStock={handleManageStock}
            />
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards
        products={products}
        summaryStats={summaryStats}
        onLowStockAlert={handleLowStockAlert}
        onOutOfStockAlert={handleOutOfStockAlert}
      />

      {/* Bulk Actions */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="font-bold text-gray-900 mb-4">Bulk Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-lg mb-2">📤</div>
            <span className="font-medium text-gray-900">Bulk Export</span>
          </button>
          <button 
            onClick={handleBulkUpdatePrices}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-lg mb-2">🏷️</div>
            <span className="font-medium text-gray-900">Update Prices</span>
          </button>
          <button className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center">
            <div className="text-lg mb-2">📊</div>
            <span className="font-medium text-gray-900">Stock Report</span>
          </button>
          <button className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center">
            <div className="text-lg mb-2">🔄</div>
            <span className="font-medium text-gray-900">Sync Inventory</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        actionLoading={actionLoading}
        handleAddProduct={handleAddProduct}
      />

      <EditProductModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        categories={categories}
        actionLoading={actionLoading}
        handleUpdateProduct={handleUpdateProduct}
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