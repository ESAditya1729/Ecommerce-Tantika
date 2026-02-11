// components/ProductFilters.jsx
import React from 'react';
import { Search, Filter, Download, X, Sliders } from 'lucide-react';

const ProductFilters = ({
  searchTerm = '',
  setSearchTerm = () => {},
  selectedCategory = 'all',
  setSelectedCategory = () => {},
  categories = [],
  onResetFilters = () => {},
  onExport = () => {},
  filteredProductsCount = 0,
  loading = false,
  filters = {},
  onFilterChange = () => {},
  currentUser = null
}) => {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : ['all'];
  
  // Check if any filters are active (excluding default values)
  const isAnyFilterActive = 
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    filters.status !== 'all' ||
    filters.approvalStatus !== 'all' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.inStock !== 'all';

  // Handle status filter change
  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  // Handle approval status filter change
  const handleApprovalChange = (e) => {
    onFilterChange({ approvalStatus: e.target.value });
  };

  // Handle price filter changes
  const handleMinPriceChange = (e) => {
    const value = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
    onFilterChange({ minPrice: value });
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
    onFilterChange({ maxPrice: value });
  };

  // Handle stock filter change
  const handleStockChange = (e) => {
    onFilterChange({ inStock: e.target.value });
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    onFilterChange({
      status: 'all',
      approvalStatus: 'all',
      minPrice: '',
      maxPrice: '',
      inStock: 'all'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sliders className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
          {isAnyFilterActive && (
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>
        
        {isAnyFilterActive && (
          <button
            onClick={handleClearAll}
            className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Search and Category Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
            {searchTerm && (
              <span className="ml-2 text-xs text-gray-500">
                ({searchTerm.length} characters)
              </span>
            )}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name, description, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
              aria-label="Search products"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            aria-label="Select category"
          >
            {safeCategories.map((category, index) => (
              <option 
                key={typeof category === 'string' ? category : category.name || index} 
                value={typeof category === 'string' ? category : category.name || 'all'}
              >
                {category === 'all' ? 'All Categories' : 
                 typeof category === 'string' ? category : 
                 category.name || 'Unknown'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Status Filter - Only show for admin/artisan */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'artisan') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={handleStatusChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              aria-label="Filter by product status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="archived">Archived</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        )}

        {/* Approval Status Filter - Only for admin */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Status
            </label>
            <select
              value={filters.approvalStatus || 'all'}
              onChange={handleApprovalChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              aria-label="Filter by approval status"
            >
              <option value="all">All Approval Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        )}

        {/* Stock Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Availability
          </label>
          <select
            value={filters.inStock || 'all'}
            onChange={handleStockChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            aria-label="Filter by stock availability"
          >
            <option value="all">All Stock Status</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
            {(filters.minPrice || filters.maxPrice) && (
              <span className="ml-2 text-xs text-gray-500">
                {filters.minPrice && `Min: ₹${filters.minPrice}`}
                {filters.minPrice && filters.maxPrice && ' - '}
                {filters.maxPrice && `Max: ₹${filters.maxPrice}`}
              </span>
            )}
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={handleMinPriceChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                aria-label="Minimum price"
              />
            </div>
            <div className="flex items-center text-gray-400">-</div>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={handleMaxPriceChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {isAnyFilterActive && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center mb-2">
            <Filter className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  aria-label="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Status: {filters.status}
                <button
                  onClick={() => onFilterChange({ status: 'all' })}
                  className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  aria-label="Remove status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.approvalStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Approval: {filters.approvalStatus}
                <button
                  onClick={() => onFilterChange({ approvalStatus: 'all' })}
                  className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  aria-label="Remove approval status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Price: {filters.minPrice ? `₹${filters.minPrice}` : 'Any'} - {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
                <button
                  onClick={() => onFilterChange({ minPrice: '', maxPrice: '' })}
                  className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  aria-label="Remove price filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.inStock !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Stock: {filters.inStock === 'true' ? 'In Stock' : 'Out of Stock'}
                <button
                  onClick={() => onFilterChange({ inStock: 'all' })}
                  className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  aria-label="Remove stock filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onResetFilters || handleClearAll}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={!isAnyFilterActive}
            aria-label="Reset all filters"
          >
            <Filter className="w-5 h-5 mr-2" />
            Reset Filters
          </button>
          <button 
            onClick={onExport}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Export products"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
        
        <div className="flex items-center">
          {loading ? (
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              Loading...
            </div>
          ) : (
            <div className="text-sm">
              <span className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProductsCount.toLocaleString()}</span> products
              </span>
              {isAnyFilterActive && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Filtered
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default props for safety
ProductFilters.defaultProps = {
  searchTerm: '',
  setSearchTerm: () => {},
  selectedCategory: 'all',
  setSelectedCategory: () => {},
  categories: ['all'],
  onResetFilters: () => {},
  onExport: () => {},
  filteredProductsCount: 0,
  loading: false,
  filters: {},
  onFilterChange: () => {},
  currentUser: null
};

export default ProductFilters;