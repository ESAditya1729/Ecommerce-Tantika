// src/components/Modals/CreateOfferModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("tantika_token") || sessionStorage.getItem("tantika_token");
  if (!token) return { "Content-Type": "application/json" };
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const CreateOfferModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offerType: 'discount',
    scope: {
      type: 'all_products',
      products: [],
      categories: [],
      artisans: [],
      minimumPurchase: 0,
      minimumQuantity: 1,
    },
    rules: {
      discountType: 'percentage',
      discountValue: 0,
      buyXGetY: {
        enabled: false,
        buyQuantity: 1,
        getQuantity: 1,
        getDiscountPercent: 0,
      },
      tiers: [],
      usageLimits: {
        perUser: 1,
        perOrder: 1,
        totalUses: null,
      },
      stackingRules: {
        allowStacking: false,
        maxOffersPerOrder: 1,
        priority: 1,
      },
    },
    startDate: '',
    endDate: '',
    status: 'draft',
    isActive: false,
    priority: 0,
  });

  // Product selection state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  // Category selection state
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Artisan selection state
  const [artisans, setArtisans] = useState([]);
  const [selectedArtisans, setSelectedArtisans] = useState([]);

  const [errors, setErrors] = useState({});

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchCategories();
      fetchArtisans();
    }
  }, [isOpen]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products?limit=100`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        const categoriesData = response.data.data || response.data.categories || [];
        setCategories(categoriesData.map(cat => 
          typeof cat === 'string' ? cat : cat.name || 'Unknown'
        ));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch artisans
  const fetchArtisans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/artisans?status=approved`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        let artisansData = [];
        if (response.data.data && response.data.data.artisans) {
          artisansData = response.data.data.artisans;
        } else if (response.data.artisans) {
          artisansData = response.data.artisans;
        } else if (Array.isArray(response.data.data)) {
          artisansData = response.data.data;
        }
        setArtisans(artisansData);
      }
    } catch (error) {
      console.error('Error fetching artisans:', error);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleScopeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      scope: { ...prev.scope, [key]: value }
    }));
  };

  const handleRulesChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      rules: { ...prev.rules, [key]: value }
    }));
  };

  // Product selection handlers
  const handleProductSelect = (product) => {
    if (!selectedProducts.find(p => p._id === product._id)) {
      const newSelected = [...selectedProducts, product];
      setSelectedProducts(newSelected);
      // Update scope products
      handleScopeChange('products', newSelected.map(p => p._id));
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleProductRemove = (productId) => {
    const newSelected = selectedProducts.filter(p => p._id !== productId);
    setSelectedProducts(newSelected);
    handleScopeChange('products', newSelected.map(p => p._id));
  };

  // Category selection handlers
  const handleCategorySelect = (category) => {
    if (!selectedCategories.includes(category)) {
      const newSelected = [...selectedCategories, category];
      setSelectedCategories(newSelected);
      handleScopeChange('categories', newSelected);
    }
  };

  const handleCategoryRemove = (category) => {
    const newSelected = selectedCategories.filter(c => c !== category);
    setSelectedCategories(newSelected);
    handleScopeChange('categories', newSelected);
  };

  // Artisan selection handlers
  const handleArtisanSelect = (artisan) => {
    if (!selectedArtisans.find(a => a._id === artisan._id)) {
      const newSelected = [...selectedArtisans, artisan];
      setSelectedArtisans(newSelected);
      handleScopeChange('artisans', newSelected.map(a => a._id));
    }
  };

  const handleArtisanRemove = (artisanId) => {
    const newSelected = selectedArtisans.filter(a => a._id !== artisanId);
    setSelectedArtisans(newSelected);
    handleScopeChange('artisans', newSelected.map(a => a._id));
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Offer name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.rules.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }
    if (formData.rules.discountType === 'percentage' && formData.rules.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (formData.scope.type === 'specific_products' && selectedProducts.length === 0) {
      newErrors.scope = 'Please select at least one product';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Always use bulk endpoint - works for both single and multiple products
    if (formData.scope.type === 'specific_products' && selectedProducts.length > 0) {
      const productIds = selectedProducts.map(p => p._id);
      
      // Format dates properly for the API
      const formatDate = (dateStr) => {
        if (!dateStr) return undefined;
        // Convert to ISO string with timezone offset
        const date = new Date(dateStr);
        return date.toISOString();
      };
      
      const discountData = {
        productIds: productIds, // Send all product IDs (works for single too)
        discount: {
          type: formData.rules.discountType === 'percentage' ? 'percentage' : 'fixed',
          value: Number(formData.rules.discountValue),
          isActive: formData.isActive,
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
        }
      };
      
      console.log('Submitting discount data:', discountData);
      onSubmit(discountData);
    } else {
      alert('Please select at least one product');
    }
  };

  const getOfferTypes = () => [
    { value: 'discount', label: 'Discount' },
    { value: 'bundle', label: 'Bundle Deal' },
    { value: 'free_shipping', label: 'Free Shipping' },
    { value: 'gift_with_purchase', label: 'Gift with Purchase' },
    { value: 'flash_sale', label: 'Flash Sale' },
  ];

  const getScopeTypes = () => [
    { value: 'all_products', label: 'All Products' },
    { value: 'specific_products', label: 'Specific Products' },
    // { value: 'categories', label: 'Categories' },
    { value: 'artisans', label: 'Artisans' },
  ];

  const getDiscountTypes = () => [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'buy_x_get_y', label: 'Buy X Get Y' },
    { value: 'tiered_discount', label: 'Tiered Discount' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Create New Offer</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Summer Sale 2024"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Type *
                  </label>
                  <select
                    name="offerType"
                    value={formData.offerType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getOfferTypes().map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the offer"
                />
              </div>

              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Scope
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={formData.scope.type}
                      onChange={(e) => {
                        handleScopeChange('type', e.target.value);
                        // Clear selections when changing scope type
                        if (e.target.value === 'all_products') {
                          setSelectedProducts([]);
                          setSelectedCategories([]);
                          setSelectedArtisans([]);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getScopeTypes().map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min Purchase</label>
                      <input
                        type="number"
                        value={formData.scope.minimumPurchase}
                        onChange={(e) => handleScopeChange('minimumPurchase', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min Quantity</label>
                      <input
                        type="number"
                        value={formData.scope.minimumQuantity}
                        onChange={(e) => handleScopeChange('minimumQuantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Selection - Shows only when scope type is specific_products */}
                {formData.scope.type === 'specific_products' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Products *
                    </label>
                    
                    {/* Selected Products */}
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedProducts.map(product => (
                          <div key={product._id} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                            <span className="text-sm text-blue-700">{product.name}</span>
                            <button
                              type="button"
                              onClick={() => handleProductRemove(product._id)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Product Search Dropdown */}
                    <div className="relative">
                      <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                        <Search className="w-4 h-4 text-gray-400 ml-3" />
                        <input
                          type="text"
                          placeholder={loadingProducts ? "Loading products..." : "Search products by name, SKU, or category..."}
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                          className="w-full px-3 py-2 border-0 focus:ring-0 rounded-lg"
                          disabled={loadingProducts}
                        />
                      </div>
                      
                      {showProductDropdown && productSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                              <button
                                key={product._id}
                                type="button"
                                onClick={() => handleProductSelect(product)}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">({product.sku || 'No SKU'})</span>
                                </div>
                                <span className="text-xs text-gray-400">{product.category}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No products found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {errors.scope && (
                      <p className="mt-1 text-sm text-red-600">{errors.scope}</p>
                    )}
                  </div>
                )}

                {/* Category Selection - Shows only when scope type is categories */}
                {formData.scope.type === 'categories' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Categories *
                    </label>
                    
                    {/* Selected Categories */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCategories.map(category => (
                          <div key={category} className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                            <span className="text-sm text-green-700">{category}</span>
                            <button
                              type="button"
                              onClick={() => handleCategoryRemove(category)}
                              className="text-green-500 hover:text-green-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            selectedCategories.includes(category)
                              ? 'bg-green-100 border-green-400 text-green-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {errors.scope && (
                      <p className="mt-1 text-sm text-red-600">{errors.scope}</p>
                    )}
                  </div>
                )}

                {/* Artisan Selection - Shows only when scope type is artisans */}
                {formData.scope.type === 'artisans' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Artisans *
                    </label>
                    
                    {/* Selected Artisans */}
                    {selectedArtisans.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedArtisans.map(artisan => (
                          <div key={artisan._id} className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1">
                            <span className="text-sm text-purple-700">
                              {artisan.businessName || artisan.fullName || artisan.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleArtisanRemove(artisan._id)}
                              className="text-purple-500 hover:text-purple-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {artisans.map(artisan => (
                        <button
                          key={artisan._id}
                          type="button"
                          onClick={() => handleArtisanSelect(artisan)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                            selectedArtisans.find(a => a._id === artisan._id)
                              ? 'bg-purple-100 border-purple-400 text-purple-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {artisan.businessName || artisan.fullName || artisan.name}
                        </button>
                      ))}
                    </div>
                    {errors.scope && (
                      <p className="mt-1 text-sm text-red-600">{errors.scope}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Discount Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Rules
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={formData.rules.discountType}
                      onChange={(e) => handleRulesChange('discountType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getDiscountTypes().map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.rules.discountValue}
                      onChange={(e) => handleRulesChange('discountValue', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.discountValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={formData.rules.discountType === 'percentage' ? 'Percentage (e.g., 20)' : 'Amount (e.g., 500)'}
                    />
                    {errors.discountValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (Higher = More Important)
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Activate immediately
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal;